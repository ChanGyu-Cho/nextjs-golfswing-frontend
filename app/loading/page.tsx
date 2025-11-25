"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job_id");
  const accessToken = searchParams.get("access_token");
  const oneTimeToken = searchParams.get("one_time_token");
  const consumedRef = useRef(false);
  const [message, setMessage] = useState<string>("분석을 준비 중입니다...");

  useEffect(() => {
    if (!jobId) {
      setMessage("잘못된 접근: job_id가 없습니다.");
      return;
    }

    let mounted = true;

    const poll = async () => {
      try {
        // If a one-time token was provided, call the consume endpoint once to set HttpOnly cookie
        if (oneTimeToken && !consumedRef.current) {
          try {
            await fetch('/api/auth/consume', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: oneTimeToken }),
              credentials: 'include',
            });
            consumedRef.current = true;
          } catch (e) {
            // ignore; polling will handle auth failures
          }
        }

        const fetchOpts: any = { method: "GET", cache: "no-store" };
        if (accessToken) {
          fetchOpts.headers = { Authorization: `Bearer ${accessToken}` };
        } else {
          fetchOpts.credentials = "include";
        }
        const res = await fetch(`/api/result/status?job_id=${encodeURIComponent(jobId)}`, fetchOpts);

        if (!mounted) return;

        if (res.status === 401) {
          setMessage("인증이 필요합니다. 로그인 페이지로 이동합니다...");
          setTimeout(() => router.push("/login"), 1200);
          return;
        }

        if (res.ok) {
          const j = await res.json().catch(() => ({}));
          const status = (j && j.status) || (j?.job_status) || "PENDING";
          if (status === "COMPLETED" || status === "DONE" || status === "SUCCESS") {
            // 완료되면 receive 페이지로 이동 (토큰이 있으면 전달)
            // If the page was opened with a token, forward it to the receive page.
            const receiveUrl = accessToken
              ? `/receive?job_id=${encodeURIComponent(jobId)}&access_token=${encodeURIComponent(accessToken)}`
              : oneTimeToken
              ? `/receive?job_id=${encodeURIComponent(jobId)}&access_token=${encodeURIComponent(oneTimeToken)}`
              : `/receive?job_id=${encodeURIComponent(jobId)}`;
            router.replace(receiveUrl);
            return;
          }
          setMessage(`분석 진행 중: ${status}`);
        } else {
          setMessage(`서버 오류: ${res.status}`);
        }
      } catch (e) {
        if (!mounted) return;
        setMessage("서버 연결 실패 — 다시 시도합니다...");
      }

      // 다음 폴링
      if (mounted) setTimeout(poll, 2000);
    };

    // 시작
    poll();

    return () => {
      mounted = false;
    };
  }, [jobId, router]);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-102px)]">
      <div className="border border-[#e6e6e6] bg-white rounded-[12px] w-[560px]">
        <div className="bg-[#f6fcf5] p-[20px] rounded-t-[12px]">
          <div className="font-bold text-[18px]">분석 진행 중</div>
        </div>
        <div className="p-[24px] flex flex-col items-center gap-4">
          <div className="w-[64px] h-[64px] rounded-full border-4 border-[#e5e7eb] border-t-4 border-t-[#1f8552] animate-spin"></div>
          <div className="text-[14px] text-[#374151] text-center">{message}</div>
          <div className="pt-2">
            <button
              onClick={() =>
                router.replace(
                  accessToken
                    ? `/receive?job_id=${encodeURIComponent(jobId ?? "")}&access_token=${encodeURIComponent(accessToken)}`
                    : `/receive?job_id=${encodeURIComponent(jobId ?? "")}`
                )
              }
              className="px-[14px] py-[8px] bg-[#1f8552] text-white rounded"
            >
              결과 페이지로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
