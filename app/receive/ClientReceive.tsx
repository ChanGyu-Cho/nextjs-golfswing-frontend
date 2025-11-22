"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ClientReceive() {
  const searchParams = useSearchParams();
  const jobId = searchParams?.get("job_id") || undefined;

  const [status, setStatus] = useState<string>(jobId ? `대기 중: Job ${jobId}` : "Job ID 없음");
  const [resultUrls, setResultUrls] = useState<string[] | null>(null);
  const [resultContents, setResultContents] = useState<any[] | null>(null);

  // Polling: 주기적으로 /api/result/status?job_id=... 호출
  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const resp = await fetch(`/api/result/status?job_id=${encodeURIComponent(jobId)}`, {
          method: 'GET',
          credentials: 'include'
        });
        if (!resp.ok) {
          if (resp.status === 404) {
            setStatus('Job not found');
            return;
          }
          throw new Error(`status fetch failed: ${resp.status}`);
        }
        const j = await resp.json();
        setStatus(j.status || 'pending');
        if (j.status === 'COMPLETED' && (j.result_urls || j.result_url)) {
          const urls = j.result_urls || (j.result_url ? [j.result_url] : []);
          setResultUrls(urls);
          setStatus('COMPLETED');
          return; // stop polling
        }
      } catch (e) {
        console.error('poll error', e);
        setStatus((s) => s + '\n폴링 오류');
      }

      if (!cancelled) setTimeout(poll, 3000); // 3초마다 폴링
    };

    poll();
    return () => { cancelled = true; };
  }, [jobId]);

  useEffect(() => {
    if (!resultUrls || resultUrls.length === 0) return;
    (async () => {
      try {
        const contents = await Promise.all(resultUrls.map(async (u) => {
          try {
            const r = await fetch(u);
            const ct = r.headers.get("content-type") || "";
            if (ct.includes("application/json")) return await r.json();
            return await r.text();
          } catch (e) {
            return { error: String(e), url: u };
          }
        }));
        setResultContents(contents);
      } catch (e) {
        console.error('Failed to fetch result urls', e);
        setStatus((s) => s + "\n결과 가져오기 실패");
      }
    })();
  }, [resultUrls]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Receive (결과 수신)</h1>
      <div style={{ whiteSpace: "pre-wrap", background: "#f6f8fa", padding: 12, borderRadius: 6 }}>
        {status}
      </div>

      {resultUrls && (
        <div style={{ marginTop: 12 }}>
          <div>
            Result presigned URLs:
            <ul>
              {resultUrls.map((u) => (
                <li key={u}><a href={u} target="_blank" rel="noreferrer">{u}</a></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {resultContents && (
        <div style={{ marginTop: 18 }}>
          <h2>Results</h2>
          {resultContents.map((c, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              <h4>File {idx + 1}</h4>
              <pre style={{ background: "#f6f8fa", padding: 12, borderRadius: 6, overflowX: "auto" }}>
                {typeof c === "string" ? c : JSON.stringify(c, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <small>
          Notes: This page polls <code>/api/result/status</code> for job status. Polling is used instead of WebSocket
          to improve compatibility with CDNs and reverse proxies.
        </small>
      </div>
    </div>
  );
}
