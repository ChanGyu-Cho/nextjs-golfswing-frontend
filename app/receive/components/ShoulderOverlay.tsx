"use client";

import React from "react";

type Props = { resultUrls: string[] | null };

export default function ShoulderOverlay({ resultUrls }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Shoulder Sway Definition Box */}
      <div className="bg-blue-50 dark:bg-slate-700 border-l-4 border-blue-500 dark:border-blue-400 rounded-r p-4">
        <div className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          💡 Shoulder Sway 란?
        </div>
        <div className="text-sm text-blue-800 dark:text-blue-100">
          Shoulder Sway는 스윙의 안정성과 임팩트 일관성을 결정하는 핵심 지표입니다. 어드레스 때 설정된 어깨 유도선 안에서 회전하는 것이 이상적이며, 어깨가 선 밖으로 밀리면 스윙 밸런스와 임팩트 정확도가 떨어질 수 있습니다.
        </div>
      </div>

      {/* 2. Feedback Section */}
      <div className="bg-amber-50 dark:bg-slate-700 rounded-lg p-4 border border-amber-200 dark:border-slate-600">
        <div className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
          📌 피드백
        </div>
        <div className="text-sm text-amber-800 dark:text-amber-100 leading-relaxed">
          오른쪽 비디오에서 빨간 가이드 라인(어드레스 시 어깨 유도선)을 확인하세요. 스윙 중 어깨가 이 선 안에서 회전하면 안정적인 스윙이며, 선 밖으로 밀리면 체중 이동이나 회전축을 점검해야 합니다.
        </div>
      </div>
    </div>
  );
}
