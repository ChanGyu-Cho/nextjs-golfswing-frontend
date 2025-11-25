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
          // 1. 성공! 브라우저가 Set-Cookie 헤더를 통해 쿠키를 이미 저장했습니다. (API Route에서 전달받음)
          // 간단한 성공 메시지 후 메인으로 이동
          setLogMessage("🎉 인증에 성공했습니다. 메인으로 이동합니다...");
          setTimeout(() => router.replace('/main'), 500);
        } else {
          // 3. 토큰 교환 실패
          const data = await response.json();
          setLogMessage(`❌ 인증 실패: ${data.detail?.message || data.message || "알 수 없는 오류"}`);
        }
      } catch (e) {
        // 네트워크 오류 또는 서버 연결 실패 (주로 Next.js API Route 접근 실패 시 발생)
        setLogMessage(`❌ 통신 오류: Next.js API Route에 연결할 수 없습니다. 
오류 상세: ${e instanceof Error ? e.message : String(e)}`);
      }
    };

    if (authCode) {
      // State 값 검증 (CSRF 방지)
      const originalState = sessionStorage.getItem(OAUTH_STATE_KEY);
      sessionStorage.removeItem(OAUTH_STATE_KEY);
      
      // 상태 검증 실패 로직 (데스크탑 통합 방식 지원)
      if (returnedState !== originalState || !originalState) {
        setLogMessage(
          `🚨 상태 검증 실패 (원래 상태 없음). 시도: 백엔드로 코드 전달하여 교환 시도 중...`
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
                  setLogMessage("✅ 인증 완료 되었습니다. 창을 닫아주세요.");
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
    <div style={{ padding: 40, color: "var(--foreground)", maxWidth: 780, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 12 }}>인증 처리</h2>
      <div className="card-muted" style={{ padding: 18, borderRadius: 8, background: 'rgba(0,0,0,0.03)' }}>
        <p style={{ margin: 0 }}>{logMessage}</p>
      </div>
      <div style={{ marginTop: 18 }}>
        <button
          onClick={() => router.push('/login')}
          className="btn-primary"
        >
          로그인 페이지로 이동
        </button>
      </div>
    </div>
  );
}

export default CallbackComponent;