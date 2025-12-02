"use client";

import { useEffect } from "react";

/**
 * TokenSync 컴포넌트
 * - 쿠키에서 id_token과 access_token을 읽어서 localStorage에 저장
 * - 백엔드에서 HttpOnly 쿠키로 설정된 토큰을 프론트엔드 fetch 요청에서 사용할 수 있도록 함
 * - Cognito 로그인 완료 후 CallbackComponent에서 자동으로 저장되지만,
 *   페이지 새로고침 시 쿠키는 유지되므로 이 컴포넌트에서 다시 동기화함
 */
export default function TokenSync() {
  useEffect(() => {
    // 쿠키에서 토큰 추출
    function getCookie(name: string): string | null {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    }

    // 토큰 동기화
    const idToken = getCookie("id_token");
    const accessToken = getCookie("access_token");
    
    let tokensSynced = false;

    if (idToken) {
      localStorage.setItem("id_token", idToken);
      console.log("[TokenSync] id_token synced from cookie to localStorage");
      tokensSynced = true;
    }

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      console.log("[TokenSync] access_token synced from cookie to localStorage");
      tokensSynced = true;
    }
    
    if (tokensSynced) {
      console.log("[TokenSync] ✓ Token synchronization complete");
    }
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}
