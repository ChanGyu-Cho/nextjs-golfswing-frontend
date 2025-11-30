"use client";

import React from "react";

type Props = { parsedJson: any };

export default function SummaryMetrics({ parsedJson }: Props) {
  const model = (parsedJson?.stgcn_inference?.prediction || parsedJson?.model_result?.prediction || parsedJson?.model?.prediction || 'N/A').toString().toUpperCase();
  const x = parsedJson?.metrics?.xfactor?.deg ?? parsedJson?.com_shift?.xfactor_deg ?? null;
  const com = parsedJson?.metrics?.com_shift || parsedJson?.com_shift || {};
  const bs = com?.bs_percent ?? com?.BS ?? com?.bs ?? null;
  const ds = com?.ds_percent ?? com?.DS ?? com?.ds ?? null;
  const swing = parsedJson?.metrics?.club_speed?.series ? Math.max(...parsedJson.metrics.club_speed.series.map(Number)) : null;
  const head = parsedJson?.metrics?.head?.grade || parsedJson?.head?.grade || parsedJson?.metrics?.head_grade || 'N/A';

  return (
    <div className="rounded p-4">
      <h4 className="font-semibold">Summary Metrics</h4>
      <div className="mt-2 text-sm">
        <div>Model: {model}</div>
        <div className="mt-1">X-Factor: {x !== null && x !== undefined ? `${Number(x).toFixed(1)}°` : 'N/A'}</div>
        <div className="mt-1">COM: {bs !== null && ds !== null ? `BS:${bs}% DS:${ds}%` : 'N/A'}</div>
        <div className="mt-1">SWING: {swing ? `${Number(swing).toFixed(1)} km/h` : 'N/A'}</div>
        <div className="mt-1">HEAD: {String(head).toUpperCase()}</div>
      </div>
    </div>
  );
}
