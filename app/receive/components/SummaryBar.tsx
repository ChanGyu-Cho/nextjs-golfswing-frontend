"use client";

import React from "react";

type Props = {
  parsedJson: any;
};

import { findMetric } from "./metricUtils";

function getXfactor(parsedJson: any) {
  const m = findMetric(parsedJson, 'xfactor');
  return m?.summary?.xfactor_at_impact_deg ?? m?.summary?.xfactor_max_deg ?? m?.deg ?? m?.xfactor_deg ?? null;
}

function getCOMSummary(parsedJson: any) {
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

  return { back_shift, down_shift };
}

function getSwing(parsedJson: any) {
  const m = findMetric(parsedJson, 'swing_speed') || findMetric(parsedJson, 'club_speed');
  const club = m?.series || parsedJson?.debug?.club_speed_series || [];
  const max = club && club.length ? Math.max(...club.map(Number)) : null;
  return max;
}

function getHead(parsedJson: any) {
  const m = findMetric(parsedJson, 'head') || findMetric(parsedJson, 'head_speed');
  return m?.summary?.grade || m?.grade || 'N/A';
}

export default function SummaryBar({ parsedJson }: Props) {
  const x = getXfactor(parsedJson);
  const com = getCOMSummary(parsedJson);
  const swing = getSwing(parsedJson);
  const head = getHead(parsedJson);

  return (
    <div className="rounded bg-white dark:bg-slate-800 p-4 mt-4 max-w-[1500px]">
      <div className="flex items-center justify-between">
        <div className="w-1/5 text-center">
          <div className="text-sm text-gray-500 dark:text-slate-400">model 결과</div>
          <div className="text-2xl font-bold text-black dark:text-white">{(parsedJson?.stgcn_inference?.prediction || parsedJson?.model_result?.prediction || 'N/A').toString().toUpperCase()}</div>
        </div>
        <div className="w-1/5 text-center">
          <div className="text-sm text-gray-500 dark:text-slate-400">XFACTOR</div>
          <div className="text-2xl font-bold text-black dark:text-white">{x !== null && x !== undefined ? `${Number(x).toFixed(1)}°` : 'N/A'}</div>
        </div>
        <div className="w-1/5 text-center">
          <div className="text-sm text-gray-500 dark:text-slate-400">COM</div>
          <div className="text-2xl font-bold text-black dark:text-white">{com.back_shift !== null && com.down_shift !== null ? `BS:${Number(com.back_shift).toFixed(1)}%\nDS:${Number(com.down_shift).toFixed(1)}%` : 'N/A'}</div>
        </div>
        <div className="w-1/5 text-center">
          <div className="text-sm text-gray-500 dark:text-slate-400">SWING</div>
          <div className="text-2xl font-bold text-black dark:text-white">{swing ? `${Number(swing).toFixed(1)} km/h` : 'N/A'}</div>
        </div>
        <div className="w-1/5 text-center">
          <div className="text-sm text-gray-500">HEAD</div>
          <div className="text-2xl font-bold">{String(head).toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}
