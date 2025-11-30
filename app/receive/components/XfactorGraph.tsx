"use client";

import React, { useMemo } from "react";

type Props = {
  data: number[];
  impactFrame: number | null;
  originalLength?: number;
  width?: number;
  height?: number;
  currentFrame?: number | null;
};

export default function XfactorGraph({
  data = [],
  impactFrame = null,
  originalLength = 0,
  width = 1000,
  height = 380,
  currentFrame = null,
}: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-slate-400 p-4 text-center">
        그래프 데이터 없음
      </div>
    );
  }

  // Use data.length for proper scaling (don't use originalLength for x-axis scaling)
  // originalLength is kept for reference but we display what we have
  const displayLength = data.length;

  // Calculate min/max for scaling
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // SVG padding
  const padLeft = 60;
  const padRight = 40;
  const padTop = 30;
  const padBottom = 50;

  const graphWidth = width - padLeft - padRight;
  const graphHeight = height - padTop - padBottom;

  // Generate path points for the line - use displayLength for x-axis scaling
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
    // If impactFrame is within current data range, get the value
    if (impactFrame < data.length) {
      impactY = padTop + graphHeight - ((data[impactFrame] - min) / range) * graphHeight;
    }
  }

  // Y-axis labels
  const yLabels = [
    { value: min, label: `${min.toFixed(1)}°` },
    { value: (min + max) / 2, label: `${((min + max) / 2).toFixed(1)}°` },
    { value: max, label: `${max.toFixed(1)}°` },
  ];

  // X-axis labels (every 10 frames or so) - based on displayLength
  const xStep = Math.max(1, Math.floor(displayLength / 8));
  const xLabels = [];
  for (let i = 0; i < displayLength; i += xStep) {
    xLabels.push(i);
  }
  if (xLabels[xLabels.length - 1] !== displayLength - 1) {
    xLabels.push(displayLength - 1);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded p-4 overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
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
          y1={height - padBottom}
          x2={width - padRight}
          y2={height - padBottom}
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
                x2={width - padRight}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray="4"
                className="dark:stroke-slate-700"
              />
              <text
                x={padLeft - 10}
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
                y1={height - padBottom}
                x2={x}
                y2={height - padBottom + 5}
                stroke="#ccc"
                strokeWidth={1}
                className="dark:stroke-slate-600"
              />
              <text
                x={x}
                y={height - padBottom + 20}
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
          stroke="#f59e0b"
          strokeWidth={2.5}
          points={points}
          className="dark:stroke-amber-400"
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
              fill="#f59e0b"
              className="dark:fill-amber-400"
            />
          );
        })}

        {/* Impact Frame Marker - Always show if impact frame is valid */}
        {typeof impactFrame === "number" && impactX !== null && (
          <>
            {/* Vertical red line (strong visual indicator) - TEST: Make it thicker */}
            <line
              x1={impactX}
              y1={padTop}
              x2={impactX}
              y2={height - padBottom}
              stroke="#dc2626"
              strokeWidth={3}
              strokeDasharray="5,5"
              className="dark:stroke-red-500"
              opacity={1}
            />

            {/* Impact point circle - only if within data range */}
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
                x={impactX - 35}
                y={padTop - 30}
                width={70}
                height={24}
                fill="#dc2626"
                rx={4}
                className="dark:fill-red-600"
              />
              <text
                x={impactX}
                y={padTop - 12}
                textAnchor="middle"
                className="text-xs font-bold fill-white"
              >
                Impact
              </text>
              <text
                x={impactX}
                y={padTop - 1}
                textAnchor="middle"
                className="text-xs fill-white"
              >
                Frame {impactFrame}
              </text>
            </g>
          </>
        )}

        {/* Playhead (Current Frame) - Subtle vertical line for video sync */}
        {typeof currentFrame === "number" && currentFrame >= 0 && currentFrame < displayLength && (
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
          x={20}
          y={padTop / 2}
          textAnchor="middle"
          className="text-sm font-semibold fill-gray-700 dark:fill-slate-300"
        >
          X-Factor (°)
        </text>

        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          className="text-sm font-semibold fill-gray-700 dark:fill-slate-300"
        >
          Frame
        </text>
      </svg>
    </div>
  );
}
