import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
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
  const labels = Array.from({ length: 95 }, (_, i) => i); // Frame index

  const xfactorData = [
    -5, -6, -5, -4, -3, -2, 1, 5, 10, 14, 15, 10, -2, -15, -25, -33, -38, -36,
    -28, -15, 2, 14, 16, 10, 1, -3, 5, 15, 22, 30, 40, 58, 42, 39, 46, 45, 30,
    12, 5, 1, -2, 3, 8, 10, 3, -8, -15, -18, -10, -2, 3,
  ];

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
      {
        // Impact vertical line
        label: "Impact",
        data: labels.map((x) => (x === impactFrame ? null : null)),
        borderColor: "rgba(209,140,0,0.8)",
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      annotation: {
        annotations: {
          impactLine: {
            type: "line",
            xMin: impactFrame,
            xMax: impactFrame,
            borderColor: "#d18b00",
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              content: "Impact",
              position: "start",
              yAdjust: 20,
            },
          },
          impactPoint: {
            type: "point",
            xValue: impactFrame,
            yValue: xfactorData[impactFrame],
            radius: 6,
            backgroundColor: "#d18b00",
            borderColor: "#d18b00",
          },
        },
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
    <div style={{ width: "100%", height: "500px" }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default XfactorGraph;
