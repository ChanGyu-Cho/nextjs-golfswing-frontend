"use client";

import React from "react";

type LineGraphProps = {
  data?: number[];
  highlightIndex?: number | null;
  width?: number;
  height?: number;
};

export default function LineGraph({ data = [], highlightIndex = null, width = 360, height = 90 }: LineGraphProps) {
  if (!data || data.length === 0) return <div className="text-sm text-gray-500">그래프 데이터 없음</div>;
  const w = width, h = height, pad = 6;
  const nums = data.map((v) => (v === null || v === undefined ? 0 : Number(v)));
  const min = Math.min(...nums), max = Math.max(...nums);
  const range = max - min || 1;
  const points = nums.map((v, i) => {
    const x = (i / (nums.length - 1)) * (w - pad * 2) + pad;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  // clamp highlightIndex to valid range and compute exact x position
  let highlightX: number | null = null;
  if (typeof highlightIndex === 'number' && !Number.isNaN(highlightIndex)) {
    const hi = Math.max(0, Math.min(Math.round(highlightIndex), nums.length - 1));
    highlightX = ((hi / (nums.length - 1)) * (w - pad * 2) + pad);
  }

  return (
    <svg width={w} height={h} className="rounded bg-white dark:bg-slate-700">
      <polyline fill="none" stroke="#3b82f6" strokeWidth={2} points={points} />
      {highlightX !== null ? (
        <>
          <line x1={highlightX} x2={highlightX} y1={pad} y2={h - pad} stroke="#ef4444" strokeWidth={2} />
          <circle cx={highlightX} cy={h - pad - ((nums[Math.max(0, Math.min(nums.length - 1, Math.round(highlightIndex || 0)))] - min) / range) * (h - pad * 2)} r={3} fill="#ef4444" />
        </>
      ) : null}
    </svg>
  );
}
