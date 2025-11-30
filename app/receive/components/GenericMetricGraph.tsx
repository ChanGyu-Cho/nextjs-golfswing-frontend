"use client";

import React from "react";

type Props = {
  data: number[];
  impactFrame: number | null;
  currentFrame?: number | null;
  yAxisLabel?: string;
  lineColor?: string;
  lineColorDark?: string;
  height?: number;
};

export default function GenericMetricGraph({
  data = [],
  impactFrame = null,
  currentFrame = null,
  yAxisLabel = "Value",
  lineColor = "#f59e0b",
  lineColorDark = "#fbbf24",
  height = 380,
}: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-slate-400 p-4 text-center">
        그래프 데이터 없음
      </div>
    );
  }

  const displayLength = data.length;
  
  // ✅ 반응형 SVG: 내부 좌표계는 고정, 렌더링은 컨테이너에 맞춤
  const internalWidth = 700; // 내부 좌표 시스템
  const internalHeight = height;

  // Calculate min/max for scaling
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // SVG padding - 내부 좌표 기준
  const padLeft = 50;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 40;

  const graphWidth = internalWidth - padLeft - padRight;
  const graphHeight = internalHeight - padTop - padBottom;

  // Generate path points for the line
  const points = data
    .map((value, idx) => {
      const x = padLeft + (idx / (displayLength - 1 || 1)) * graphWidth;
      const y = padTop + graphHeight - ((value - min) / range) * graphHeight;
      return `${x},${y}`;
    })
    .join(" ");

  // Impact frame marker position
  let impactX: number | null = null;
  let impactY: number | null = null;
  if (typeof impactFrame === "number" && impactFrame >= 0) {
    impactX = padLeft + (impactFrame / (displayLength - 1 || 1)) * graphWidth;
    if (impactFrame < data.length) {
      impactY = padTop + graphHeight - ((data[impactFrame] - min) / range) * graphHeight;
    }
  }

  // Y-axis labels
  const yLabels = [
    { value: min, label: `${min.toFixed(1)}` },
    { value: (min + max) / 2, label: `${((min + max) / 2).toFixed(1)}` },
    { value: max, label: `${max.toFixed(1)}` },
  ];

  // X-axis labels - 더 적은 개수로 표시
  const xStep = Math.max(1, Math.floor(displayLength / 4));
  const xLabels = [];
  for (let i = 0; i < displayLength; i += xStep) {
    xLabels.push(i);
  }
  if (xLabels[xLabels.length - 1] !== displayLength - 1) {
    xLabels.push(displayLength - 1);
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* SVG Container - 부모 너비에 맞춤 */}
      <svg 
        viewBox={`0 0 ${internalWidth} ${internalHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto bg-white dark:bg-slate-900 rounded"
        style={{ maxWidth: "100%", display: "block" }}
      >
        {/* Y-axis */}
        <line
          x1={padLeft}
          y1={padTop}
          x2={padLeft}
          y2={height - padBottom}
          stroke="#ccc"
          strokeWidth={1}
          className="dark:stroke-slate-600"
        />

        {/* X-axis */}
        <line
          x1={padLeft}
          y1={internalHeight - padBottom}
          x2={internalWidth - padRight}
          y2={internalHeight - padBottom}
          stroke="#ccc"
          strokeWidth={1}
          className="dark:stroke-slate-600"
        />

        {/* Y-axis grid lines and labels */}
        {yLabels.map((label, idx) => {
          const y = padTop + graphHeight - ((label.value - min) / range) * graphHeight;
          return (
            <g key={`y-${idx}`}>
              <line
                x1={padLeft}
                y1={y}
                x2={internalWidth - padRight}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray="4"
                className="dark:stroke-slate-700"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-600 dark:fill-slate-400"
              >
                {label.label}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {xLabels.map((frameIdx) => {
          const x = padLeft + (frameIdx / (displayLength - 1 || 1)) * graphWidth;
          return (
            <g key={`x-${frameIdx}`}>
              <line
                x1={x}
                y1={internalHeight - padBottom}
                x2={x}
                y2={internalHeight - padBottom + 5}
                stroke="#ccc"
                strokeWidth={1}
                className="dark:stroke-slate-600"
              />
              <text
                x={x}
                y={internalHeight - padBottom + 18}
                textAnchor="middle"
                className="text-xs fill-gray-600 dark:fill-slate-400"
              >
                {frameIdx}
              </text>
            </g>
          );
        })}

        {/* Main line chart */}
        <polyline
          fill="none"
          stroke={lineColor}
          strokeWidth={2.5}
          points={points}
        />

        {/* Data points */}
        {data.map((value, idx) => {
          const x = padLeft + (idx / (displayLength - 1 || 1)) * graphWidth;
          const y = padTop + graphHeight - ((value - min) / range) * graphHeight;
          return (
            <circle
              key={`point-${idx}`}
              cx={x}
              cy={y}
              r={2}
              fill={lineColor}
            />
          );
        })}

        {/* Impact Frame Marker */}
        {typeof impactFrame === "number" && impactX !== null && (
          <>
            {/* Vertical red line */}
            <line
              x1={impactX}
              y1={padTop}
              x2={impactX}
              y2={internalHeight - padBottom}
              stroke="#dc2626"
              strokeWidth={3}
              strokeDasharray="5,5"
              className="dark:stroke-red-500"
              opacity={1}
            />

            {/* Impact point circle */}
            {impactY !== null && (
              <circle
                cx={impactX}
                cy={impactY}
                r={5}
                fill="none"
                stroke="#dc2626"
                strokeWidth={2.5}
                className="dark:stroke-red-500"
              />
            )}

            {/* Label Box */}
            <g>
              <rect
                x={impactX - 30}
                y={padTop - 26}
                width={60}
                height={22}
                fill="#dc2626"
                rx={4}
                className="dark:fill-red-600"
              />
              <text
                x={impactX}
                y={padTop - 10}
                textAnchor="middle"
                className="text-xs font-bold fill-white"
              >
                Impact
              </text>
              <text
                x={impactX}
                y={padTop + 2}
                textAnchor="middle"
                className="text-xs fill-white"
              >
                {impactFrame}
              </text>
            </g>
          </>
        )}

        {/* Playhead (Current Frame) */}
        {typeof currentFrame === "number" &&
          currentFrame >= 0 &&
          currentFrame < displayLength && (
            <line
              x1={padLeft + (currentFrame / (displayLength - 1 || 1)) * graphWidth}
              y1={padTop}
              x2={padLeft + (currentFrame / (displayLength - 1 || 1)) * graphWidth}
              y2={height - padBottom}
              stroke="#6366f1"
              strokeWidth={1.5}
              opacity={0.5}
              className="dark:stroke-indigo-400"
            />
          )}

        {/* Axis Labels */}
        <text
          x={16}
          y={padTop / 2 + 4}
          textAnchor="middle"
          className="text-xs font-semibold fill-gray-700 dark:fill-slate-300"
        >
          {yAxisLabel}
        </text>

        <text
          x={internalWidth / 2}
          y={internalHeight - 4}
          textAnchor="middle"
          className="text-xs font-semibold fill-gray-700 dark:fill-slate-300"
        >
          Frame
        </text>
      </svg>
    </div>
  );
}
