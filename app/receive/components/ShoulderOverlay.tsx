"use client";

import React from "react";

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
  return (
    <div className="rounded p-4">
      <h4 className="font-semibold">Overlay</h4>
      <div className="mt-2">
        {url ? (
          <video src={url} controls className="w-full rounded" />
        ) : (
          <div className="text-sm text-gray-500">Overlay 없음</div>
        )}
      </div>
    </div>
  );
}
