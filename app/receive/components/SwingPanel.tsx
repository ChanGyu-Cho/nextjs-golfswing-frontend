"use client";

import React from "react";
import { findMetric } from "./metricUtils";

type Props = { parsedJson: any; impactFrame?: number | null };

export default function SwingPanel({ parsedJson, impactFrame = null }: Props) {
  const metric = findMetric(parsedJson, 'swing_speed') || findMetric(parsedJson, 'club_speed') || parsedJson?.metrics?.swing_speed || null;

  // prefer summary club speed (km/h) if available
  const summary = metric?.summary ?? {};
  const summarySpeed = summary?.club_speed_km_h ?? summary?.club_speed_mph ?? summary?.max_club_speed ?? null;

  // build timeseries from metrics_data if present
  let series: number[] = [];
  if (metric?.metrics_data) {
    const keys = Object.keys(metric.metrics_data || {});
    if (keys.length) {
      const obj = metric.metrics_data[keys[0]];
      const entries = Object.keys(obj).sort((a,b)=>Number(a)-Number(b)).map(k=>obj[k]);
      series = entries.map((it: any) => {
        if (it == null) return NaN;
        if (typeof it === 'number') return Number(it);
        if (it.club_speed_km_h !== undefined) return Number(it.club_speed_km_h);
        if (it.wrist_speed_km_h !== undefined) return Number(it.wrist_speed_km_h);
        if (it.wrist_speed_m_s !== undefined) return Number(it.wrist_speed_m_s);
        const vals = Object.values(it).filter((v) => typeof v === 'number');
        return vals.length ? Number(vals[0]) : NaN;
      }).filter((v)=>!Number.isNaN(v));
    }
  } else if (metric?.metrics?.swing_speed?.metrics_data) {
    const keys = Object.keys(metric.metrics.swing_speed.metrics_data || {});
    if (keys.length) {
      const obj = metric.metrics.swing_speed.metrics_data[keys[0]];
      const entries = Object.keys(obj).sort((a,b)=>Number(a)-Number(b)).map(k=>obj[k]);
      series = entries.map((it: any) => {
        if (it == null) return NaN;
        if (it.wrist_speed_km_h !== undefined) return Number(it.wrist_speed_km_h);
        if (it.club_speed_km_h !== undefined) return Number(it.club_speed_km_h);
        const vals = Object.values(it).filter((v) => typeof v === 'number');
        return vals.length ? Number(vals[0]) : NaN;
      }).filter((v)=>!Number.isNaN(v));
    }
  } else {
    series = metric?.series ?? parsedJson?.debug?.club_speed_series ?? [];
  }

  const max = (series && series.length) ? Math.max(...series.map(Number)) : (summarySpeed ? Number(summarySpeed) : null);
  const impactIndex = impactFrame ?? summary?.impact_frame ?? null;
  const impactSpeed = (typeof impactIndex === 'number' && series[impactIndex] !== undefined) ? Number(series[impactIndex]) : (summarySpeed ? Number(summarySpeed) : null);

  return (
    <div className="rounded p-4">
      <h3 className="font-semibold">SWING SPEED</h3>
      <div className="mt-2 text-xl font-bold">{max ? `${Number(max).toFixed(1)} km/h` : 'N/A'}</div>
      <div className="text-sm text-gray-600">Impact: {impactSpeed ? `${impactSpeed.toFixed(1)} km/h` : 'N/A'}</div>
    </div>
  );
}
