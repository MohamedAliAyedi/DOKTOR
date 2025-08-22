"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, DollarSign, Clock, CheckCircle } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const billingData = [
  {
    id: 1,
    patient: "Jordy Astows",
    payment: "TND 50",
    service: "Visit + X-ray",
    status: "Paid",
  },
  {
    id: 2,
    patient: "Alica Onn",
    payment: "TND 50",
    service: "Visit",
    status: "Pending",
  },
  {
    id: 3,
    patient: "Brigitte Guerra",
    payment: "TND 50",
    service: "Visit + X-ray",
    status: "Paid",
  },
  {
    id: 4,
    patient: "Laura High",
    payment: "TND 50",
    service: "Cancelled",
    status: "Paid",
  },
  {
    id: 5,
    patient: "Paca Plaza",
    payment: "TND 50",
    service: "Visit + X-ray",
    status: "Pending",
  },
  {
    id: 6,
    patient: "Laura High",
    payment: "TND 50",
    service: "Visit",
    status: "Paid",
  },
];

const revenueChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Revenue",
      data: [20000, 35000, 25000, 45000, 30000, 40000],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.4,
      fill: true,
    },
  ],
};

const revenueChartOptions = {
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
    point: {
      radius: 0,
    },
  },
};

const totalIncomeData = {
  labels: ["Visits", "Blood Tests", "X-Ray", "Assurance", "Other"],
  datasets: [
    {
      data: [5000, 3000, 2000, 1500, 950],
      backgroundColor: ["#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"],
      borderWidth: 0,
    },
  ],
};

const totalIncomeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  cutout: "70%",
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Paid":
      return (
        <Badge className="bg-green-100 text-green-600 hover:bg-green-100 px-3 py-1 rounded-full text-xs font-medium">
          Paid
        </Badge>
      );
    case "Pending":
      return (
        <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 px-3 py-1 rounded-full text-xs font-medium">
          Pending
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
          {status}
        </Badge>
      );
  }
};

export function BillingContent() {
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        </div> */}
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32 border-gray-200 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
            <SelectItem value="Monthly">Monthly</SelectItem>
            <SelectItem value="Weekly">Weekly</SelectItem>
            <SelectItem value="Yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue this month */}
        <div className="bg-blue-500 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-2">Revenue this month</p>
              <p className="text-3xl font-bold">DT 5,000</p>
              <p className="text-blue-200 text-sm mt-1">+8% from last month</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Pending payments */}
        <div className="bg-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm mb-2">Pending payments</p>
              <p className="text-3xl font-bold">DT 1,100</p>
              <p className="text-pink-200 text-sm mt-1">
                12 invoices awaiting payment
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Paid invoices */}
        <div className="bg-blue-400 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-2">Paid invoices</p>
              <p className="text-3xl font-bold">85</p>
              <p className="text-blue-200 text-sm mt-1">
                Out of 97 total invoices
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Table */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 py-3 px-4 text-sm font-medium text-gray-500 border-b border-gray-200 mb-4">
              <div>Patient</div>
              <div>Payment</div>
              <div>Service</div>
              <div>Status</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-2">
              {billingData.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-4 gap-4 py-3 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center"
                >
                  {/* Patient */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                      {item.id}
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {item.patient}
                    </span>
                  </div>

                  {/* Payment */}
                  <div className="text-sm text-gray-600">{item.payment}</div>

                  {/* Service */}
                  <div className="text-sm text-gray-600">{item.service}</div>

                  {/* Status */}
                  <div>{getStatusBadge(item.status)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer's Assurance */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer&apos;s Assurance
              </h3>
              <Button variant="ghost" size="sm" className="text-gray-400">
                •••
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-pink-500 rounded"></div>
                  <span className="text-sm text-gray-700">CNAM</span>
                </div>
                <span className="text-sm text-gray-600">75%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-pink-300 rounded"></div>
                  <span className="text-sm text-gray-700">CNRPS</span>
                </div>
                <span className="text-sm text-gray-600">15%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-pink-200 rounded"></div>
                  <span className="text-sm text-gray-700">UNRP</span>
                </div>
                <span className="text-sm text-gray-600">10%</span>
              </div>
            </div>
          </div>

          {/* Customer's Gender */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer&apos;s Gender
              </h3>
              <Button variant="ghost" size="sm" className="text-gray-400">
                •••
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Male</span>
                </div>
                <span className="text-sm text-gray-600">56%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Female</span>
                </div>
                <span className="text-sm text-gray-600">44%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Revenue & Charts */}
        <div className="space-y-6">
          {/* Revenue Chart */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
              </div>
              <Select value="Monthly" onValueChange={() => {}}>
                <SelectTrigger className="w-24 h-8 border-gray-200 rounded-lg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900">TND 43,567.00</p>
              <p className="text-sm text-pink-500">+4% from last month</p>
            </div>

            <div className="h-32">
              <Line data={revenueChartData} options={revenueChartOptions} />
            </div>
          </div>

          {/* Total Income Doughnut Chart */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Total Income
              </h3>
              <Button variant="ghost" size="sm" className="text-gray-400">
                •••
              </Button>
            </div>

            <div className="relative h-48 mb-4">
              <Doughnut data={totalIncomeData} options={totalIncomeOptions} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">TND 12,450</p>
                  <p className="text-sm text-pink-500">
                    +2.1% from last quarter
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Visits</span>
                </div>
                <span>TND 5000</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Blood Tests</span>
                </div>
                <span>TND 3000</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>X-Ray</span>
                </div>
                <span>TND 2000</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Assurance</span>
                </div>
                <span>TND 1500</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span>Other</span>
                </div>
                <span>TND 950</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
