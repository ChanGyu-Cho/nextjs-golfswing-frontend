"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ReceiveResult from "./components/ReceiveResult";

export default function ClientReceive() {
  const searchParams = useSearchParams();
  const jobId = searchParams?.get("job_id") || undefined;
  const accessTokenParam = searchParams?.get("access_token") || undefined;
  const debugResultUrl = searchParams?.get("debug_result_url") || undefined;

  const [status, setStatus] = useState<string>(jobId ? `대기 중: Job ${jobId}` : "Job ID 없음");
  const [resultUrls, setResultUrls] = useState<string[] | null>(null);
  const [resultContents, setResultContents] = useState<Array<{ url: string; type: string; content: any }> | null>(null);
  const [parsedResultJson, setParsedResultJson] = useState<any | null>(null);
  const [lastStatusResponse, setLastStatusResponse] = useState<any | null>(null);
  const [lastStatusFetchError, setLastStatusFetchError] = useState<string | null>(null);
  const [wsLastMessage, setWsLastMessage] = useState<any | null>(null);
  const [autoReloaded, setAutoReloaded] = useState(false);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const wsRegisteredRef = useRef(false);
  const skipPollingRef = useRef(false);

  // Polling: 주기적으로 /api/result/status?job_id=... 호출
  useEffect(() => {
    // Dev helper: if debug_result_url is provided, skip polling and fetch that URL as result
    if (debugResultUrl) {
      try {
        setResultUrls([debugResultUrl]);
        // ensure parsed JSON will be fetched by existing effect
      } catch (_) {}
    }
  }, [debugResultUrl]);

  
  useEffect(() => {
    if (!jobId) return;
    if (skipPollingRef.current) return; // WS already handling updates
    let cancelled = false;

    const poll = async () => {
      try {
        // If an access_token was provided in the URL, use it for Authorization header.
        const headers: any = {};
        const fetchOpts: any = { method: 'GET' };
        if (accessTokenParam) {
          headers['Authorization'] = `Bearer ${accessTokenParam}`;
          fetchOpts.headers = headers;
        } else {
          // default behavior: rely on HttpOnly cookies via credentials
          fetchOpts.credentials = 'include';
        }
        const resp = await fetch(`/api/result/status?job_id=${encodeURIComponent(jobId)}`, fetchOpts);
        if (!resp.ok) {
          if (resp.status === 404) {
            setStatus('Job not found');
            return;
          }
          throw new Error(`status fetch failed: ${resp.status}`);
        }
        const j = await resp.json();
        setLastStatusResponse(j);
        setLastStatusFetchError(null);
        setStatus(j.status || 'pending');
        if (j.status === 'COMPLETED' && (j.result_urls || j.result_url)) {
          const urls = j.result_urls || (j.result_url ? [j.result_url] : []);
          // If backend provided cached result_contents, prefer those to avoid CORS
          if (j.result_contents && typeof j.result_contents === 'object') {
            const contents = [] as Array<{ url: string; type: string; content: any }>;
            for (const u of urls) {
              if (j.result_contents[u] !== undefined) {
                const val = j.result_contents[u];
                // heuristics: if object -> json, if string -> text
                if (typeof val === 'object') {
                  contents.push({ url: u, type: 'json', content: val });
                } else if (typeof val === 'string') {
                  // if looks like JSON string, try parse
                  try {
                    const parsed = JSON.parse(val);
                    contents.push({ url: u, type: 'json', content: parsed });
                  } catch (_) {
                    contents.push({ url: u, type: 'text', content: val });
                  }
                } else {
                  contents.push({ url: u, type: 'text', content: String(val) });
                }
              } else {
                contents.push({ url: u, type: 'link', content: null });
              }
            }
            setResultContents(contents);
          }
          setResultUrls(urls);
          setStatus('COMPLETED');
          // If we don't yet have cached contents and haven't auto-reloaded,
          // trigger a one-time full reload to ensure updated client/runtime
          // picks up any deployed API routes or assets (CloudFront edge cases).
          // If we don't yet have cached contents and haven't auto-reloaded,
          // trigger a one-time full reload to ensure updated client/runtime
          // picks up any deployed API routes or assets (CloudFront edge cases).
          // Use a query param `auto_reloaded=1` to avoid infinite reload loops.
          const alreadyAutoReloaded = searchParams?.get('auto_reloaded') === '1';
          if (!autoReloaded && (!j.result_contents || Object.keys(j.result_contents).length === 0) && !alreadyAutoReloaded) {
            setAutoReloaded(true);
            try {
              // small delay so UI shows 'COMPLETED' before reload
              setTimeout(() => {
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.set('auto_reloaded', '1');
                  // replace location so history isn't flooded with reload entries
                  window.location.replace(url.toString());
                } catch (e) {
                  // fallback to simple reload if URL manipulation fails
                  window.location.reload();
                }
              }, 700);
            } catch (_) {
              // ignore failures
            }
          }
          return; // stop polling
        }
      } catch (e) {
        console.error('poll error', e);
        setLastStatusFetchError(String(e));
        setStatus((s) => s + '\n폴링 오류');
      }

      if (!cancelled) setTimeout(poll, 3000); // 3초마다 폴링
    };

    poll();
    return () => { cancelled = true; };
  }, [jobId]);


  // WebSocket: try to open a WS and register this job_id so server can push results.
  useEffect(() => {
    if (!jobId) return;
    // If another tab or prior WS already registered, skip creating another connection.
    if (wsRegisteredRef.current) return;

    let closed = false;
    let reconnects = 0;

    const connect = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        // frontend uses `/api/result/status` for polling, so WS endpoint is under `/api/result/ws/analysis`
        let url = `${protocol}://${window.location.host}/api/result/ws/analysis`;
        // If token present, include as query param (fallback) and pass as subprotocol (preferred)
        let ws: WebSocket;
        try {
          if (accessTokenParam) {
            const qp = `?token=${encodeURIComponent(accessTokenParam)}`;
            const wsUrl = url + qp;
            ws = new WebSocket(wsUrl, [`Bearer ${accessTokenParam}`]);
          } else {
            ws = new WebSocket(url);
          }
        } catch (e) {
          // fallback to plain ws
          ws = new WebSocket(url);
        }
        wsRef.current = ws;

        ws.onopen = () => {
          try {
            // send registration message the server expects
            ws.send(JSON.stringify({ action: 'register', job_id: jobId }));
          } catch (e) {
            // ignore
          }
        };

        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            setWsLastMessage && setWsLastMessage(data);
            // server sends {status: 'registered', job_id: '...'} on success
            if (data && data.status === 'registered') {
              wsRegisteredRef.current = true;
              skipPollingRef.current = true; // stop polling
              return;
            }

            // server pushes result: {status: 'COMPLETED', result_urls: [...], result_url: '...'}
            if (data && data.status === 'COMPLETED' && (data.result_urls || data.result_url)) {
              const urls = data.result_urls || (data.result_url ? [data.result_url] : []);
              setResultUrls(urls);
              setStatus('COMPLETED');
              // stop polling and close socket
              wsRegisteredRef.current = true;
              skipPollingRef.current = true;
              try {
                ws.close();
              } catch (_) {}
            }
          } catch (e) {
            // ignore malformed WS message
          }
        };

        ws.onerror = () => {
          // let onclose handle reconnect
        };

        ws.onclose = () => {
          wsRef.current = null;
          if (closed) return;
          // If we haven't successfully registered yet, retry a few times
          if (!wsRegisteredRef.current && reconnects < 3) {
            reconnects += 1;
            setTimeout(connect, 1000 * reconnects);
          }
        };
      } catch (e) {
        // ignore connect errors
      }
    };

    connect();

    return () => {
      closed = true;
      try {
        if (wsRef.current) wsRef.current.close();
      } catch (_) {}
    };
  }, [jobId]);

  useEffect(() => {
    if (!resultUrls || resultUrls.length === 0) return;
    (async () => {
      try {
        const contents: Array<{ url: string; type: string; content: any }> = [];
        const videoExts = ['.mp4', '.mov', '.webm', '.mkv'];
        for (const u of resultUrls) {
          try {
            const urlObj = new URL(u);
            const pathname = urlObj.pathname.toLowerCase();
            const isJsonByExt = pathname.endsWith('.json');
            const isVideoByExt = videoExts.some((ext) => pathname.endsWith(ext));

            // Avoid HEAD requests (some presigned URLs or bucket policies block HEAD/CORS).
            // Use extension hints first, then GET when necessary.
            let ct = '';

            // If extension indicates JSON, try GET and parse JSON regardless of content-type
            if (isJsonByExt) {
              try {
                const r = await fetch(u);
                const json = await r.json();
                contents.push({ url: u, type: 'json', content: json });
                continue;
              } catch (e) {
                // fall through to other attempts
              }
            }

            // If extension indicates video, present as video (no body download)
            if (isVideoByExt) {
              contents.push({ url: u, type: 'video', content: null });
              continue;
            }

            // Fallback: do a GET and attempt to detect JSON first, then text, then blob inspection
            try {
              const r = await fetch(u);
              // try JSON
              try {
                const json = await r.clone().json();
                contents.push({ url: u, type: 'json', content: json });
                continue;
              } catch (_) {
                // not JSON
              }

              // try text
              try {
                const text = await r.clone().text();
                // if reasonably short, treat as text
                if (text && text.length < 200000) {
                  contents.push({ url: u, type: 'text', content: text });
                  continue;
                }
              } catch (_) {
                // not text
              }

              // as last resort, inspect blob type
              try {
                const blob = await r.blob();
                const btype = (blob.type || '').toLowerCase();
                if (btype.startsWith('video/')) {
                  contents.push({ url: u, type: 'video', content: null });
                } else if (btype === 'application/json' || btype.includes('json')) {
                  // read as text then parse
                  const txt = await blob.text();
                  try {
                    const json = JSON.parse(txt);
                    contents.push({ url: u, type: 'json', content: json });
                  } catch (_e) {
                    contents.push({ url: u, type: 'text', content: txt });
                  }
                } else {
                  // fallback to download link
                  contents.push({ url: u, type: 'link', content: null });
                }
                continue;
              } catch (e) {
                contents.push({ url: u, type: 'link', content: null });
                continue;
              }
            } catch (e) {
              contents.push({ url: u, type: 'error', content: String(e) });
              continue;
            }
          } catch (e) {
            contents.push({ url: u, type: 'error', content: String(e) });
          }
        }

        setResultContents(contents);
        // If any of the fetched contents contain a JSON result file, pick it up
        try {
          let jsonContent = contents.find((c) => c.type === 'json' && c.content && typeof c.content === 'object');
          if (!jsonContent) {
            // sometimes JSON comes back as text; try to detect JSON-like text and parse
            for (const c of contents) {
              if (c.type === 'text' && typeof c.content === 'string') {
                const t = c.content.trim();
                if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
                  try {
                    const parsed = JSON.parse(t);
                    jsonContent = { url: c.url, type: 'json', content: parsed };
                    break;
                  } catch (_) {
                    // not JSON
                  }
                }
              }
            }
          }
          if (jsonContent) {
            setParsedResultJson(jsonContent.content);
          }
        } catch (err) {
          console.warn('failed to extract parsed json from contents', err);
        }
      } catch (e) {
        console.error('Failed to fetch result urls', e);
        setStatus((s) => s + "\n결과 가져오기 실패");
      }
    })();
  }, [resultUrls]);

  // Helper: resolve a relative s3 key (like 'mp4/...') to a presigned url provided in resultUrls
  const resolvePresignedForKey = (keyPath: string | undefined): string | null => {
    if (!keyPath || !resultUrls) return null;
    try {
      // normalize
      const kp = keyPath.replace(/^\//, '');
      for (const u of resultUrls) {
        try {
          const urlObj = new URL(u);
          // check pathname ending match
          if (urlObj.pathname.replace(/^\//, '').endsWith(kp)) return u;
        } catch (_) {
          // ignore
        }
      }
    } catch (_) {}
    return null;
  };

  // fallback: try to find presigned url by metric key or filename pattern
  const findVideoForMetricKey = (metricKey: string): string | null => {
    if (!resultUrls) return null;
    const normKey = metricKey.toLowerCase();
    // exact patterns: endsWith `${metricKey}_overlay.mp4` or contains metricKey
    for (const u of resultUrls) {
      try {
        const p = (new URL(u)).pathname.toLowerCase();
        if (p.endsWith(`${normKey}_overlay.mp4`) || p.includes(`/${normKey}_`) || p.includes(`_${normKey}_`) || p.includes(`/${normKey}/`)) return u;
        // also try if filename contains metricKey
        const fn = p.split('/').pop() || '';
        if (fn.includes(normKey)) return u;
      } catch (_) {}
    }
    return null;
  };

  const findAnyPresignedMp4 = (): string | null => {
    if (!resultUrls) return null;
    for (const u of resultUrls) {
      try {
        const p = (new URL(u)).pathname.toLowerCase();
        if (p.endsWith('.mp4')) return u;
      } catch (_) {}
    }
    return null;
  };

  const localFallbackForMetric = (metricKey: string): string => {
    const m = metricKey.toLowerCase();
    const map: Record<string, string> = {
      'com_speed': '/video/com_speed.mp4',
      'head_speed': '/video/head_speed.mp4',
      'swing_speed': '/video/swing.mp4',
      'shoulder_sway': '/video/shoulder_sway.mp4',
      'xfactor': '/video/xfactor.mp4',
    };
    return map[m] || '/video/swing.mp4';
  };

  const fmt = (v: any) => {
    if (v === null || v === undefined) return '-';
    if (typeof v === 'number') return isNaN(v) ? 'NaN' : String(Number(v));
    return String(v);
  };

  const extractSummary = (metricKey: string, metricObj: any) => {
    if (!metricObj) return null;
    if (metricObj.summary && typeof metricObj.summary === 'object') return metricObj.summary;
    // some metrics nest under metricObj.metrics.<inner>
    if (metricObj.metrics && typeof metricObj.metrics === 'object') {
      // try to pick first summary found
      const innerKeys = Object.keys(metricObj.metrics);
      for (const k of innerKeys) {
        const inner = metricObj.metrics[k];
        if (inner && inner.summary) return inner.summary;
      }
    }
    return null;
  };

  // After resultContents rendered, attempt to programmatically play any video elements.
  useEffect(() => {
    if (!resultContents || resultContents.length === 0) return;
    // small delay to ensure DOM updated
    setTimeout(() => {
      try {
        Object.keys(videoRefs.current).forEach((url) => {
          const el = videoRefs.current[url];
          if (el) {
            try {
              el.muted = true;
              const p = el.play();
              if (p && typeof p.then === 'function') p.catch((err) => {
                // ignore autoplay rejection but log for debugging
                console.debug('autoplay rejected for', url, err);
              });
            } catch (e) {
              console.debug('video play error', e);
            }
          }
        });
      } catch (e) {
        console.debug('video play catch', e);
      }
    }, 200);
  }, [resultContents]);

  return (
    <div className="flex flex-col justify-center items-center bg-[#f6fcf5] py-[50px]">
      <div className="w-full max-w-[1500px] px-4">
        {parsedResultJson && (
          <div>
            <ReceiveResult parsedJson={parsedResultJson} resultUrls={resultUrls} resultContents={resultContents} />
          </div>
        )}
      </div>
    </div>
  );
}
