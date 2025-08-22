"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Sample data for different time periods
const sampleData = {
  Monthly: {
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    oldPatient: [350, 280, 450, 380, 520, 480, 420, 380, 520, 480, 420, 350],
    newPatient: [280, 320, 380, 420, 480, 520, 380, 420, 480, 520, 380, 320],
  },
  Weekly: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    oldPatient: [120, 180, 150, 200],
    newPatient: [100, 140, 160, 180],
  },
  Daily: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    oldPatient: [25, 40, 35, 45, 30, 20, 15],
    newPatient: [20, 35, 30, 40, 25, 15, 10],
  },
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      titleColor: "#374151",
      bodyColor: "#374151",
      borderColor: "#e5e7eb",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: "#f3f4f6",
      },
      ticks: {
        color: "#9ca3af",
        font: {
          size: 12,
        },
      },
    },
    y: {
      grid: {
        display: true,
        color: "#f3f4f6",
      },
      ticks: {
        color: "#9ca3af",
        font: {
          size: 12,
        },
        stepSize: 200,
      },
      min: 0,
      max: 1000,
    },
  },
  elements: {
    line: {
      borderWidth: 3,
    },
  },
};

export function PatientStatistic() {
  const [activeTab, setActiveTab] = useState<"Monthly" | "Weekly" | "Daily">(
    "Monthly"
  );

  // Get chart data based on active tab
  const getChartData = () => {
    const data = sampleData[activeTab];

    return {
      labels: data.labels,
      datasets: [
        {
          label: "Old Patient",
          data: data.oldPatient,
          borderColor: "#ec4899",
          backgroundColor: "rgba(236, 72, 153, 0.1)",
          pointBackgroundColor: "#ec4899",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
          tension: 0.4,
          fill: true,
        },
        {
          label: "New Patient",
          data: data.newPatient,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  // Adjust y-axis scale based on active tab
  const getDynamicOptions = () => {
    const data = sampleData[activeTab];
    const maxValue = Math.max(...data.oldPatient, ...data.newPatient);
    const maxScale = Math.ceil(maxValue / 100) * 100 + 100; // Round up to nearest 100 + buffer

    return {
      ...options,
      scales: {
        ...options.scales,
        y: {
          ...options.scales.y,
          max: maxScale,
          stepSize: Math.ceil(maxScale / 5 / 100) * 100, // Dynamic step size
        },
      },
    };
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6 border-2 border-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary">
          Patient Statistic
        </h3>
        <div className="flex space-x-2">
          {(["Monthly", "Weekly", "Daily"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md rounded-lg px-4 py-2"
                  : "text-gray-600 hover:bg-gray-100 rounded-lg px-4 py-2"
              }
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-80 mb-4">
        <Line data={getChartData()} options={getDynamicOptions()} />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Old Patient</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">New Patient</span>
        </div>
      </div>
    </div>
  );
}
