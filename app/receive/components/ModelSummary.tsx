"use client";

import React from "react";

type Props = { parsedJson: any };

interface ClassificationResult {
  label: string;
  display: string;
  isAmbiguous: boolean;
  amateurProb: number;
  proProb: number;
}

function classifySwing(parsedJson: any): ClassificationResult {
  const stg = parsedJson?.stgcn_inference;
  
  // Extract probabilities (binary classification: [amateur_prob, pro_prob])
  const probs = stg?.binary_probs || stg?.probs || [0.5, 0.5];
  const amateurProb = probs[0] || 0.5;
  const proProb = probs[1] || 0.5;
  
  // Convert to percentages
  const amateurPct = amateurProb * 100;
  const proPct = proProb * 100;
  
  // Define thresholds
  const AMBIGUOUS_THRESHOLD = 40; // 40-60% range (2진 분류이므로 합은 100%)
  const CONFIDENT_THRESHOLD = 65;
  
  // Determine classification based on thresholds
  let label: string;
  let display: string;
  let isAmbiguous = false;
  
  if (amateurPct >= AMBIGUOUS_THRESHOLD && amateurPct <= 60) {
    // Ambiguous: 40-60% range
    label = 'AMBIGUOUS';
    display = 'Ambiguous Swing';
    isAmbiguous = true;
  } else if (proProb > CONFIDENT_THRESHOLD / 100) {
    // Confident Pro
    label = 'PRO';
    display = '전문가';
  } else {
    // Default to Amateur (confidence < 65%)
    label = 'ORDINARY';
    display = '일반인';
  }
  
  return {
    label,
    display,
    isAmbiguous,
    amateurProb: amateurPct,
    proProb: proPct,
  };
}

export default function ModelSummary({ parsedJson }: Props) {
  const result = classifySwing(parsedJson);
  
  let text: string;
  let bgColor: string;
  
  if (result.isAmbiguous) {
    text = '스윙 패턴이 특정 그룹(프로/일반)으로 명확히 분류되지 않습니다. 초보자 스윙에서 자주 나타나는 형태이며, 안정성이 부족해 정확한 패턴이 형성되지 않은 단계일 수 있습니다.';
    bgColor = 'bg-yellow-50';
  } else if (result.label === 'PRO') {
    text = '6,000개 이상의 스윙 데이터를 기반으로 분석한 결과, 당신의 스윙은 전문가 수준으로 평가되었습니다.';
    bgColor = 'bg-blue-50';
  } else {
    text = '6,000개 이상의 스윙 데이터를 기반으로 분석한 결과, 당신의 스윙은 일반인 수준으로 평가되었습니다.';
    bgColor = 'bg-green-50';
  }

  return (
    <div className={`${bgColor} dark:bg-slate-800 rounded-[14px] max-w-[1500px] py-[24px] px-[28px]`}>
      <div>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-[20px] font-semibold text-black dark:text-white">Model 결과</div>
            <div className="text-[30px] font-bold text-[#1f8552] dark:text-[#4ade80] mt-2">{result.display}</div>
            <div className="text-[16px] text-gray-700 dark:text-slate-300 mt-3">{text}</div>
          </div>
          
          {/* Probability Display Box */}
          <div className="ml-6 bg-white dark:bg-slate-700 rounded-[10px] p-[16px] min-w-[200px] border border-gray-200 dark:border-slate-600">
            <div className="text-[14px] font-semibold text-gray-700 dark:text-slate-200 mb-3">확률 분석</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-gray-600 dark:text-slate-400">일반인</span>
                <span className="text-[16px] font-bold text-gray-800 dark:text-white">{result.amateurProb.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-gray-600 dark:text-slate-400">프로</span>
                <span className="text-[16px] font-bold text-gray-800 dark:text-white">{result.proProb.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
