"use client";

import React, { useMemo } from "react";

type Props = { parsedJson: any; impactFrame?: number | null };

function extractCOMMetrics(parsedJson: any) {
  const comMetric = parsedJson?.metrics?.com_speed || parsedJson?.com_speed || null;
  const comShiftMetric = comMetric?.metrics?.com_shift || comMetric?.com_shift || null;
  
  // Extract Back Shift (백스윙 체중 이동)
  const back_shift = 
    comShiftMetric?.summary?.back_shift_pct ??
    comShiftMetric?.summary?.back_shift ??
    comShiftMetric?.summary?.BS ??
    comShiftMetric?.summary?.bs ??
    null;

  // Extract Down Shift (다운스윙 체중 이동)
  const down_shift = 
    comShiftMetric?.summary?.down_shift_pct ??
    comShiftMetric?.summary?.down_shift ??
    comShiftMetric?.summary?.DS ??
    comShiftMetric?.summary?.ds ??
    null;

  // Extract Impact Offset (임팩트 균형)
  const impact_offset = 
    comShiftMetric?.summary?.impact_offset ??
    comShiftMetric?.summary?.impact_offset_pct ??
    comShiftMetric?.summary?.offset ??
    null;

  // Extract RMS Pre-Impact (스윙 안정성)
  const rms_pre_impact = 
    comShiftMetric?.summary?.rms_pct ??
    comShiftMetric?.summary?.rms_pre_impact ??
    comShiftMetric?.summary?.rms_pre_impact_pct ??
    comShiftMetric?.summary?.rms ??
    null;

  return { back_shift, down_shift, impact_offset, rms_pre_impact };
}

function getCOMFeedback(metric: number | null, type: 'back' | 'down' | 'offset' | 'rms'): { level: string; feedback: string } {
  if (metric === null) return { level: 'N/A', feedback: '' };

  const value = Number(metric);

  if (type === 'back') {
    // Back shift: -25% ~ 15% 이상적, > -10% 부족, < -30% 과도
    if (value > -10) {
      return {
        level: '부족',
        feedback: '백스윙 단계에서 체중 이동이 다소 부족해 회전 힘이 충분히 만들어지지 않습니다. 상체·골반의 회전 폭을 조금 더 키워보세요.',
      };
    } else if (value < -30) {
      return {
        level: '과도',
        feedback: '체중이 오른쪽으로 지나치게 이동해 스웨이(sway) 가능성이 있습니다. 허리 중심을 잡고 회전 위주로 백스윙을 해보세요.',
      };
    } else {
      return {
        level: '적정',
        feedback: '백스윙 시 체중이 오른발 방향으로 자연스럽게 이동되어 이상적인 백스윙 체중 이동을 보여줍니다.',
      };
    }
  } else if (type === 'down') {
    // Down shift: 20% ~ 30% 이상적, < 10% 부족, > 35% 과도
    if (value < 10) {
      return {
        level: '부족',
        feedback: '왼발 방향으로 체중 이동이 충분하지 않아 파워 손실이 발생할 수 있습니다. 골반 이동과 왼발 압력을 조금 더 강조해보세요.',
      };
    } else if (value > 35) {
      return {
        level: '과도',
        feedback: '체중이 너무 빨리 왼쪽으로 쏠려 임팩트 안정성이 떨어질 수 있습니다. 상체는 조금 더 뒤에 남겨두는 느낌이 좋습니다.',
      };
    } else {
      return {
        level: '적정',
        feedback: '다운스윙에서 왼발로의 체중 이동이 매우 안정적입니다. 임팩트 에너지 전달이 효율적입니다.',
      };
    }
  } else if (type === 'offset') {
    // Impact offset: 5% ~ 12% 균형, < 3% 오른발 쏠림, > 15% 왼발 과도
    if (value < 3) {
      return {
        level: '오른발 쏠림',
        feedback: '임팩트 시 체중이 오른발에 남아 있습니다. 뒤땅 또는 슬라이스 구질이 나타날 수 있습니다.',
      };
    } else if (value > 15) {
      return {
        level: '왼발 과도',
        feedback: '임팩트 순간 왼쪽으로 과하게 이동해 페이스 컨트롤이 어려워질 수 있습니다.',
      };
    } else {
      return {
        level: '균형 있음',
        feedback: '임팩트 순간의 균형이 매우 좋습니다. 체중 분배가 안정적이며 샷 일관성이 높아지는 형태입니다.',
      };
    }
  } else if (type === 'rms') {
    // RMS: < 10% 안정적, 10~20% 보통, > 20% 불안정
    if (value < 10) {
      return {
        level: '안정적',
        feedback: '스윙 전체에서 무게중심 흔들림이 매우 적습니다. 상·하체 연결이 잘 되어 안정적인 스윙입니다.',
      };
    } else if (value > 20) {
      return {
        level: '불안정',
        feedback: '스윙 내내 무게중심 흔들림이 크게 나타납니다. 이는 임팩트 편차를 만들 수 있으므로 하체·코어 안정성 훈련이 필요합니다.',
      };
    } else {
      return {
        level: '보통',
        feedback: '전체적인 흐름은 괜찮지만, 순간적으로 흔들림이 있는 구간이 있습니다. 중심축(core stability)을 조금 더 강화해보세요.',
      };
    }
  }

  return { level: 'N/A', feedback: '' };
}

