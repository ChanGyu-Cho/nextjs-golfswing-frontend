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

  // ✅ fps_info 추출
  const fpsInfo = parsedJson?.fps_info ?? {
    original_fps: 60,
    output_fps: 60,
  };

  // Search for impact_frame in all possible metric locations
  const impact_frame = 
    parsedJson?.impact_frame ??
    parsedJson?.analysis?.impact_frame ??
    parsedJson?.metrics?.impact_frame ??
    parsedJson?.summary?.impact_frame ??
    parsedJson?.xfactor?.summary?.impact_frame ??
    parsedJson?.metrics?.xfactor?.summary?.impact_frame ??
    parsedJson?.metrics?.head_speed?.summary?.impact_frame ??
    parsedJson?.head_speed?.summary?.impact_frame ??
    parsedJson?.metrics?.com_speed?.metrics?.com_speed?.summary?.impact_frame ??
    parsedJson?.metrics?.swing_speed?.metrics?.swing_speed?.summary?.impact_frame ??
    null;

  console.log("📍 ReceiveResult Debug:", {
    impact_frame,
    fpsInfo,
    fpsInfoRaw: parsedJson?.fps_info,
    // fps_info 찾기: 다양한 경로 확인
    fps_info_paths: {
      root: parsedJson?.fps_info,
      analysis: parsedJson?.analysis?.fps_info,
      metadata: parsedJson?.metadata?.fps_info,
    },
    hasXfactor: Boolean(parsedJson?.xfactor || findMetric(parsedJson, "xfactor")),
    xfactorStructure: parsedJson?.xfactor ? Object.keys(parsedJson.xfactor) : "not found",
    jsonKeys: Object.keys(parsedJson).slice(0, 15), // 더 많은 키 확인
  });

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
      (xMetricObj?.metrics && Object.keys(xMetricObj.metrics).length > 0) ||
      (xMetricObj?.metrics_data && Object.keys(xMetricObj.metrics_data).length > 0)
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
            fpsInfo={fpsInfo}
            leftNode={(currentFrame) => <XfactorPanel parsedJson={parsedJson} impactFrame={impact_frame} currentFrame={currentFrame} />}
          />
        )}

        {/* COM row */}
        <MetricRow
          metricKey="com_speed"
          metricObj={getMetricObj('com_speed') || getMetricObj('com_shift')}
          resultUrls={resultUrls}
          fpsInfo={fpsInfo}
          leftNode={(currentFrame) => <COMPanel parsedJson={parsedJson} impactFrame={impact_frame} currentFrame={currentFrame} />}
        />

        {/* Swing speed row */}
        <MetricRow
          metricKey="swing_speed"
          metricObj={getMetricObj('swing_speed') || getMetricObj('swing')}
          resultUrls={resultUrls}
          fpsInfo={fpsInfo}
          leftNode={<SwingPanel parsedJson={parsedJson} impactFrame={impact_frame} />}
        />

        {/* Head row */}
        <MetricRow
          metricKey="head"
          metricObj={getMetricObj('head') || getMetricObj('head_speed')}
          resultUrls={resultUrls}
          fpsInfo={fpsInfo}
          leftNode={<HeadPanel parsedJson={parsedJson} />}
        />

        {/* Shoulder / other overlays: show if available as its own row */}
        <MetricRow
          metricKey="shoulder_sway"
          metricObj={getMetricObj('shoulder_sway')}
          resultUrls={resultUrls}
          fpsInfo={fpsInfo}
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
