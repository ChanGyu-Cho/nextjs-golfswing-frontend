"use client";

import React from "react";
import LineGraph from "./LineGraph";
import { findMetric } from "./metricUtils";

type Props = { parsedJson: any; impactFrame?: number | null };

export default function COMPanel({ parsedJson, impactFrame = null }: Props) {
  const metric = findMetric(parsedJson, 'com_shift') || findMetric(parsedJson, 'com_speed');

  // determine impact frame (prefer provided prop, else metric summary)
  const impact = impactFrame ?? metric?.summary?.impact_frame ?? null;

  // Extract timeseries from possible shapes: metrics_data.*_timeseries or metrics.*.metrics_data
  let seriesObj = null;
  if (metric?.metrics_data) {
    // pick first timeseries object in metrics_data
    const keys = Object.keys(metric.metrics_data || {});
    if (keys.length) seriesObj = metric.metrics_data[keys[0]];
  } else if (metric?.metrics?.metrics_data) {
    const keys = Object.keys(metric.metrics.metrics_data || {});
    if (keys.length) seriesObj = metric.metrics.metrics_data[keys[0]];
  } else if (parsedJson?.debug?.com_series) {
    // legacy debug path
    seriesObj = parsedJson.debug.com_series;
  }

  // seriesObj may be an object with numeric keys -> convert to numeric array
  let series: number[] = [];
  if (seriesObj && typeof seriesObj === 'object') {
    const entries = Object.keys(seriesObj)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => seriesObj[k]);
    // entries are objects: pick a sensible numeric field
    series = entries.map((item: any) => {
      if (item == null) return NaN;
      if (typeof item === 'number') return Number(item);
      if (item.com_speed !== undefined) return Number(item.com_speed);
      if (item.com_rel_x !== undefined) return Number(item.com_rel_x);
      if (item.xfactor_deg !== undefined) return Number(item.xfactor_deg);
      // pick first numeric property
      const vals = Object.values(item).filter((v) => typeof v === 'number');
      return vals.length ? Number(vals[0]) : NaN;
    }).filter((v) => !Number.isNaN(v));
  }

  const bs = metric?.summary?.back_shift_pct ?? metric?.summary?.bs_percent ?? metric?.summary?.BS ?? null;
  const ds = metric?.summary?.down_shift_pct ?? metric?.summary?.ds_percent ?? metric?.summary?.DS ?? null;

  return (
    <div className="rounded p-4">
      <h3 className="font-semibold">COM</h3>
      {!series || series.length === 0 ? (
        <div className="mt-2 text-sm text-gray-500">그래프 데이터 없음</div>
      ) : (
        <div className="mt-2">
          <LineGraph data={(series || []).map(Number)} highlightIndex={impact ?? null} />
        </div>
      )}
      <div className="mt-2 text-sm text-gray-600">COM 관련 지표 (Impact 위치는 빨간선으로 표시됩니다)</div>
      <div className="mt-3 text-sm">
        <div>BS: {bs !== null && bs !== undefined ? String(bs) : 'N/A' }%</div>
        <div>DS: {ds !== null && ds !== undefined ? String(ds) : 'N/A' }%</div>
      </div>
    </div>
  );
}
