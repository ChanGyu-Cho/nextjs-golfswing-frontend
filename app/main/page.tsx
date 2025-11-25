"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import MainComponent from "../Components/Main/MainComponent";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // 인증 확인: 서버-side session check
    (async () => {
      try {
        const res = await fetch('/api/auth/session', { method: 'GET', credentials: 'include', cache: 'no-store' });
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const j = await res.json();
        if (!j.authenticated) {
          router.push('/login');
        }
      } catch (e) {
        router.push('/login');
      }
    })();
  }, [router]);

  return <MainComponent />;
}
