"use client";

import React, { useMemo } from "react";
import XfactorGraph from "./XfactorGraph";
import { findMetric } from "./metricUtils";

/**
 * ⚠️ IMPORTANT: Data Range Limitation for Clean Analysis
 * 
 * 이 로직은 모든 metrics 그래프에 적용되어야 합니다.
 * 
 * 동작: (0 ~ impact_frame) × 2 범위만 그래프에 표시
 * 예: impact_frame = 39 → 0 ~ 78까지만 표시
 * 
 * 이유:
 * - 사용자의 의도치 않은 분석 결과 방지 (임팩트 후 휴식 동작 등)
 * - 그래프 노이즈 감소로 시각적 명확도 향상
 * 
 * 범위 제한 함수:
 * const maxIndex = Math.min((impactIndex + 1) * 2 - 1, data.length - 1);
 * const limitedData = data.slice(0, maxIndex + 1);
 */
function limitDataRange(data: number[], impactFrame: number | null): number[] {
  if (impactFrame === null || data.length === 0) {
    return data;
  }
  
  const maxIndex = Math.min((impactFrame + 1) * 2 - 1, data.length - 1);
  return data.slice(0, maxIndex + 1);
}

type Props = { parsedJson: any; impactFrame?: number | null; currentFrame?: number | null };

interface XFactorFeedback {
  level: string;
  interpretation: string;
  feedback: string;
}

function getXFactorFeedback(deg: number | null): XFactorFeedback {
  if (deg === null || deg === undefined) {
    return {
      level: "알 수 없음",
      interpretation: "X-Factor 데이터를 분석할 수 없습니다.",
      feedback: "데이터를 다시 확인해 주세요.",
    };
  }

  const value = Number(deg);

  if (value < 25) {
    return {
      level: "낮음 (< 25°)",
      interpretation: "회전량이 부족합니다.",
      feedback:
        "상체와 하체의 회전 차이가 작아 파워 손실이 있습니다. 어깨 회전을 더 크게 가져가 보세요. 백스윙 시 상체가 골반보다 더 많이 돌아가도록 연습해 보세요.",
    };
  } else if (value >= 25 && value <= 40) {
    return {
      level: "적정 (25°–40°)",
      interpretation: "안정적이고 효율적입니다.",
      feedback:
        "이상적인 X-Factor 범위입니다. 상체·하체 분리 회전이 잘 이루어져 파워 전달이 효율적이에요.",
    };
  } else if (value > 40 && value <= 50) {
    return {
      level: "높음 (40°–50°)",
      interpretation: "강한 꼬임으로 파워가 있지만 부상 주의가 필요합니다.",
      feedback:
        "충분한 꼬임으로 비거리 향상에 유리합니다. 다만 허리·코어의 부담이 커질 수 있으니 유연성 훈련을 병행하세요.",
    };
  } else {
    return {
      level: "과도 (> 50°)",
      interpretation: "회전이 과도하여 불안정할 수 있습니다.",
      feedback:
        "상체 꼬임이 과도하여 임팩트 타이밍이 흔들릴 수 있습니다. 백스윙을 조금 줄여 보세요. 허리와 골반이 따로 노는 느낌이 강하면, 회전 범위를 조절해 안정감을 찾아보세요.",
    };
  }
}

function extractXFactorTimeseries(
  xfactorMetric: any,
  impactFrame: number | null | undefined
): { data: number[]; impactIndex: number | null; originalLength: number } {
  let data: number[] = [];
  let impactIndex: number | null =
    typeof impactFrame === "number" ? impactFrame : null;

  // Try to extract timeseries from metrics_data
  if (xfactorMetric?.metrics_data) {
    const keys = Object.keys(xfactorMetric.metrics_data || {});
    if (keys.length > 0) {
      const seriesObj = xfactorMetric.metrics_data[keys[0]];
      if (seriesObj && typeof seriesObj === "object") {
        const entries = Object.keys(seriesObj)
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => seriesObj[k]);

        data = entries
          .map((item: any) => {
            if (item == null) return NaN;
            if (typeof item === "number") return Number(item);
            if (item.xfactor_deg !== undefined) return Number(item.xfactor_deg);
            if (item.deg !== undefined) return Number(item.deg);
            const vals = Object.values(item).filter(
              (v) => typeof v === "number"
            );
            return vals.length ? Number(vals[0]) : NaN;
          })
          .filter((v) => !Number.isNaN(v));
      }
    }
  }

  // Fallback to series array
  if (data.length === 0 && Array.isArray(xfactorMetric?.series)) {
    data = xfactorMetric.series.map((v: any) => Number(v)).filter((v: number) => !Number.isNaN(v));
  }

  const originalLength = data.length;

  /**
   * ⚠️ IMPORTANT: Data Range Limitation for Clean Analysis
   * 
   * 이 로직은 모든 metrics 그래프에 적용되어야 합니다.
   * 자세한 내용은 METRICS_GRAPH_GUIDELINE.ts를 참고하세요.
   * 
   * 동작: (0 ~ impact_frame) × 2 범위만 그래프에 표시
   * 예: impact_frame = 39 → 0 ~ 78까지만 표시
   * 
   * 이유:
   * - 사용자의 의도치 않은 분석 결과 방지 (임팩트 후 휴식 동작 등)
   * - 그래프 노이즈 감소로 시각적 명확도 향상
   */
  const limitedData = limitDataRange(data, impactIndex);

  return { data: limitedData, impactIndex, originalLength };
}

