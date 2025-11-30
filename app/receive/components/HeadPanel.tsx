"use client";

import React from "react";
import { findMetric } from "./metricUtils";

type Props = { parsedJson: any };

function extractHeadMetrics(parsedJson: any) {
  const headMetric = parsedJson?.metrics?.head_speed || parsedJson?.head_speed || null;
  const summary = headMetric?.summary || null;

  const grade = summary?.grade ?? "N/A";
  const disp_max_pct = summary?.disp_max_pct ?? null;
  const impact_frame = summary?.impact_frame ?? null;

  return { grade, disp_max_pct, impact_frame };
}

export default function HeadPanel({ parsedJson }: Props) {
  const { grade, disp_max_pct, impact_frame } = extractHeadMetrics(parsedJson);

  return (
    <div className="rounded p-4">
      <h3 className="font-semibold text-black dark:text-white">Head Movement</h3>
      <div className="mt-3 text-sm">
        <div className="text-gray-700 dark:text-slate-300 mb-2">
          <span className="font-medium">등급:</span> {String(grade).toUpperCase()}
        </div>
        <div className="text-gray-700 dark:text-slate-300 mb-2">
          <span className="font-medium">최대 변위:</span> {disp_max_pct !== null ? `${disp_max_pct.toFixed(1)}%` : 'N/A'}
        </div>
        <div className="text-gray-700 dark:text-slate-300">
          <span className="font-medium">Impact Frame:</span> {impact_frame !== null ? `Frame ${impact_frame}` : 'N/A'}
        </div>
      </div>
    </div>
  );
}
