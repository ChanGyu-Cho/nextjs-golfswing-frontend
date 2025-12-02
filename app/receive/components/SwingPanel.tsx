"use client";

import React from "react";

type Props = { parsedJson: any; impactFrame?: number | null };

function extractSwingMetrics(parsedJson: any) {
  // Try different possible paths for summary
  const summary = parsedJson?.metrics?.swing_speed?.metrics?.swing_speed?.summary || 
                  parsedJson?.metrics?.swing_speed?.summary || 
                  parsedJson?.swing_speed?.summary || 
                  null;

  let wrist_mph: number | null = null;
  let club_mph: number | null = null;

  if (summary && typeof summary === 'object') {
    if (typeof summary.wrist_peak_mph === 'number') wrist_mph = summary.wrist_peak_mph;
    if (typeof summary.wrist_peak_mph === 'string') wrist_mph = Number(summary.wrist_peak_mph);
    if (typeof summary.club_speed_mph === 'number') club_mph = summary.club_speed_mph;
    if (typeof summary.club_speed_mph === 'string') club_mph = Number(summary.club_speed_mph);
  }

  return { wrist_mph, club_mph };
}

function getClubSpeedAssessment(club_mph: number | null) {
  if (club_mph === null || Number.isNaN(club_mph)) return null;

  if (club_mph < 85) {
    return {
      title: "< 85 mph — 입문/여성 아마추어",
      tip:
        "스윙 속도는 입문자 또는 여성 아마추어 평균 수준입니다. 하체 리드, 회전량 확보, 체중 이동을 강화하면 속도를 빠르게 올릴 수 있습니다.",
      badgeClass:
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-600",
      valueClass:
        "text-gray-900 dark:text-gray-100",
    };
  } else if (club_mph < 95) {
    return {
      title: "85 ~ 95 mph — Amateur (일반 남성 아마추어)",
      tip:
        "일반적인 남성 아마추어 평균 수준입니다. 스윙 기초가 잘 잡혀 있으며, 회전 효율과 하체 사용을 개선하면 더 높은 파워를 얻을 수 있습니다.",
      badgeClass:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-700/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-600/50",
      valueClass:
        "text-emerald-600 dark:text-emerald-400",
    };
  } else if (club_mph < 103) {
    return {
      title: "95 ~ 103 mph — LPGA Tour 수준",
      tip:
        "상위 아마추어·여성 투어 선수 수준의 스윙 속도입니다. 스피드 기반은 충분하며, 임팩트 품질을 정교하게 다듬으면 비거리 향상이 기대됩니다.",
      badgeClass:
        "bg-sky-100 text-sky-800 dark:bg-sky-700/40 dark:text-sky-200 border border-sky-200 dark:border-sky-600/50",
      valueClass:
        "text-sky-600 dark:text-sky-400",
    };
  } else if (club_mph < 125) {
    return {
      title: "103 ~ 125 mph — PGA Tour 수준",
      tip:
        "프로 선수 수준의 매우 우수한 스윙 속도입니다. 탄도·스매시팩터(임팩트 품질) 조절에 따라 투어급 비거리를 기대할 수 있습니다.",
      badgeClass:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-700/40 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-600/50",
      valueClass:
        "text-indigo-600 dark:text-indigo-400",
    };
  } else if (club_mph < 150) {
    return {
      title: "125 ~ 150 mph — Long Driver 수준",
      tip:
        "강력한 파워를 가진 장타자(Long Driver) 수준입니다. 스윙 파워와 회전 에너지가 매우 우수합니다.",
      badgeClass:
        "bg-orange-100 text-orange-800 dark:bg-orange-700/40 dark:text-orange-200 border border-orange-200 dark:border-orange-600/50",
      valueClass:
        "text-orange-600 dark:text-orange-400",
    };
  }

  return {
    title: "> 150 mph — World Championship Record 급",
    tip:
      "세계 장타 챔피언 수준의 비정상적으로 빠른 클럽 스피드입니다. 스윙 파워가 최고 수준이며, 비거리는 투어 평균을 크게 넘어섭니다.",
    badgeClass:
      "bg-rose-100 text-rose-800 dark:bg-rose-700/40 dark:text-rose-200 border border-rose-200 dark:border-rose-600/50",
    valueClass:
      "text-rose-600 dark:text-rose-400",
  };
}

export default function SwingPanel({ parsedJson, impactFrame = null }: Props) {
  const { wrist_mph, club_mph } = extractSwingMetrics(parsedJson);
  const assessment = getClubSpeedAssessment(club_mph);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Swing Speed Definition Box */}
      <div className="bg-blue-50 dark:bg-slate-700 border-l-4 border-blue-500 dark:border-blue-400 rounded-r p-4">
        <div className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          💡 Swing Speed 란?
        </div>
        <div className="text-sm text-blue-800 dark:text-blue-100">
          스윙 스피드는 골프에서 거리와 파워를 결정하는 가장 중요한 요소로, 손목과 클럽헤드의 최대 속도를 통해 스윙의 효율성과 타이밍을 분석할 수 있습니다.
        </div>
      </div>

      {/* 2. Wrist Speed Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-2xl font-bold text-black dark:text-white">
            {wrist_mph !== null && !Number.isNaN(wrist_mph) ? `${wrist_mph.toFixed(2)} mph` : 'N/A'}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">
          손목 최대 속도
        </div>
        <div className="text-xs text-gray-700 dark:text-slate-300">
          손목 속도는 스윙의 시작점에서 에너지 전달의 기준점이 됩니다. 클럽 헤드 속도를 예측하는 중요한 지표입니다.
        </div>
      </div>

      {/* 3. Club Speed Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
        <div className="flex items-baseline gap-2 mb-1">
          <div className={`text-2xl font-bold ${assessment?.valueClass ?? 'text-black dark:text-white'}`}>
            {club_mph !== null && !Number.isNaN(club_mph) ? `${club_mph.toFixed(2)} mph` : 'N/A'}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">
          클럽 헤드 속도
        </div>
        <div className="text-xs text-gray-700 dark:text-slate-300">
          클럽 헤드 속도는 볼의 비거리를 직접적으로 결정합니다. 손목 속도와의 비율을 통해 스윙 효율성을 평가할 수 있습니다.
        </div>
        <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 px-3 py-2 rounded-r">
          <div className="text-[11px] text-amber-800 dark:text-amber-200">
            주의: 7번 아이언 기반으로 추정된 수치입니다!<br />드라이버의 경우 더 빠를 수 있습니다.
          </div>
        </div>
        {assessment && (
          <div className="mt-3 flex flex-col gap-2">
            <div className={`w-fit text-[10px] sm:text-xs font-semibold px-2 py-1 rounded ${assessment.badgeClass}`}>
              {assessment.title}
            </div>
            <div className="text-xs text-gray-700 dark:text-slate-300">
              {assessment.tip}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
