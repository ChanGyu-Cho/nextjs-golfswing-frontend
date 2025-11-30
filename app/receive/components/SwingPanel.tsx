"use client";

import React from "react";
import { findMetric } from "./metricUtils";

type Props = { parsedJson: any; impactFrame?: number | null };

function extractSwingMetrics(parsedJson: any) {
  const swingMetric = parsedJson?.metrics?.swing_speed || parsedJson?.swing_speed || null;
  const swingSpeedMetric = swingMetric?.metrics?.swing_speed || swingMetric?.swing_speed || null;

  let max_speed: number | null = null;
  let avg_speed: number | null = null;

  // Extract from metrics_data
  if (swingSpeedMetric?.metrics_data) {
    const keys = Object.keys(swingSpeedMetric.metrics_data || {});
    if (keys.length > 0) {
      const seriesObj = swingSpeedMetric.metrics_data[keys[0]];
      if (seriesObj && typeof seriesObj === "object") {
        const values = Object.values(seriesObj)
          .map((item: any) => {
            if (typeof item === "number") return item;
            if (item?.value !== undefined) return item.value;
            if (item?.club_head_speed !== undefined) return item.club_head_speed;
            if (item?.speed !== undefined) return item.speed;
            const vals = Object.values(item).filter((v) => typeof v === "number");
            return vals.length ? vals[0] : null;
          })
          .filter((v) => v !== null);
        if (values.length > 0) {
          max_speed = Math.max(...(values as number[]));
          avg_speed = (values as number[]).reduce((a: number, b: number) => a + b, 0) / values.length;
        }
      }
    }
  }

  // Fallback to series array
  if (max_speed === null && Array.isArray(swingSpeedMetric?.series)) {
    const values = swingSpeedMetric.series
      .map((v: any) => Number(v))
      .filter((v: number) => !Number.isNaN(v));
    if (values.length > 0) {
      max_speed = Math.max(...values);
      avg_speed = (values as number[]).reduce((a: number, b: number) => a + b, 0) / values.length;
    }
  }

  return { max_speed, avg_speed };
}

export default function SwingPanel({ parsedJson, impactFrame = null }: Props) {
  const { max_speed, avg_speed } = extractSwingMetrics(parsedJson);

  return (
    <div className="rounded p-4">
      <h3 className="font-semibold text-black dark:text-white">Swing Speed</h3>
      <div className="mt-3 text-sm">
        <div className="text-gray-700 dark:text-slate-300 mb-2">
          <span className="font-medium">최대 속도:</span> {max_speed !== null ? `${max_speed.toFixed(1)} km/h` : 'N/A'}
        </div>
        <div className="text-gray-700 dark:text-slate-300">
          <span className="font-medium">평균 속도:</span> {avg_speed !== null ? `${avg_speed.toFixed(1)} km/h` : 'N/A'}
        </div>
      </div>
    </div>
  );
}
