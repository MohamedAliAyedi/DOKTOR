"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const visitorRevenueData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Visitors",
      data: [65, 59, 80, 81, 56, 55, 40],
      borderColor: "#ec4899",
      backgroundColor: "rgba(236, 72, 153, 0.1)",
      pointBackgroundColor: "#ec4899",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 4,
      tension: 0.4,
    },
    {
      label: "Revenue",
      data: [28, 48, 40, 19, 86, 27, 90],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      pointBackgroundColor: "#3b82f6",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 4,
      tension: 0.4,
    },
  ],
};

const visitorRevenueOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
    },
  },
  elements: {
    line: {
      borderWidth: 2,
    },
  },
};

export function VisitorRevenueCard() {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg flex-1 border-4 border-gray-50">
      <h3 className="text-lg font-semibold text-secondary mb-6">
        Visitor and Revenue
      </h3>

      <div className="h-40 mb-6">
        <Line data={visitorRevenueData} options={visitorRevenueOptions} />
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Visitors</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Revenue</span>
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  );
}
