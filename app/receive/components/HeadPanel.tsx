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

function getHeadFeedback(grade: string, disp_max_pct: number | null): { level: string; feedback: string } {
  const gradeUpper = String(grade).toUpperCase();
  
  if (gradeUpper === 'EXCELLENT' || gradeUpper === 'GOOD') {
    return {
      level: '우수',
      feedback: '머리 움직임이 매우 안정적입니다. 임팩트 일관성이 높고 정확한 타격이 가능한 상태입니다.',
    };
  } else if (gradeUpper === 'AVERAGE' || gradeUpper === 'FAIR') {
    return {
      level: '보통',
      feedback: '머리 움직임이 약간 있지만 허용 범위 내에 있습니다. 더 안정적인 스윙을 위해 머리 고정을 의식해보세요.',
    };
  } else if (gradeUpper === 'POOR' || gradeUpper === 'EXCESSIVE') {
    return {
      level: '개선 필요',
      feedback: '머리 흔들림이 크게 나타나고 있습니다. 이는 임팩트 정확도를 떨어뜨리고 불필요한 파워 손실을 초래합니다. 코어 안정성을 강화하고 시선을 고정하는 연습이 필요합니다.',
    };
  }
  
  return { level: 'N/A', feedback: '데이터를 분석할 수 없습니다.' };
}

export default function HeadPanel({ parsedJson }: Props) {
  const { grade, disp_max_pct, impact_frame } = extractHeadMetrics(parsedJson);
  const feedback = getHeadFeedback(grade, disp_max_pct);
  const gradeUpper = String(grade).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Head Movement Definition Box */}
      <div className="bg-blue-50 dark:bg-slate-700 border-l-4 border-blue-500 dark:border-blue-400 rounded-r p-4">
        <div className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          💡 Head Movement 란?
        </div>
        <div className="text-sm text-blue-800 dark:text-blue-100">
          Head Movement는 스윙 중 머리의 움직임을 측정하여 스윙 안정성을 평가하는 지표입니다. 머리가 안정적일수록 일관된 임팩트와 정확한 타격이 가능합니다.
        </div>
      </div>

      {/* 2. Grade Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-2xl font-bold text-black dark:text-white">
            {gradeUpper}
          </div>
          <div className={`text-xs font-semibold px-2 py-0.5 rounded ${
            gradeUpper === 'EXCELLENT' || gradeUpper === 'GOOD' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
            gradeUpper === 'AVERAGE' || gradeUpper === 'FAIR' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
            gradeUpper === 'POOR' || gradeUpper === 'EXCESSIVE' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
            'bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-slate-200'
          }`}>
            {feedback.level}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">
          머리 안정성 등급
        </div>
        <div className="text-xs text-gray-700 dark:text-slate-300">
          {feedback.feedback}
        </div>
      </div>

      {/* 3. Maximum Displacement */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-2xl font-bold text-black dark:text-white">
            {disp_max_pct !== null ? `${disp_max_pct.toFixed(1)}%` : 'N/A'}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">
          최대 변위 · 적정: &lt;15%
        </div>
        <div className="text-xs text-gray-700 dark:text-slate-300">
          스윙 중 머리가 움직인 최대 거리를 나타냅니다. 15% 이하가 이상적이며, 높을수록 스윙 안정성이 떨어집니다.
        </div>
      </div>
    </div>
  );
}
