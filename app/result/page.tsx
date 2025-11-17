"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

// Configure backend base URL via NEXT_PUBLIC_BACKEND_BASE (e.g. http://localhost:29001/api)
const BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_BASE || "http://localhost:29001/api";

function toWebSocketBase() {
  let url = BACKEND_BASE;
  if (url.startsWith("http://")) url = "ws://" + url.slice("http://".length);
  else if (url.startsWith("https://"))
    url = "wss://" + url.slice("https://".length);
  url = url.replace(/\/$/, "");
  return `${url}/result/ws/analysis`;
}

export default function ResultPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams?.get("job_id") || searchParams?.get("jobId") || "";

  const [status, setStatus] = useState<string>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultContent, setResultContent] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const wsUrl = toWebSocketBase();
    setStatus("connecting");

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      // Preconnect flow: send registration message with job_id
      try {
        console.log("WS open, sending register", jobId);
        if (jobId)
          ws.send(JSON.stringify({ action: "register", job_id: jobId }));
        console.log("WS register message sent", jobId);
        setStatus("registered");
      } catch (e) {
        console.warn("Failed to send register message", e);
      }
    };

    ws.onmessage = async (ev) => {
      try {
        const data = JSON.parse(ev.data);
        // expected push: { status: 'COMPLETED', result_url: '<presigned-url>' }
        const url = (data.result_url || data.resultUrl || data.result) as
          | string
          | undefined;
        if (url) {
          setResultUrl(url);
          setStatus("received_result_url");

          try {
            // First try the provided presigned URL
            let resp = await fetch(url);
            let text = await resp.text();
            let parsed = null;
            try {
              parsed = JSON.parse(text);
              setResultContent(parsed);
              setStatus("fetched_json");
            } catch (e) {
              // If not JSON and URL ends with .dat, try .json
              if (url.match(/\.dat(\?|$)/)) {
                const urlJson = url
                  .replace(/\.dat(\?)/, ".json$1")
                  .replace(/\.dat$/, ".json");
                try {
                  resp = await fetch(urlJson);
                  text = await resp.text();
                  parsed = JSON.parse(text);
                  setResultContent(parsed);
                  setStatus("fetched_json");
                } catch (e2) {
                  // fallback: show raw text of original
                  setResultContent(text);
                  setStatus("fetched_text");
                }
              } else {
                setResultContent(text);
                setStatus("fetched_text");
              }
            }
          } catch (e) {
            console.error("Failed to fetch presigned URL:", e);
            setStatus("fetch_error");
          }
        } else if (data.status) {
          setStatus(String(data.status));
        } else {
          console.debug("ws message", data);
        }
      } catch (e) {
        console.warn("Failed to parse WS message", e, ev.data);
      }
    };

    ws.onclose = () => {
      setStatus((s) => (s.startsWith("fetched") ? s : "closed"));
    };

    ws.onerror = (e) => {
      console.error("WebSocket error", e);
      setStatus("error");
    };

    return () => {
      try {
        ws.close();
      } catch {}
      wsRef.current = null;
    };
  }, [jobId]);

  return (
    <div className="flex flex-col  justify-center items-center bg-[#f6fcf5]  py-[50px]">
      <div className="text-[24px] font-bold pb-[30px]">
        Swing Metrics Analysis
      </div>
      <div className="flex flex-col gap-[50px]">
        <div className="flex flex-row gap-[40px] border border-[#e6e6e6] bg-white rounded-[14px] max-w-[1200px] py-[40px] px-[56px] ">
          <div className="w-[40%]">
            <div className="text-[20px] font-bold pb-[10px]">Xfactor</div>
            <div className="text-[14px]  pb-[20px]">
              X-Factor는 어깨와 골반의 회전 차이를 나타내는 지표로, 스윙의
              파워와 정확도를 결정하는 핵심 요소입니다.
            </div>
            <div className="text-[16px] font-semibold pb-[10px]">
              Your Swing Feedback
            </div>
            <div className="text-[14px] ">
              당신의 X-Factor는 15°로, 낮은 수준입니다. 상체와 하체의 회전
              차이가 작아 파워 전달이 부족할 수 있습니다. 백스윙 시 어깨를 조금
              더 돌려 상체 회전각을 늘려보세요.
            </div>
          </div>
          <div className="border border-[#1f8552] rounded-[14px] w-[60%]"></div>
        </div>
        <div className="flex flex-row gap-[40px] border border-[#e6e6e6] bg-white rounded-[14px] max-w-[1200px] py-[40px] px-[56px] ">
          <div className="w-[40%]">
            <div className="text-[20px] font-bold pb-[10px]">COM</div>
            <div className="text-[14px]  pb-[20px]">
              X-Factor는 어깨와 골반의 회전 차이를 나타내는 지표로, 스윙의
              파워와 정확도를 결정하는 핵심 요소입니다.
            </div>
            <div className="text-[16px] font-semibold pb-[10px]">
              Your Swing Feedback
            </div>
            <div className="text-[14px] ">
              당신의 X-Factor는 15°로, 낮은 수준입니다. 상체와 하체의 회전
              차이가 작아 파워 전달이 부족할 수 있습니다. 백스윙 시 어깨를 조금
              더 돌려 상체 회전각을 늘려보세요.
            </div>
          </div>
          <div className="border border-[#1f8552] rounded-[14px] w-[60%]"></div>
        </div>
        <div className="flex flex-row gap-[40px] border border-[#e6e6e6] bg-white rounded-[14px] max-w-[1200px] py-[40px] px-[56px] ">
          <div className="w-[40%]">
            <div className="text-[20px] font-bold pb-[10px]">Head</div>
            <div className="text-[14px]  pb-[20px]">
              X-Factor는 어깨와 골반의 회전 차이를 나타내는 지표로, 스윙의
              파워와 정확도를 결정하는 핵심 요소입니다.
            </div>
            <div className="text-[16px] font-semibold pb-[10px]">
              Your Swing Feedback
            </div>
            <div className="text-[14px] ">
              당신의 X-Factor는 15°로, 낮은 수준입니다. 상체와 하체의 회전
              차이가 작아 파워 전달이 부족할 수 있습니다. 백스윙 시 어깨를 조금
              더 돌려 상체 회전각을 늘려보세요.
            </div>
          </div>
          <div className="border border-[#1f8552] rounded-[14px] w-[60%]"></div>
        </div>
        <div className="flex flex-row gap-[40px] border border-[#e6e6e6] bg-white rounded-[14px] max-w-[1200px] py-[40px] px-[56px] ">
          <div className="w-[40%]">
            <div className="text-[20px] font-bold pb-[10px]">Xfactor</div>
            <div className="text-[14px]  pb-[20px]">
              X-Factor는 어깨와 골반의 회전 차이를 나타내는 지표로, 스윙의
              파워와 정확도를 결정하는 핵심 요소입니다.
            </div>
            <div className="text-[16px] font-semibold pb-[10px]">
              Your Swing Feedback
            </div>
            <div className="text-[14px] ">
              당신의 X-Factor는 15°로, 낮은 수준입니다. 상체와 하체의 회전
              차이가 작아 파워 전달이 부족할 수 있습니다. 백스윙 시 어깨를 조금
              더 돌려 상체 회전각을 늘려보세요.
            </div>
          </div>
          <div className="border border-[#1f8552] rounded-[14px] w-[60%]"></div>
        </div>
        <div className="flex flex-row gap-[40px] border border-[#e6e6e6] bg-white rounded-[14px] max-w-[1200px] py-[40px] px-[56px] ">
          <div className="w-[40%]">
            <div className="text-[20px] font-bold pb-[10px]">Xfactor</div>
            <div className="text-[14px]  pb-[20px]">
              X-Factor는 어깨와 골반의 회전 차이를 나타내는 지표로, 스윙의
              파워와 정확도를 결정하는 핵심 요소입니다.
            </div>
            <div className="text-[16px] font-semibold pb-[10px]">
              Your Swing Feedback
            </div>
            <div className="text-[14px] ">
              당신의 X-Factor는 15°로, 낮은 수준입니다. 상체와 하체의 회전
              차이가 작아 파워 전달이 부족할 수 있습니다. 백스윙 시 어깨를 조금
              더 돌려 상체 회전각을 늘려보세요.
            </div>
          </div>
          <div className="border border-[#1f8552] rounded-[14px] w-[60%]"></div>
        </div>
      </div>
    </div>
    // <div style={{ padding: 20, fontFamily: "Inter, Arial, sans-serif" }}>
    //   <h1>Result Viewer</h1>
    //   <p>
    //     Job ID: <strong>{jobId || "(no job_id provided)"}</strong>
    //   </p>
    //   <p>
    //     WebSocket status: <strong>{status}</strong>
    //   </p>

    //   {!jobId && (
    //     <div style={{ marginTop: 12, color: "#b00" }}>
    //       Provide job_id in query string, e.g. <code>?job_id=84088d2c-...'</code>
    //     </div>
    //   )}

    //   {resultUrl && (
    //     <div style={{ marginTop: 12 }}>
    //       <div>
    //         Result presigned URL: <a href={resultUrl} target="_blank" rel="noreferrer">Open</a>
    //       </div>
    //     </div>
    //   )}

    //   {resultContent && (
    //     <div style={{ marginTop: 18 }}>
    //       <h2>Result</h2>
    //       <pre style={{ background: "#f6f8fa", padding: 12, borderRadius: 6, overflowX: "auto" }}>
    //         {typeof resultContent === "string"
    //           ? resultContent
    //           : JSON.stringify(resultContent, null, 2)}
    //       </pre>
    //     </div>
    //   )}

    //   <div style={{ marginTop: 18 }}>
    //     <small>
    //       Notes: The page connects to the backend WebSocket at <code>{BACKEND_BASE.replace(/^http/, "ws")}</code> and
    //       listens for a push containing <code>result_url</code>. The backend must be reachable and push the presigned
    //       URL (S3 GET). Presigned URL CORS must allow the frontend origin.
    //     </small>
    //   </div>
    // </div>
  );
}
