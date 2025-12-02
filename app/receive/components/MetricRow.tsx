"use client";

import React, { useState, useRef, useEffect } from "react";

type Props = {
  metricKey: string;
  metricObj: any;
  leftNode: React.ReactNode | ((currentFrame: number | null) => React.ReactNode);
  resultUrls: string[] | null;
  fpsInfo?: { original_fps: number; output_fps: number };
};

function findOverlayForMetric(metricObj: any, metricKey: string, resultUrls: string[] | null) {
  // Prefer overlay fields present in the result JSON (overlay_mp4 or overlay).
  // If the JSON overlay value is a relative S3 key, attempt to resolve it to a presigned URL
  // using `resultUrls`. If resolution fails, return the relative path (frontend may serve it),
  // otherwise fall back to trying to find a matching .mp4 in `resultUrls` by metricKey.

  // collect overlay candidates from metricObj and any nested inner metrics
  const candidates: string[] = [];
  if (metricObj) {
    if (metricObj.overlay_mp4) candidates.push(metricObj.overlay_mp4);
    if (metricObj.overlay) candidates.push(metricObj.overlay);
    if (metricObj.metrics && typeof metricObj.metrics === 'object') {
      for (const k of Object.keys(metricObj.metrics)) {
        const inner = metricObj.metrics[k];
        if (inner) {
          if (inner.overlay_mp4) candidates.push(inner.overlay_mp4);
          if (inner.overlay) candidates.push(inner.overlay);
        }
      }
    }
  }

  const tryResolve = (ov: string | undefined | null) => {
    if (!ov) return null;
    const s = String(ov).trim();
    if (!s) return null;
    // if absolute URL, return as-is
    if (s.startsWith('http://') || s.startsWith('https://')) return s;

    // treat as relative S3 key -> try to match with resultUrls pathnames
    const key = s.replace(/^\//, '');
    if (resultUrls) {
      for (const u of resultUrls) {
        try {
          const p = new URL(u).pathname.replace(/^\//, '');
          if (p.endsWith(key)) return u;
        } catch (_) {}
      }
      // filename match
      const fname = key.split('/').pop() || key;
      for (const u of resultUrls) {
        try {
          const p = new URL(u).pathname.toLowerCase();
          if (p.endsWith(fname.toLowerCase()) || p.includes(fname.toLowerCase())) return u;
        } catch (_) {}
      }
      // substring heuristics
      const lower = key.toLowerCase();
      for (const u of resultUrls) {
        try {
          const p = new URL(u).pathname.toLowerCase();
          if (p.includes(lower)) return u;
        } catch (_) {}
      }
    }

    // if resolution failed, return the original relative string so frontend can optionally use it
    return s;
  };

  for (const c of candidates) {
    const resolved = tryResolve(c as string);
    if (resolved) return resolved;
  }

  // Fallback: try to find a presigned .mp4 whose path/name contains the metricKey or common synonyms
  if (resultUrls && resultUrls.length) {
    const norm = (metricKey || '').toLowerCase();
    const synonyms: Record<string, string[]> = {
      'com_shift': ['com_shift', 'com', 'com_speed', 'com-shift'],
      'com_speed': ['com_speed', 'com', 'com-speed'],
      'swing_speed': ['swing_speed', 'swing', 'club_speed', 'wrist_speed'],
      'head_speed': ['head_speed', 'head'],
      'shoulder_sway': ['shoulder_sway', 'shoulder'],
      'xfactor': ['xfactor', 'x-factor', 'x_factor'],
    };
    const tokens = synonyms[norm] ?? [norm];
    for (const u of resultUrls) {
      try {
        const p = new URL(u).pathname.toLowerCase();
        const fname = p.split('/').pop() || p;
        if (!u.toLowerCase().endsWith('.mp4')) continue;
        for (const t of tokens) {
          if (!t) continue;
          if (fname.includes(t) || p.includes(t)) return u;
        }
      } catch (_) {}
    }
    // last resort: return any mp4
    for (const u of resultUrls) if (u.toLowerCase().endsWith('.mp4')) return u;
  }

  return null;
}

export default function MetricRow({ metricKey, metricObj, leftNode, resultUrls, fpsInfo }: Props) {
  const overlay = findOverlayForMetric(metricObj, metricKey, resultUrls);
  const [currentFrame, setCurrentFrame] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ✅ fps_info 우선순위: metricObj 내부 → Props로 받은 값 → 기본값
  const fpsInfoFromMetric = metricObj?.fps_info;
  const activeFpsInfo = fpsInfoFromMetric || fpsInfo;
  
  const outputFps = activeFpsInfo?.output_fps ?? 60; // 백엔드에서 샘플링된 fps (보통 60)
  const originalFps = activeFpsInfo?.original_fps ?? outputFps; // 원본 fps (90, 60, 30 등)

  // ✅ 비디오 playbackRate를 75%로 설정
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
      console.log(`🎬 MetricRow (${metricKey}): playbackRate set to 0.75 (75%)`);
    }
  }, []);

  // 디버그: fpsInfo 로그
  React.useEffect(() => {
    console.log(`🎬 MetricRow (${metricKey}):`, {
      fpsInfoFromMetric,
      fpsInfoFromProps: fpsInfo,
      activeFpsInfo,
      outputFps,
      originalFps,
      source: fpsInfoFromMetric ? 'metricObj' : (fpsInfo ? 'props' : 'default'),
    });
  }, [fpsInfoFromMetric, fpsInfo, metricKey]);

  // ✅ 프레임 계산: 비디오는 output_fps(60fps) 기준, 그래프는 original_fps 기준
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const currentTime = video.currentTime;
      
      // 1. 비디오 기준 프레임 (60fps)
      const videoFrame = Math.floor(currentTime * outputFps);
      
      // 2. 원본 데이터 기준 프레임으로 변환
      // 예: 비디오 60fps에서 frame=30 → 원본 90fps 기준 frame=45
      const originalFrame = Math.floor((videoFrame / outputFps) * originalFps);
      
      setCurrentFrame(originalFrame);
      
      // 디버그: 30프레임마다 로그
      if (videoFrame % 30 === 0) {
        console.log(`📊 프레임 동기화 (${metricKey}):`, {
          videoTime: currentTime.toFixed(3),
          videoFrame,
          originalFrame,
          outputFps,
          originalFps,
        });
      }
    }
  };

  // Determine what to render as leftNode
  const leftContent = typeof leftNode === "function" ? leftNode(currentFrame) : leftNode;

  return (
    <div className="flex flex-row gap-[40px] bg-white dark:bg-slate-800 rounded-lg max-w-[1500px] py-[40px] px-[56px] items-center">
      {/* Left metrics panel */}
      <div className="w-[40%]">{leftContent}</div>

      {/* Right video panel - centered and right-aligned with border box */}
      <div className="w-[60%] border border-slate-200 dark:border-slate-600 rounded-lg p-[20px] flex items-center justify-center">
        {overlay ? (
          <div>
            <video 
              ref={videoRef}
              controls 
              muted 
              playsInline 
              className="w-full h-auto rounded"
              onTimeUpdate={handleTimeUpdate}
            >
              <source src={overlay} type="video/mp4" />
            </video>
            {/* ✅ fps 정보 표시 */}
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-2 text-center space-y-1">
              <div>Output FPS: {outputFps} | Original FPS: {originalFps}</div>
              <div>Current Frame (original): {currentFrame ?? '-'}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-slate-400 text-center py-[40px]">
            Overlay 없음
          </div>
        )}
      </div>
    </div>
  );
}
