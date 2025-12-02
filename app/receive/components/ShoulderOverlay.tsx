"use client";

import React, { useRef, useEffect } from "react";

type Props = { resultUrls: string[] | null };

function findShoulder(resultUrls: string[] | null) {
  if (!resultUrls) return null;
  for (const u of resultUrls) {
    try {
      const p = new URL(u).pathname.toLowerCase();
      if (p.includes('shoulder') && p.endsWith('.mp4')) return u;
      if (p.includes('overlay') && p.endsWith('.mp4')) return u;
    } catch (_) {}
  }
  // fallback any mp4
  for (const u of resultUrls) if (u.toLowerCase().endsWith('.mp4')) return u;
  return null;
}

export default function ShoulderOverlay({ resultUrls }: Props) {
  const url = findShoulder(resultUrls);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ✅ 비디오 playbackRate를 75%로 설정
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
      console.log("ShoulderOverlay: playbackRate set to 0.75 (75%)");
    }
  }, [url]);

  return (
    <div className="rounded p-4">
      <h4 className="font-semibold text-black dark:text-white">Overlay</h4>
      <div className="mt-2">
        {url ? (
          <video ref={videoRef} src={url} controls className="w-full rounded" />
        ) : (
          <div className="text-sm text-gray-500 dark:text-slate-400">Overlay 없음</div>
        )}
      </div>
    </div>
  );
}
