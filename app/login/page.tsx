// app/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // read return_to from query and store in sessionStorage for callback redirect
    try {
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get('return_to');
      if (returnTo && (returnTo.startsWith('/') || returnTo.startsWith('/loading'))) {
        try { sessionStorage.setItem('oauth_return_to', returnTo); } catch (e) {}
      }
    } catch (e) {
      // ignore
    }

    // CSRF state
    const state = Math.random().toString(36).substring(2, 15);
    try { sessionStorage.setItem('oauth_state', state); } catch (e) {}

    const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;
    const SCOPE = process.env.NEXT_PUBLIC_SCOPE || 'openid profile email';
    const RESPONSE_TYPE = process.env.NEXT_PUBLIC_RESPONSE_TYPE || 'code';

    if (!COGNITO_DOMAIN || !CLIENT_ID || !REDIRECT_URI) {
      // If env not configured, show nothing (developer should fix env)
      return;
    }

    const authUrl =
      `${COGNITO_DOMAIN}/oauth2/authorize?` +
      `response_type=${encodeURIComponent(RESPONSE_TYPE)}&` +
      `client_id=${encodeURIComponent(CLIENT_ID)}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(SCOPE)}&` +
      `state=${encodeURIComponent(state)}`;

    // Redirect immediately to hosted UI
    window.location.replace(authUrl);
  }, [router]);

  // Minimal fallback UI while redirecting
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>로그인 페이지로 이동합니다…</h2>
      <p>잠시만 기다려 주세요. 곧 인증 서비스로 이동합니다.</p>
    </div>
  );
}