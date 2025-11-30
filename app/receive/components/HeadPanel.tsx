"use client";

import React from "react";
import { findMetric } from "./metricUtils";

type Props = { parsedJson: any };

export default function HeadPanel({ parsedJson }: Props) {
  const metric = findMetric(parsedJson, 'head') || findMetric(parsedJson, 'head_speed') || parsedJson?.metrics?.head || null;
  const grade = metric?.summary?.grade || metric?.grade || metric?.metrics?.head?.grade || parsedJson?.metrics?.head?.grade || 'N/A';
  return (
    <div className="rounded p-4">
      <h3 className="font-semibold text-black dark:text-white">HEAD</h3>
      <div className="mt-2 text-lg font-bold text-black dark:text-white">{String(grade).toUpperCase()}</div>
    </div>
  );
}