export default function XfactorPanel({ parsedJson, impactFrame = null, currentFrame = null }: Props) {
  const xfactorMetric =
    findMetric(parsedJson, "xfactor") || parsedJson?.xfactor || null;

  // Try to extract impact_frame from xfactor metric if not provided
  let resolvedImpactFrame = impactFrame;
  if (resolvedImpactFrame === null && xfactorMetric) {
    resolvedImpactFrame = 
      xfactorMetric?.impact_frame ??
      xfactorMetric?.summary?.impact_frame ??
      xfactorMetric?.analysis?.impact_frame ??
      null;
  }

  // Get the maximum X-Factor value (at impact or overall)
  const deg =
    xfactorMetric?.summary?.xfactor_at_impact_deg ??
    xfactorMetric?.summary?.xfactor_max_deg ??
    xfactorMetric?.deg ??
    xfactorMetric?.xfactor_deg ??
    null;

  // Extract timeseries data
  const { data: timeseriesData, impactIndex, originalLength } = useMemo(() => {
    return extractXFactorTimeseries(xfactorMetric, resolvedImpactFrame);
  }, [xfactorMetric, resolvedImpactFrame]);

  const feedback = useMemo(() => getXFactorFeedback(deg), [deg]);

  if (deg === null || deg === undefined) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. X-Factor Definition Box */}
      <div className="bg-blue-50 dark:bg-slate-700 border-l-4 border-blue-500 dark:border-blue-400 rounded-r p-4">
        <div className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          💡 X-Factor 란?
        </div>
        <div className="text-sm text-blue-800 dark:text-blue-100">
          X-Factor는 어깨와 골반의 회전 차이를 나타내는 지표로, 스윙의 파워와 정확도를
          결정하는 핵심 요소입니다.
        </div>
      </div>

      {/* 2. Current X-Factor Value and Level */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
        <div className="flex items-baseline gap-3 mb-2">
          <div className="text-4xl font-bold text-black dark:text-white">
            {Number(deg).toFixed(1)}°
          </div>
          <div
            className={`text-lg font-semibold px-3 py-1 rounded ${
              Number(deg) < 25
                ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                : Number(deg) >= 25 && Number(deg) <= 40
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  : Number(deg) > 40 && Number(deg) <= 50
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
            }`}
          >
            {feedback.level}
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">
          {feedback.interpretation}
        </div>
      </div>

      {/* 3. Feedback Section */}
      <div className="bg-amber-50 dark:bg-slate-700 rounded-lg p-4 border border-amber-200 dark:border-slate-600">
        <div className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
          📌 피드백
        </div>
        <div className="text-sm text-amber-800 dark:text-amber-100 leading-relaxed">
          {feedback.feedback}
        </div>
      </div>

      {/* 4. X-Factor Timeseries Graph */}
      {timeseriesData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
          <div className="text-sm font-semibold text-black dark:text-white mb-3">
            📊 프레임별 X-Factor 변화
          </div>
          <XfactorGraph
            data={timeseriesData}
            impactFrame={impactIndex}
            currentFrame={currentFrame}
            height={380}
          />
          <div className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            빨간 점선: Impact Frame ({impactIndex !== null ? `Frame ${impactIndex}` : "N/A"}) · 파란 선: 현재 재생 위치
          </div>
        </div>
      )}
    </div>
  );
}
