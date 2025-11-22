// app/uploader/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { exit } from 'process';
import { useState, useRef } from 'react';

// Client should not call the backend directly. Use local API proxy endpoints.
const BACKEND_UPLOAD_API = '/api/upload';

// WebSocket base: prefer explicit env override, otherwise connect to same origin
let WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL ?? undefined;
if (!WS_BASE_URL) {
  // Use same-origin so the browser connects to the frontend host (secure for same-EC2 setups)
  if (typeof window !== 'undefined') {
    WS_BASE_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
  }
}


export default function UploaderPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('업로드할 파일을 선택해주세요.');
    const [inProgress, setInProgress] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 💡 Job ID 상태 및 WebSocket 객체 참조 (추가된 부분)
  const [jobId, setJobId] = useState<string | null>(null); 
  const wsRef = useRef<WebSocket | null>(null); 

  // ----------------------------------------------------
  // 1. 파일 선택 핸들러
  // ----------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const isMp4 = (selectedFile.type === 'video/mp4') || selectedFile.name.toLowerCase().endsWith('.mp4');
      if (!isMp4) {
        // Reject non-mp4 file selection
        setFile(null);
        setUploadStatus(`지원되지 않는 파일 형식입니다. .mp4 파일만 업로드할 수 있습니다. 선택한 파일: ${selectedFile.name}`);
        // clear the file input so the same file can be re-selected if needed
        try { if (fileInputRef.current) fileInputRef.current.value = ''; } catch (e) {}
        return;
      }
      setFile(selectedFile);
      setUploadStatus(`파일 선택 완료: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      setFile(null);
    }
  };

  // ----------------------------------------------------
  // 2. WebSocket 연결 및 결과 수신 로직
  // ----------------------------------------------------
  const preconnectWebSocket = (openTimeout = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Require a configured WS base URL (no hardcoded localhost fallback)
        if (!WS_BASE_URL) {
          const msg = 'WebSocket 설정 오류: NEXT_PUBLIC_WS_BASE_URL 또는 NEXT_PUBLIC_BACKEND_BASE가 설정되지 않았습니다.';
          setUploadStatus((s) => s + `\n${msg}`);
          return reject(new Error(msg));
        }

        // normalize base and create socket
        const wsBase = WS_BASE_URL.replace(/\/$/, '');
        const ws = new WebSocket(`${wsBase}/api/result/ws/analysis`);
        wsRef.current = ws;

        // open timeout
        const t = setTimeout(() => {
          try { ws.close(); } catch (e) {}
          reject(new Error('WebSocket open timeout'));
        }, openTimeout);

        ws.onopen = () => {
          clearTimeout(t);
          setUploadStatus(prev => prev + '\n[단계: 1.1] WebSocket 사전 연결 성공. 준비 중...');
          resolve();
        };

        ws.onmessage = async (event) => {
          const data = JSON.parse(event.data);

          if (data.status === 'COMPLETED' && data.result_url) {
            setUploadStatus(prev => prev + `\n✅ 분석 완료! 최종 결과 URL 수신: ${data.result_url}`);
            try { ws.close(); } catch (e) {}
          }
        };

        ws.onerror = (error) => {
          clearTimeout(t);
          setUploadStatus(prev => prev + `\n[오류] WebSocket 오류 발생!`);
          console.error('WebSocket Error event:', error, 'readyState=', ws.readyState, 'url=', ws.url);
          try { ws.close(); } catch (e) {}
          reject(new Error('WebSocket error'));
        };

        ws.onclose = (ev) => {
          setUploadStatus(prev => prev + `\n[단계: 1.2] WebSocket 연결 해제됨. code=${ev?.code} reason=${ev?.reason || ''}`);
          console.info('WebSocket closed', { code: ev?.code, reason: ev?.reason, wasClean: ev?.wasClean, url: ws.url });
        };
      } catch (err) {
        reject(err);
      }
    });
  };


  // ----------------------------------------------------
  // 3. 업로드 프로세스 시작
  // ----------------------------------------------------
  const handleUpload = async () => {
    // sanity: ensure the proxy endpoint exists
    if (!BACKEND_UPLOAD_API) {
      const msg = '서버 설정 오류: 업로드 프록시가 구성되지 않았습니다.';
      console.error(msg);
      setUploadStatus(msg);
      return;
    }
    if (!file) {
      alert('먼저 파일을 선택해주세요.');
      return;
    }

    // Extra safety: ensure file is mp4 before proceeding
    const isMp4 = (file.type === 'video/mp4') || file.name.toLowerCase().endsWith('.mp4');
    if (!isMp4) {
      setUploadStatus('지원되지 않는 파일 형식입니다. .mp4 파일만 업로드할 수 있습니다.');
      return;
    }

  setInProgress(true);
  setUploadStatus('1/3 단계: S3 Pre-signed URL 및 Job ID 요청 중...');

    try {
      // 1. Job ID 및 Presigned URL 요청
      const payload = {
        upload_source: '2D',
        original_filename: file.name,
        file_type: file.type || 'application/octet-stream',
        file_size_bytes: file.size,
      };

      const response = await fetch(BACKEND_UPLOAD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include', 
      });

      if (!response.ok) {
        // 인증 필요(401)인 경우: 사용자에게 친절히 안내하고 로그인 페이지로 유도
        if (response.status === 401) {
          const err = await response.json().catch(() => ({}));
          const msg = err.message || err.detail || '로그인이 필요합니다. 로그인 페이지로 이동합니다.';
          setUploadStatus(prev => prev + `\n⚠ 인증 필요: ${msg}`);
          // 예비로 열어둔 WebSocket 정리
          if (wsRef.current) { try { wsRef.current.close(); } catch(e) {} }
          setInProgress(false);
          // 짧게 보여준 뒤 로그인 페이지로 이동
          setTimeout(() => router.push('/login'), 1200);
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.message || `백엔드 오류: ${response.status}`);
      }

      const data = await response.json();
      const job_id = data.job_id;
      const presignedUrl = data.presigned_url || data.url;
      
      setJobId(job_id);

      setUploadStatus(prev => prev + `\n[단계: 2/3] Job ID ${job_id} 수신. 업로드 시작...`);

      // 3. S3로 파일 업로드
      setUploadStatus(prev => prev + '\n[단계: 3/3] S3에 파일 직접 업로드 중...');

      // Debug logging: show which file and presigned URL will be used for PUT
      try {
        const currentFile = fileInputRef.current?.files?.[0];
        console.info('[Uploader] About to PUT. file state:', {
          selectedFile_name: file?.name,
          selectedFile_size: file?.size,
          inputFile_name: currentFile?.name,
          inputFile_size: currentFile?.size,
          job_id: job_id,
          presignedUrl: presignedUrl
        });
      } catch (e) {
        console.warn('Failed to log file input state', e);
      }

      const s3UploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });

      if (!s3UploadResponse.ok) {
        throw new Error(`S3 업로드 실패: ${s3UploadResponse.status} ${s3UploadResponse.statusText}`);
      }

      // 업로드 성공. 이제 Result 페이지로 이동하여 WebSocket 푸시(프레젠즈드 GET)를 기다립니다.
      const successMsg = `🎉 업로드 성공! Job ID: ${job_id}. 서버 분석 시작, 결과 대기 중...`;
      setUploadStatus(successMsg);
      setInProgress(false);



      // 결과(수신) 페이지로 이동(현재는 result가 아닌, receive로 이동, receive 쪽에서 WS 재연결 및 등록 처리)
      router.push(`/receive?job_id=${encodeURIComponent(job_id)}`);
      
    } catch (error) {
      console.error('업로드 실패 상세:', error);
      setUploadStatus(`❌ 업로드 실패: ${error instanceof Error ? error.message : String(error)}`);
      if (wsRef.current) wsRef.current.close();
      setInProgress(false);
    }
  };
  
  // ----------------------------------------------------
  // 4. 로그아웃 핸들러
  // ----------------------------------------------------
  const handleLogout = async () => {
      try {
        // 서버에 로그아웃 요청 (HttpOnly 쿠키 삭제) via local proxy
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        }).catch(()=>{});
      // 만약 로컬Storage에 토큰/세션이 있다면 같이 제거
      try { localStorage.removeItem('access_token'); localStorage.removeItem('id_token'); } catch(e){}
      setUploadStatus(prev => prev + '\n로그아웃 완료');
      router.push('/login');
    } catch (e) {
      console.error('로그아웃 실패', e);
      setUploadStatus(prev => prev + '\n로그아웃 실패');
    }
  };

  // ----------------------------------------------------
  // 5. UI 렌더링 (CSS 클래스 적용)
  // ----------------------------------------------------

  return (
    <div className="card-container">
      <h1>🎥 비디오 업로드 및 실시간 분석</h1>

      <div style={{ margin: '20px 0' }}>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".mp4,video/mp4" 
          style={{ display: 'block', marginBottom: '10px' }}
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || inProgress}
        className="btn-primary"
      >
        {file ? `${file.name} 업로드 시작` : '파일을 선택하세요'}
  </button>

      <pre className="log-output"> 
        {uploadStatus}
        {jobId && !uploadStatus.includes('성공') && !uploadStatus.includes('실패') && !uploadStatus.includes('해제됨') && (
          <div>{'\n\n'}[대기 중] WebSocket 연결 유지: Job ID {jobId}</div>
        )}
      </pre>
      
      <hr style={{ margin: '30px 0' }} />
      
      <button 
        onClick={handleLogout} 
        className="logout-button"
      >
        로그아웃 (토큰 세션 제거 필요)
      </button>
    </div>
  );
}