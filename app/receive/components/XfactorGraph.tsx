"use client";

import GenericMetricGraph from "./GenericMetricGraph";

type Props = {
  data: number[];
  impactFrame: number | null;
  originalLength?: number;
  height?: number;
  currentFrame?: number | null;
  containerWidth?: number;
};


export default function XfactorGraph({
  data = [],
  impactFrame = null,
  originalLength = 0,
  height = 380,
  currentFrame = null,
  containerWidth = 900,
}: Props) {
  return (
    <GenericMetricGraph
      data={data}
      impactFrame={impactFrame}
      currentFrame={currentFrame}
      yAxisLabel="X-Factor (°)"
      lineColor="#f59e0b"
      lineColorDark="#fbbf24"
      height={height}
    />
  );
}
