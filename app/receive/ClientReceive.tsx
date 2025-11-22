"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Prefer same-origin WebSocket. Allow explicit env override via NEXT_PUBLIC_WS_BASE_URL.
let WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL ?? undefined;
if (!WS_BASE_URL) {
  if (typeof window !== 'undefined') {
    WS_BASE_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
  }
}

export default function ClientReceive() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams?.get("job_id") || undefined;

  const [status, setStatus] = useState<string>(jobId ? `대기 중: Job ${jobId}` : "Job ID 없음");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultContent, setResultContent] = useState<any | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!jobId) return;

    if (!WS_BASE_URL) {
      setStatus((s) => s + "\nWebSocket 설정 오류: NEXT_PUBLIC_WS_BASE_URL가 설정되지 않았습니다.");
      return;
    }
    const wsBase = WS_BASE_URL.replace(/\/$/, "");
    const url = `${wsBase}/result/ws/analysis`;

    const token = (() => {
      try { return localStorage.getItem('access_token'); } catch (e) { return null; }
    })();

    const ws = token ? new WebSocket(url, [`Bearer ${token}`]) : new WebSocket(url);
    wsRef.current = ws;

    const openTimeout = setTimeout(() => {
      setStatus((s) => s + "\nWebSocket 연결 타임아웃");
      try { ws.close(); } catch(e) {}
    }, 8000);

    ws.onopen = () => {
      clearTimeout(openTimeout);
      console.debug('[receive/page] ws.open', { url, protocol: ws.protocol });
      setStatus(`WebSocket 연결됨. Job 등록 중...`);
      try {
        ws.send(JSON.stringify({ action: "register", job_id: jobId }));
      } catch (e) {
        console.error('[receive/page] failed to send register', e);
      }
    };

    ws.onmessage = (ev) => {
      console.debug('[receive/page] ws.message raw:', ev.data);
      try {
        const data = JSON.parse(ev.data);
        if (data.status === "registered") {
          setStatus(`등록됨: Job ${data.job_id}`);
          return;
        }
        if (data.status === "COMPLETED") {
          setStatus((s) => s + "\n분석 완료 - 결과 수신");
          const urlFromPayload =
            data.result_url || (Array.isArray(data.result_urls) ? data.result_urls[0] : null) || null;
          if (urlFromPayload) setResultUrl(urlFromPayload);
        }
        if (data.error) {
          setStatus((s) => s + `\n오류: ${data.error}`);
        }
      } catch (e) {
        console.error('WS message parse error', e);
      }
    };

    ws.onerror = (ev) => {
      console.error('WebSocket error', ev);
      setStatus((s) => s + "\nWebSocket 오류 발생");
    };

    ws.onclose = (ev) => {
      setStatus((s) => s + `\nWebSocket 닫힘(code=${ev?.code})`);
      wsRef.current = null;
    };

    return () => {
      try { ws.close(); } catch (e) {}
      wsRef.current = null;
    };
  }, [jobId]);

  useEffect(() => {
    if (!resultUrl) return;
    setStatus((s) => s + `\n결과 URL 수신: ${resultUrl}`);

    (async () => {
      try {
        const res = await fetch(resultUrl);
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const j = await res.json();
          setResultContent(j);
        } else {
          const text = await res.text();
          setResultContent(text);
        }
      } catch (e) {
        console.error('Failed to fetch result url', e);
        setStatus((s) => s + "\n결과 가져오기 실패");
      }
    })();
  }, [resultUrl]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Receive (결과 수신)</h1>
      <div style={{ whiteSpace: "pre-wrap", background: "#f6f8fa", padding: 12, borderRadius: 6 }}>
        {status}
      </div>

      {resultUrl && (
        <div style={{ marginTop: 12 }}>
          <div>
            Result presigned URL: <a href={resultUrl} target="_blank" rel="noreferrer">Open</a>
          </div>
        </div>
      )}

      {resultContent && (
        <div style={{ marginTop: 18 }}>
          <h2>Result</h2>
          <pre style={{ background: "#f6f8fa", padding: 12, borderRadius: 6, overflowX: "auto" }}>
            {typeof resultContent === "string" ? resultContent : JSON.stringify(resultContent, null, 2)}
          </pre>
        </div>
      )}

        <div style={{ marginTop: 18 }}>
          <small>
            Notes: The page connects to the same-origin WebSocket at <code>/result/ws/analysis</code> by default and
            listens for a push containing <code>result_url</code>. The backend must be reachable from the frontend host
            (e.g. via reverse proxy) and push the presigned URL (S3 GET). Presigned URL CORS must allow the frontend origin.
          </small>
        </div>
    </div>
  );
}
