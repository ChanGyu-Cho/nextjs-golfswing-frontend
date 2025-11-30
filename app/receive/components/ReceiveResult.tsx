import React from "react";
import ModelSummary from "./ModelSummary";
import SummaryBar from "./SummaryBar";
import XfactorPanel from "./XfactorPanel";
import COMPanel from "./COMPanel";
import SwingPanel from "./SwingPanel";
import HeadPanel from "./HeadPanel";
import SummaryMetrics from "./SummaryMetrics";
import MetricRow from "./MetricRow";
import DebugResultJson from "./DebugResultJson";
import { findMetric } from "./metricUtils";

type Props = {
  parsedJson: any;
  resultUrls: string[] | null;
  resultContents: Array<{ url: string; type: string; content: any }> | null;
};

export default function ReceiveResult({ parsedJson, resultUrls, resultContents }: Props) {
  if (!parsedJson) return null;

  const impact_frame = parsedJson?.impact_frame ?? parsedJson?.analysis?.impact_frame ?? null;

  // Helper to get a specific metric object by canonical keys
  const getMetricObj = (key: string) => {
    return findMetric(parsedJson, key) || parsedJson?.[key] || null;
  };

  // Order of rows: XFACTOR (if present), COM, SWING SPEED, HEAD, SHOULDER
  const xMetricObj = findMetric(parsedJson, 'xfactor') || parsedJson?.xfactor || null;
  const hasXfactor = Boolean(
    xMetricObj && (
      xMetricObj?.summary?.xfactor_at_impact_deg !== undefined ||
      xMetricObj?.summary?.xfactor_max_deg !== undefined ||
      xMetricObj?.deg !== undefined ||
      xMetricObj?.xfactor_deg !== undefined ||
      (Array.isArray(xMetricObj?.series) && xMetricObj.series.length > 0) ||
      (xMetricObj?.metrics && Object.keys(xMetricObj.metrics).length > 0)
    )
  );

  return (
    <div>
      <div className="text-[30px] font-bold pb-[30px] text-[#1f8552] dark:text-[#4ade80]">Swing Metrics Analysis</div>
      <div className="flex flex-col gap-[50px]">
        <ModelSummary parsedJson={parsedJson} />
        <SummaryBar parsedJson={parsedJson} />

      {/* XFactor row (only for 3D) */}
      {hasXfactor && (
        <MetricRow
          metricKey="xfactor"
          metricObj={xMetricObj}
          resultUrls={resultUrls}
          leftNode={<XfactorPanel parsedJson={parsedJson} impactFrame={impact_frame} />}
        />
      )}

      {/* COM row */}
      <MetricRow
        metricKey="com_speed"
        metricObj={getMetricObj('com_speed') || getMetricObj('com_shift')}
        resultUrls={resultUrls}
        leftNode={<COMPanel parsedJson={parsedJson} impactFrame={impact_frame} />}
      />

      {/* Swing speed row */}
      <MetricRow
        metricKey="swing_speed"
        metricObj={getMetricObj('swing_speed') || getMetricObj('swing')}
        resultUrls={resultUrls}
        leftNode={<SwingPanel parsedJson={parsedJson} impactFrame={impact_frame} />}
      />

      {/* Head row */}
      <MetricRow
        metricKey="head"
        metricObj={getMetricObj('head') || getMetricObj('head_speed')}
        resultUrls={resultUrls}
        leftNode={<HeadPanel parsedJson={parsedJson} />}
      />

      {/* Shoulder / other overlays: show if available as its own row */}
      <MetricRow
        metricKey="shoulder_sway"
        metricObj={getMetricObj('shoulder_sway')}
        resultUrls={resultUrls}
        leftNode={<div>
          <div className="text-[26px] font-bold pb-[10px]">Shoulder</div>
          <div className="text-sm text-gray-600 dark:text-slate-400">어깨 관련 오버레이</div>
        </div>}
      />

        {/* Summary metrics at the bottom */}
        <div className="max-w-[1500px]"><SummaryMetrics parsedJson={parsedJson} /></div>

        {/* Debug Component - Remove in production */}
        <DebugResultJson resultJson={parsedJson} enabled={true} />
      </div>
    </div>
  );
}
