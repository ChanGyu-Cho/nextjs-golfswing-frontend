// app/api/auth/forward/route.ts
/**
 * Server-side proxy to forward OAuth callback (code + state) to backend
 * Prevents client from calling backend directly.
 */
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const FORWARD_ENDPOINT = BACKEND_API_BASE_URL ? BACKEND_API_BASE_URL + '/api/auth/callback/forward' : undefined;

export async function POST(request: Request) {
  if (!BACKEND_API_BASE_URL || !FORWARD_ENDPOINT) {
    return Response.json({ message: '서버 환경변수 (NEXT_PUBLIC_API_BASE_URL)가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    const body = await request.json().catch(() => null);

    const headers: any = {};
    // forward cookie header from client (to keep session)
    const cookie = request.headers.get('cookie');
    if (cookie) headers['cookie'] = cookie;
    headers['content-type'] = 'application/json';

    const backendResp = await fetch(FORWARD_ENDPOINT, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const responseHeaders = new Headers(backendResp.headers);
    const setCookie = backendResp.headers.get('set-cookie');
    if (setCookie) responseHeaders.append('Set-Cookie', setCookie);

    const data = await backendResp.json().catch(() => ({}));

    return new Response(JSON.stringify(data), {
      status: backendResp.status,
      headers: responseHeaders,
    });
  } catch (e) {
    console.error('Forward proxy error:', e);
    return Response.json({ message: '서버-서버 통신 오류', detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