export default function COMPanel({ parsedJson, impactFrame = null }: Props) {
  const { back_shift, down_shift, impact_offset, rms_pre_impact } = extractCOMMetrics(parsedJson);

  const backFeedback = getCOMFeedback(back_shift, 'back');
  const downFeedback = getCOMFeedback(down_shift, 'down');
  const offsetFeedback = getCOMFeedback(impact_offset, 'offset');
  const rmsFeedback = getCOMFeedback(rms_pre_impact, 'rms');

  return (
    <div className="flex flex-col gap-6">
      {/* 1. COM Stability Definition Box */}
      <div className="bg-blue-50 dark:bg-slate-700 border-l-4 border-blue-500 dark:border-blue-400 rounded-r p-4">
        <div className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          💡 COM Stability 란?
        </div>
        <div className="text-sm text-blue-800 dark:text-blue-100">
          COM Stability는 스윙 전체에서 몸의 중심이 얼마나 안정적으로 유지되는지를 보여주는 지표로, 일관된 타격과 거리 손실 방지에 결정적인 역할을 합니다.
        </div>
      </div>

      {/* 2. Back Shift Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
        <div className="flex items-baseline gap-3 mb-2">
          <div className="text-3xl font-bold text-black dark:text-white">
            {back_shift !== null ? `${Number(back_shift).toFixed(1)}%` : 'N/A'}
          </div>
          <div className={`text-sm font-semibold px-3 py-1 rounded ${
            backFeedback.level === '적정' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
            backFeedback.level === '부족' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
            backFeedback.level === '과도' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
            'bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-slate-200'
          }`}>
            {backFeedback.level}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">
          백스윍 체중 이동 · 적정: -15% ~ -25%
        </div>
        <div className="text-sm text-gray-700 dark:text-slate-300">
          {backFeedback.feedback}
        </div>
      </div>

      {/* 3. Down Shift Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
        <div className="flex items-baseline gap-3 mb-2">
          <div className="text-3xl font-bold text-black dark:text-white">
            {down_shift !== null ? `${Number(down_shift).toFixed(1)}%` : 'N/A'}
          </div>
          <div className={`text-sm font-semibold px-3 py-1 rounded ${
            downFeedback.level === '적정' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
            downFeedback.level === '부족' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
            downFeedback.level === '과도' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
            'bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-slate-200'
          }`}>
            {downFeedback.level}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">
          다운스윍 체중 이동 · 적정: 20% ~ 30%
        </div>
        <div className="text-sm text-gray-700 dark:text-slate-300">
          {downFeedback.feedback}
        </div>
      </div>

      {/* 4. Impact Offset Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
        <div className="flex items-baseline gap-3 mb-2">
          <div className="text-3xl font-bold text-black dark:text-white">
            {impact_offset !== null ? `${Number(impact_offset).toFixed(1)}%` : 'N/A'}
          </div>
          <div className={`text-sm font-semibold px-3 py-1 rounded ${
            offsetFeedback.level === '균형 있음' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
            offsetFeedback.level === '오른발 쏠림' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
            offsetFeedback.level === '왼발 과도' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
            'bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-slate-200'
          }`}>
            {offsetFeedback.level}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">
          임팩트 균형 지표 · 적정: 5% ~ 12%
        </div>
        <div className="text-sm text-gray-700 dark:text-slate-300">
          {offsetFeedback.feedback}
        </div>
      </div>

      {/* 5. RMS Pre-Impact Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
        <div className="flex items-baseline gap-3 mb-2">
          <div className="text-3xl font-bold text-black dark:text-white">
            {rms_pre_impact !== null ? `${Number(rms_pre_impact).toFixed(1)}%` : 'N/A'}
          </div>
          <div className={`text-sm font-semibold px-3 py-1 rounded ${
            rmsFeedback.level === '안정적' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
            rmsFeedback.level === '보통' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
            rmsFeedback.level === '불안정' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
            'bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-slate-200'
          }`}>
            {rmsFeedback.level}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">
          스윙 안정성 지수 · 안정: &lt;10%, 보통: 10~20%, 불안정: &gt;20%
        </div>
        <div className="text-sm text-gray-700 dark:text-slate-300">
          {rmsFeedback.feedback}
        </div>
      </div>
    </div>
  );
}
