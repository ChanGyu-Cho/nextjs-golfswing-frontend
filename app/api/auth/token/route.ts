// app/api/auth/token/route.ts

/**
 * 서버 측 프록시: 클라이언트 요청을 FastAPI 백엔드로 안전하게 전달합니다.
 * 이 코드는 Node.js 환경에서 실행되므로 클라이언트 측 CORS 정책의 제약을 받지 않습니다.
 */

// 환경 변수: .env 파일에 설정된 FastAPI 백엔드 URL을 사용합니다.
// 예: NEXT_PUBLIC_API_BASE_URL=http://ec2-15-164-39-215.ap-northeast-2.compute.amazonaws.com:3001
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const FASTAPI_TOKEN_API = BACKEND_API_BASE_URL + "/api/token";

export async function POST(request: Request) {
  if (!BACKEND_API_BASE_URL) {
    return Response.json({ message: "서버 환경변수 (NEXT_PUBLIC_API_BASE_URL)가 설정되지 않았습니다." }, { status: 500 });
  }
  // 1. 클라이언트(브라우저)로부터 받은 바디 추출: FormData, JSON, 또는 urlencoded에 대응
  let code: FormDataEntryValue | null = null;
  try {
    // 시도 1: multipart/form-data
    const formData = await request.formData();
    code = formData.get("code");
  } catch (e) {
    // formData 파싱 실패 시 무시하고 다음 시도
  }

  if (!code) {
    // 시도 2: JSON
    try {
      const j = await request.json().catch(() => null);
      if (j && typeof j === 'object' && 'code' in j) code = (j as any).code;
    } catch (e) {}
  }

  if (!code) {
    // 시도 3: urlencoded 또는 raw text
    try {
      const text = await request.text();
      if (text) {
        // e.g. code=... 또는 JSON-like
        try {
          const parsed = Object.fromEntries(new URLSearchParams(text));
          if (parsed.code) code = parsed.code as any;
        } catch (e) {}
      }
    } catch (e) {}
  }

  if (!code) {
    return Response.json({ message: "인증 코드가 누락되었습니다. (no code in body)" }, { status: 400 });
  }

  // 2. 서버 측에서 FastAPI 백엔드로 실제 토큰 교환 요청 전송
  try {
    // FastAPI의 Form(...)을 안전하게 만족시키기 위해 application/x-www-form-urlencoded 로 전달
    const body = new URLSearchParams();
    body.append('code', String(code));

    const headers: any = {
      'content-type': 'application/x-www-form-urlencoded'
    };
    const cookie = request.headers.get('cookie');
    if (cookie) headers['cookie'] = cookie;

    const backendResponse = await fetch(FASTAPI_TOKEN_API, {
      method: "POST",
      headers,
      body: body.toString(),
    });

    // 3. 백엔드의 응답 상태와 헤더를 클라이언트에게 그대로 전달
    const responseHeaders = new Headers(backendResponse.headers);

    // 백엔드가 설정한 Set-Cookie 헤더를 클라이언트(브라우저)에게 전달하여 쿠키를 설정
    const setCookie = backendResponse.headers.get('set-cookie');
    if (setCookie) {
      // Next.js Response 헤더에 Set-Cookie를 추가하여 브라우저로 전달
      responseHeaders.append('Set-Cookie', setCookie); 
    }

    const responseBody = await backendResponse.json();

    return new Response(JSON.stringify(responseBody), {
      status: backendResponse.status,
      headers: responseHeaders,
    });

  } catch (e) {
    console.error("FastAPI 통신 오류:", e);
    return Response.json({ message: "서버-서버 통신 오류", detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}