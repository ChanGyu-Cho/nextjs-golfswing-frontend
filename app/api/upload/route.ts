// app/api/upload/route.ts
/**
 * Server-side proxy for uploader POST requests.
 * Receives JSON payload from client and forwards to backend `/upload/` endpoint.
 */
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const UPLOAD_ENDPOINT = BACKEND_API_BASE_URL ? BACKEND_API_BASE_URL.replace(/\/$/, '') + '/upload/' : undefined;

export async function POST(request: Request) {
  if (!BACKEND_API_BASE_URL || !UPLOAD_ENDPOINT) {
    return Response.json({ message: '서버 환경변수 (NEXT_PUBLIC_API_BASE_URL)가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    const body = await request.json();

    const headers: any = {
      'content-type': 'application/json',
    };
    const cookie = request.headers.get('cookie');
    if (cookie) headers['cookie'] = cookie;

    const backendResp = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
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
    console.error('Upload proxy error:', e);
    return Response.json({ message: '서버-서버 통신 오류', detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
