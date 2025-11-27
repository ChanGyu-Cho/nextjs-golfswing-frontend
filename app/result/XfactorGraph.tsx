import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  annotationPlugin
);

function XfactorGraph() {
  const labels = Array.from({ length: 105 }, (_, i) => i); // Frame index

  const xfactorData = [
    13.56, 66.94, 66.73, 38.89, 62.50,
    64.28, 44.70, 30.44, 143.77, 56.27,
    56.18, 138.03, 9.76, 107.72, 163.12,
    163.85, 88.84, 123.17, 115.26, 124.71,
    124.79, 124.50, 139.19, 140.66, 140.57,
    124.01, 130.46, 169.22, 168.00, 168.51,
    165.64, 141.80, 102.20, 75.31, 124.67,
    89.48, 124.28, 144.54, 142.41, 144.92,
    143.55, 100.72, 131.49, 99.50, 130.24,
    107.33, 67.69, 77.27, 53.02, 35.91,
    31.86, 18.14, 8.22, 13.57, 5.85,
    18.11, 21.15, 42.71, 44.99, 74.22,
    77.14, 75.80, 75.43, 84.88, 88.47,
    93.41, 95.22, 115.30, 109.73, 144.27,
    133.31, 142.14, 146.94, 144.57, 45.49,
    39.31, 61.75, 94.38, 133.30, 156.35,
    150.02, 82.92, 66.09, 126.52, 128.21,
    124.74, 156.44, 162.72, 168.46, 150.20,
    120.77, 92.50, 156.90, 162.01, 166.33,
    178.16, 156.74, 162.61, 160.57, 152.14,
    159.09, 159.99, 167.99, 168.15, 162.92
   ]
  const impactFrame = 40;

  const data = {
    labels,
    datasets: [
      {
        label: "X-Factor (deg)",
        data: xfactorData,
        borderColor: "#d18b00",
        backgroundColor: "#d18b00",
        borderWidth: 4,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  // Build the annotations object using literal assertions for type & position,
  // then cast the whole annotations map to `any` to avoid deep generic incompatibilities.
  const annotations = {
    impactLine: {
      type: "line" as const,
      xMin: impactFrame,
      xMax: impactFrame,
      borderColor: "#d18b00",
      borderWidth: 2,
      borderDash: [6, 6],
      label: {
        display: true,
        content: "Impact",
        // position: "end",        // ← "start" 대신 end 방향으로 배치
        yAdjust: -10,           // ← 위쪽(음수)으로 살짝 올림
        position: "start" as const, // <- important: make this a literal
        // yAdjust: 20,
      },
    },
    impactPoint: {
      type: "point" as const,
      xValue: impactFrame,
      yValue: xfactorData[impactFrame],
      radius: 6,
      backgroundColor: "#d18b00",
      borderColor: "#d18b00",
    },
  } as const;

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      // cast to any to satisfy Chart.js deep-partial typings for the plugin
      annotation: {
        // here we cast annotations to `any` to avoid the deep mismatch of nested partial types
        annotations: annotations as unknown as any,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Frame",
          font: { size: 16 },
        },
      },
      y: {
        title: {
          display: true,
          text: "X-Factor (deg)",
          font: { size: 16 },
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "400px" }} className="flex items-center justify-center">
      <Line data={data} options={options} />
    </div>
  );
}

export default XfactorGraph;
