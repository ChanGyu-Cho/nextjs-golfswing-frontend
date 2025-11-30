"use client";

import React from "react";
import LineGraph from "./LineGraph";
import { findMetric } from "./metricUtils";

type Props = { parsedJson: any; impactFrame?: number | null };

export default function XfactorPanel({ parsedJson, impactFrame = null }: Props) {
  const metric = findMetric(parsedJson, 'xfactor') || parsedJson?.xfactor || null;
  const deg = metric?.summary?.xfactor_at_impact_deg ?? metric?.summary?.xfactor_max_deg ?? metric?.deg ?? metric?.xfactor_deg ?? null;
  const series = metric?.series || parsedJson?.debug?.xfactor_series || [];
  if (deg === null || deg === undefined) return null;

  return (
    <div className="rounded p-4">
      <h3 className="font-semibold">X-Factor</h3>
      <div className="mt-2 text-lg font-bold">{Number(deg).toFixed(1)}°</div>
      <div className="mt-2 text-sm text-gray-600">X-Factor는 어깨와 골반의 회전 차이를 나타내는 지표로, 스윙의 파워와 정확도를 결정하는 핵심 요소입니다.</div>
      <div className="mt-2 text-sm font-semibold">Your Swing Feedback</div>
      <div className="mt-1 text-sm text-gray-600">당신의 X-Factor는 {Number(deg).toFixed(1)}°로, {deg < 20 ? '낮은 수준입니다. 상체와 하체의 회전 차이가 작아 파워 전달이 부족할 수 있습니다.' : '양호한 수준입니다.'}</div>
      <div className="mt-4">
        <LineGraph data={(series || []).map(Number)} highlightIndex={impactFrame ?? null} />
      </div>
    </div>
  );
}
