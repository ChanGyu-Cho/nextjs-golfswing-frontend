// app/api/auth/consume/route.ts
import { NextResponse } from 'next/server';

const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const WHOAMI_ENDPOINT = BACKEND_API_BASE_URL ? BACKEND_API_BASE_URL + '/api/auth/whoami' : undefined;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = body?.token || null;
    if (!token) return new Response(JSON.stringify({ error: 'missing token' }), { status: 400 });

    if (!WHOAMI_ENDPOINT) return new Response(JSON.stringify({ error: 'backend not configured' }), { status: 500 });

    // Verify token with backend whoami
    const resp = await fetch(WHOAMI_ENDPOINT, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (resp.status !== 200) {
      return new Response(JSON.stringify({ error: 'invalid token' }), { status: 401 });
    }

    const maxAge = 60 * 10; // 10 minutes
    const isSecure = request.url.startsWith('https:') || process.env.NODE_ENV === 'production';
    const cookieParts = [
      `access_token=${token}`,
      `Path=/`,
      `HttpOnly`,
      `SameSite=Lax`,
      `Max-Age=${maxAge}`,
    ];
    if (isSecure) cookieParts.push('Secure');

    const headers = new Headers();
    headers.set('Set-Cookie', cookieParts.join('; '));
    headers.set('Content-Type', 'application/json');

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (e) {
    console.error('consume token error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500 });
  }
}
