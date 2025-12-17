"use client";

import React from "react";

type Props = { parsedJson: any };

// SummaryBar와 동일한 추출 로직 사용
import { findMetric } from "./metricUtils";

function getXfactor(parsedJson: any) {
  const m = findMetric(parsedJson, 'xfactor');
  return m?.summary?.xfactor_at_impact_deg ?? m?.summary?.xfactor_max_deg ?? m?.deg ?? m?.xfactor_deg ?? null;
}
function hasXfactorMetric(parsedJson: any) {
  const xMetricObj = findMetric(parsedJson, 'xfactor') || parsedJson?.xfactor || null;
  return Boolean(
    xMetricObj && (
      xMetricObj?.summary?.xfactor_at_impact_deg !== undefined ||
      xMetricObj?.summary?.xfactor_max_deg !== undefined ||
      xMetricObj?.deg !== undefined ||
      xMetricObj?.xfactor_deg !== undefined ||
      (Array.isArray(xMetricObj?.series) && xMetricObj.series.length > 0) ||
      (xMetricObj?.metrics && Object.keys(xMetricObj.metrics).length > 0) ||
      (xMetricObj?.metrics_data && Object.keys(xMetricObj.metrics_data).length > 0)
    )
  );
}
function getCOMSummary(parsedJson: any) {
  const comMetric = parsedJson?.metrics?.com_speed || parsedJson?.com_speed || null;
  const comShiftMetric = comMetric?.metrics?.com_shift || comMetric?.com_shift || null;
  const back_shift = 
    comShiftMetric?.summary?.back_shift_pct ??
    comShiftMetric?.summary?.back_shift ??
    comShiftMetric?.summary?.BS ??
    comShiftMetric?.summary?.bs ??
    null;
  const down_shift = 
    comShiftMetric?.summary?.down_shift_pct ??
    comShiftMetric?.summary?.down_shift ??
    comShiftMetric?.summary?.DS ??
    comShiftMetric?.summary?.ds ??
    null;
  return { back_shift, down_shift };
}
function getSwing(parsedJson: any) {
  const summary =
    parsedJson?.metrics?.swing_speed?.metrics?.swing_speed?.summary ||
    parsedJson?.metrics?.swing_speed?.summary ||
    parsedJson?.swing_speed?.summary ||
    null;
  let mph = null;
  if (summary && typeof summary === 'object') {
    if (typeof summary.club_speed_mph === 'number') mph = summary.club_speed_mph;
    if (typeof summary.club_speed_mph === 'string') mph = Number(summary.club_speed_mph);
  }
  return mph;
}
function getHead(parsedJson: any) {
  const m = findMetric(parsedJson, 'head') || findMetric(parsedJson, 'head_speed');
  return m?.summary?.grade || m?.grade || 'N/A';
}

export default function SummaryMetrics({ parsedJson }: Props) {
  const model = (parsedJson?.stgcn_inference?.prediction || parsedJson?.model_result?.prediction || parsedJson?.model?.prediction || 'N/A').toString().toUpperCase();
  const x = getXfactor(parsedJson);
  const com = getCOMSummary(parsedJson);
  const swing = getSwing(parsedJson);
  const head = getHead(parsedJson);
  const showXfactor = hasXfactorMetric(parsedJson);

  return (
    <div className="rounded p-4 bg-white dark:bg-slate-800">
      <h4 className="font-semibold text-black dark:text-white">Abstract</h4>
      <div className="mt-2 text-sm text-black dark:text-slate-300">
        <div>Model: {model}</div>
        {showXfactor && (
          <div className="mt-1">X-Factor: {x !== null && x !== undefined ? `${Number(x).toFixed(1)}°` : 'N/A'}</div>
        )}
        <div className="mt-1">COM: {com.back_shift !== null && com.down_shift !== null ? `BS:${Number(com.back_shift).toFixed(1)}% DS:${Number(com.down_shift).toFixed(1)}%` : 'N/A'}</div>
        <div className="mt-1">SWING: {swing !== null && !Number.isNaN(swing) ? `${Number(swing).toFixed(2)} mph` : 'N/A'}</div>
        <div className="mt-1">HEAD: {String(head).toUpperCase()}</div>
      </div>
    </div>
  );
}
