"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Reuse backend base logic from uploader
const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE || "http://localhost:29001/api";
let WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL;
if (!WS_BASE_URL && BACKEND_BASE) {
  if (BACKEND_BASE.startsWith("https://")) WS_BASE_URL = BACKEND_BASE.replace(/^https:/, "wss:");
  else if (BACKEND_BASE.startsWith("http://")) WS_BASE_URL = BACKEND_BASE.replace(/^http:/, "ws:");
  else WS_BASE_URL = BACKEND_BASE;
}
WS_BASE_URL = WS_BASE_URL;

export default function ReceivePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams?.get("job_id") || undefined;

  const [status, setStatus] = useState<string>(jobId ? `대기 중: Job ${jobId}` : "Job ID 없음");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultContent, setResultContent] = useState<any | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const wsBase = (WS_BASE_URL || "ws://localhost:8000").replace(/\/$/, "");
    const url = `${wsBase}/result/ws/analysis`;

    // Try to get auth token from safe places (HttpOnly cookie is preferred,
    // but if your app stores a non-HttpOnly access token in localStorage,
    // include it as a subprotocol so the backend can validate the connection).
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
      // register
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
          // Support either a single result_url or an array result_urls
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

    // Fetch result content (JSON) as example
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
          Notes: The page connects to the backend WebSocket at <code>{BACKEND_BASE.replace(/^http/, "ws")}</code> and
          listens for a push containing <code>result_url</code>. The backend must be reachable and push the presigned
          URL (S3 GET). Presigned URL CORS must allow the frontend origin.
        </small>
      </div>
    </div>
  );
}
