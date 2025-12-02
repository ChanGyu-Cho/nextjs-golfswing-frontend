// app/callback/CallbackComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Next.js API Route 주소 정의: 클라이언트가 요청할 주소
// 이 주소는 Next.js 서버 환경에서 실행되는 프록시 엔드포인트입니다.
const NEXT_TOKEN_PROXY_API = "/api/auth/token"; 
// Use a local server-side proxy endpoint instead of calling backend directly from client
const BACKEND_AUTH_FORWARD = "/api/auth/forward";
const OAUTH_STATE_KEY = "oauth_state";

function CallbackComponent() {
  const searchParams = useSearchParams();
  const [logMessage, setLogMessage] = useState("인증 처리 중입니다...");
  const router = useRouter();

  // 클립보드에 텍스트를 복사하는 헬퍼 함수
  const copyToClipboard = async (text: string) => {
    try {
      // 최신 Clipboard API 시도
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        console.log("[callback] ✓ Token copied to clipboard via Clipboard API");
        return true;
      }
    } catch (e) {
      console.log(`[callback] Clipboard API failed: ${e}`);
    }
    
    // Fallback: 구형 방법 (일부 브라우저)
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (success) {
        console.log("[callback] ✓ Token copied to clipboard via execCommand");
        return true;
      }
    } catch (e) {
      console.log(`[callback] execCommand failed: ${e}`);
    }
    
    console.log("[callback] ❌ Failed to copy token to clipboard");
    return false;
  };

  useEffect(() => {
    const authCode = searchParams.get("code");
    const error = searchParams.get("error");
    const returnedState = searchParams.get("state");

    if (error) {
      setLogMessage(
        `❌ 인증 실패 오류: ${searchParams.get("error_description") || error}`
      );
      return;
    }

    const exchangeToken = async (code: string) => {
      const proxyUrl = NEXT_TOKEN_PROXY_API;

      setLogMessage(`✅ Google OAuth 인증 성공!
백엔드 프록시 API (${proxyUrl})로 토큰 교환 요청 중... (HttpOnly 쿠키 설정 예정)`);

      try {
        // FastAPI의 Form(...) 인자를 위해 FormData를 사용합니다.
        const formData = new FormData();
        formData.append("code", code);

        // 2. fetch 대상을 Next.js API Route로 변경!
        const response = await fetch(proxyUrl, {
          method: "POST",
          body: formData,
          // ⭐ 중요: credentials: "include" 유지.
          // 브라우저가 Next.js API Route로부터 받은 Set-Cookie 헤더를 저장하기 위함.
          credentials: "include",
        });

        if (response.ok) {
          // ✅ 새로 추가: 응답에서 access_token 추출
          let access_token = null;
          let id_token = null;
          try {
            const data = await response.json();
            access_token = data.access_token;
            id_token = data.id_token;
            console.log(`[callback] Received access_token from response: ${access_token ? access_token.substring(0, 20) + "..." : "null"}`);
            
            // ✅ 토큰을 localStorage에 저장 (중요!)
            if (access_token) {
              localStorage.setItem("access_token", access_token);
              console.log("[callback] ✓ access_token saved to localStorage");
            }
            if (id_token) {
              localStorage.setItem("id_token", id_token);
              console.log("[callback] ✓ id_token saved to localStorage");
            }
          } catch (e) {
            console.log(`[callback] Could not parse response as JSON: ${e}`);
          }

          // ✅ 새로 추가: 토큰을 클립보드에 복사 (Desktop이 감지하도록)
          if (access_token) {
            const copied = await copyToClipboard(access_token);
            if (copied) {
              setLogMessage(`🎉 인증에 성공했습니다!
✓ 토큰이 클립보드에 복사되었습니다.
(Desktop 앱이 자동으로 감지합니다)`);
            } else {
              setLogMessage(`⚠️ 인증 성공했으나 토큰 복사 실패.
수동 붙여넣기가 필요할 수 있습니다.`);
            }
          } else {
            // 토큰이 응답에 없는 경우
            setLogMessage(`✅ 인증 성공 (토큰은 HttpOnly 쿠키로만 저장됨)
이전 작업으로 이동합니다...`);
          }

          // 1. 성공! 브라우저가 Set-Cookie 헤더를 통해 쿠키를 이미 저장했습니다. (API Route에서 전달받음)
          // 우선 대상(redirect) URL 결정: callback URL에 job_id 또는 토큰 파라가 있으면 원래 로딩으로 복귀
          const jobId = searchParams.get('job_id');
          const accessTokenParam = searchParams.get('access_token');
          const oneTimeToken = searchParams.get('one_time_token');

          let target = '/main';
          if (jobId) {
            target = `/loading?job_id=${encodeURIComponent(jobId)}`;
            if (accessTokenParam) target += `&access_token=${encodeURIComponent(accessTokenParam)}`;
            else if (oneTimeToken) target += `&one_time_token=${encodeURIComponent(oneTimeToken)}`;
          }

          // 토큰 복사 후 또는 실패했을 때 약간의 지연 후 리다이렉트
          setTimeout(() => router.replace(target), 1500);
        } else {
          // 3. 토큰 교환 실패
          const contentType = response.headers.get('content-type');
          let errorMessage = "알 수 없는 오류";
          
          try {
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              errorMessage = data.detail?.message || data.message || data.detail || JSON.stringify(data);
            } else {
              errorMessage = await response.text();
            }
          } catch (e) {
            errorMessage = `HTTP ${response.status}: 응답 파싱 실패`;
          }
          
          setLogMessage(`❌ 토큰 교환 실패: ${errorMessage}`);
          console.log(`[callback] Token exchange failed: ${response.status} ${errorMessage}`);
        }
      } catch (e) {
        // 네트워크 오류 또는 서버 연결 실패 (주로 Next.js API Route 접근 실패 시 발생)
        setLogMessage(`❌ 통신 오류: Next.js API Route에 연결할 수 없습니다. 
오류 상세: ${e instanceof Error ? e.message : String(e)}`);
        console.log(`[callback] Network error: ${e}`);
      }
    };

    if (authCode) {
      // State 값 검증 (CSRF 방지)
      const originalState = sessionStorage.getItem(OAUTH_STATE_KEY);
      sessionStorage.removeItem(OAUTH_STATE_KEY);
      
      // 상태 검증 실패 로직 (데스크탑 통합 방식 지원)
      // 주의: state가 없거나 불일치해도 진행 (브라우저 제약으로 sessionStorage 실패 가능)
      if (returnedState !== originalState && originalState) {
        // state가 명백히 불일치하는 경우만 에러
        setLogMessage(
          `🚨 상태 검증 실패. 시도: 백엔드로 코드 전달하여 교환 시도 중...`
        );
        
        if (!BACKEND_AUTH_FORWARD) {
          setLogMessage(
            "❌ 백엔드 전달 엔드포인트가 구성되어 있지 않습니다. 서버 환경변수를 확인하세요."
          );
          return;
        }

        const forwardExchange = async () => {
          // 이 부분은 BACKEND_AUTH_FORWARD로 직접 요청하며 CORS 문제가 발생할 수 있습니다.
          // 만약 이 부분도 문제가 된다면 /api/auth/forward 프록시를 별도로 생성해야 합니다.
          try {
            const resp = await fetch(BACKEND_AUTH_FORWARD, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ code: authCode, state: returnedState }),
            });
            if (resp.ok) {
                  // Forward-exchange succeeded. If job_id present, redirect there.
                  const jobId = searchParams.get('job_id');
                  const accessToken = searchParams.get('access_token');
                  const oneTimeToken = searchParams.get('one_time_token');
                  if (jobId) {
                    let target = `/loading?job_id=${encodeURIComponent(jobId)}`;
                    if (accessToken) target += `&access_token=${encodeURIComponent(accessToken)}`;
                    else if (oneTimeToken) target += `&one_time_token=${encodeURIComponent(oneTimeToken)}`;
                    setLogMessage('✅ 인증 완료 되었습니다. 이전 작업으로 돌아갑니다...');
                    setTimeout(() => router.replace(target), 500);
                  } else {
                    setLogMessage("✅ 인증 완료 되었습니다. 창을 닫아주세요.");
                  }
                } else {
                  const d = await resp.json();
                  setLogMessage(`❌ 인증 전달 실패: ${d.detail || JSON.stringify(d)}`);
            }
          } catch (e) {
            setLogMessage(
              `❌ 전달 중 통신 오류: ${
                e instanceof Error ? e.message : String(e)
              }`
            );
          }
        };
        forwardExchange();
        return;
      }

      // State 검증 성공 후 토큰 교환 시작
      exchangeToken(authCode);
    } else if (searchParams.toString().length > 0) {
      setLogMessage("콜백 파라미터가 올바르지 않습니다.");
    } else {
      setLogMessage("인증 코드가 없습니다.");
    }
  }, [searchParams, router]);
  return (
    <div className="flex justify-center mt-[30px]">
      <div className="border border-[#e6e6e6] bg-white rounded-[12px] w-[720px]">
        <div className="bg-[#f6fcf5] p-[20px] rounded-t-[12px]">
          <div className="font-bold text-[20px]">인증 처리</div>
        </div>
        <div className="p-[18px]">
          <div className="text-[14px] text-[#374151] whitespace-pre-wrap">{logMessage}</div>

          <div className="mt-[18px]">
            <button
              onClick={() => router.push('/main')}
              className="px-[16px] py-[10px] rounded bg-[#1f8552] text-white font-semibold"
            >
              메인으로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallbackComponent;
