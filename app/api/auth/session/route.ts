// app/api/auth/session/route.ts
/**
 * Server-side session check: forwards client's cookies to backend /api/auth/whoami
 * Returns { authenticated: boolean, user_id?: string }
 */
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const WHOAMI_ENDPOINT = BACKEND_API_BASE_URL ? BACKEND_API_BASE_URL + '/api/auth/whoami' : undefined;

export async function GET(request: Request) {
  if (!WHOAMI_ENDPOINT) {
    return new Response(JSON.stringify({ authenticated: false, message: 'BACKEND not configured' }), { status: 500 });
  }

  try {
    const headers: any = {};
    const cookie = request.headers.get('cookie');
    if (cookie) headers['cookie'] = cookie;

    const resp = await fetch(WHOAMI_ENDPOINT, {
      method: 'GET',
      headers,
    });

    if (resp.status === 200) {
      const data = await resp.json().catch(() => ({}));
      return new Response(JSON.stringify({ authenticated: true, user_id: data.user_id }), { status: 200 });
    }

    return new Response(JSON.stringify({ authenticated: false }), { status: 200 });
  } catch (e) {
    console.error('session check error', e);
    return new Response(JSON.stringify({ authenticated: false, error: e instanceof Error ? e.message : String(e) }), { status: 500 });
  }
}
