import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const job_id = url.searchParams.get('job_id')
  if (!job_id) return NextResponse.json({ error: 'job_id required' }, { status: 400 })

  const BACKEND = process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || 'http://127.0.0.1:3001'
  // Backend FastAPI mounts routers under `/api` prefix, so request the
  // full path `/api/result/status`. Keep robust trimming of trailing slash.
  const backendUrl = `${BACKEND.replace(/\/$/, '')}/api/result/status?job_id=${encodeURIComponent(job_id)}`

  try {
    const resp = await fetch(backendUrl, { method: 'GET' })
    const body = await resp.text()
    const headers: Record<string,string> = {}
    const contentType = resp.headers.get('content-type')
    if (contentType) headers['content-type'] = contentType
    return new NextResponse(body, { status: resp.status, headers })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 502 })
  }
}
