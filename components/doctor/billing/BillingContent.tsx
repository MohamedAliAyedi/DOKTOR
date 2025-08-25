"use client";

import { useState } from "react";
import { useEffect } from "react";
import { billingAPI, doctorsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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
    case "paid":
      return (
        <Badge className="bg-green-100 text-green-600 hover:bg-green-100 px-3 py-1 rounded-full text-xs font-medium">
          Paid
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 px-3 py-1 rounded-full text-xs font-medium">
          Pending
        </Badge>
      );
    case "overdue":
      return (
        <Badge className="bg-red-100 text-red-600 hover:bg-red-100 px-3 py-1 rounded-full text-xs font-medium">
          Overdue
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
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");
  const [billingStats, setBillingStats] = useState<any>({});
  const [recentBills, setRecentBills] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any>({});
  const [incomeBreakdown, setIncomeBreakdown] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, [selectedPeriod]);

  const fetchBillingData = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const [statsResponse, billsResponse, revenueResponse] = await Promise.all([
        billingAPI.getBillingStatistics(),
        billingAPI.getBills({ limit: 10 }),
        billingAPI.getRevenueReport({ period: selectedPeriod.toLowerCase() })
      ]);

      setBillingStats(statsResponse.data.data.statistics);
      setRecentBills(billsResponse.data.data.bills);

      // Process revenue data for charts
      const revenue = revenueResponse.data.data.revenueData || [];
      const labels = revenue.map((item: any) => {
        if (selectedPeriod === 'Monthly') {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months[item._id - 1] || `Month ${item._id}`;
        }
        return `Period ${item._id}`;
      });
      const values = revenue.map((item: any) => item.revenue || 0);

      setRevenueData({
        labels,
        datasets: [
          {
            label: "Revenue",
            data: values,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      });

      // Income breakdown by service type
      const breakdown = billsResponse.data.data.bills.reduce((acc: any, bill: any) => {
        const type = bill.billType || 'other';
        acc[type] = (acc[type] || 0) + bill.totalAmount;
        return acc;
      }, {});

      const breakdownData = {
        labels: Object.keys(breakdown).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
        datasets: [
          {
            data: Object.values(breakdown),
            backgroundColor: ["#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"],
            borderWidth: 0,
          },
        ],
      };

      setIncomeBreakdown(breakdownData);

    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      setError('Failed to load billing data');
      toast({
        title: "Error",
        description: "Failed to fetch billing data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <Button 
            onClick={fetchBillingData}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              <p className="text-3xl font-bold">TND {(billingStats.paidRevenue || 0).toLocaleString()}</p>
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
              <p className="text-3xl font-bold">TND {(billingStats.pendingRevenue || 0).toLocaleString()}</p>
              <p className="text-pink-200 text-sm mt-1">
                {billingStats.pendingBills || 0} invoices awaiting payment
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
              <p className="text-3xl font-bold">{billingStats.paidBills || 0}</p>
              <p className="text-blue-200 text-sm mt-1">
                Out of {billingStats.totalBills || 0} total invoices
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
              {recentBills.map((bill) => (
                <div
                  key={bill._id}
                  className="grid grid-cols-4 gap-4 py-3 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center"
                >
                  {/* Patient */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                      {bill.patient?.user?.firstName?.[0]}{bill.patient?.user?.lastName?.[0]}
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {bill.patient?.user?.firstName} {bill.patient?.user?.lastName}
                    </span>
                  </div>

                  {/* Payment */}
                  <div className="text-sm text-gray-600">TND {bill.totalAmount}</div>

                  {/* Service */}
                  <div className="text-sm text-gray-600">{bill.billType}</div>

                  {/* Status */}
                  <div>{getStatusBadge(bill.paymentStatus)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer's Insurance */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer&apos;s Insurance
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
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
              <p className="text-2xl font-bold text-gray-900">TND {(billingStats.totalRevenue || 0).toLocaleString()}</p>
              <p className="text-sm text-pink-500">+4% from last month</p>
            </div>

            <div className="h-32">
              {revenueData.labels && (
                <Line data={revenueData} options={revenueChartOptions} />
              )}
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
              {incomeBreakdown.labels && (
                <Doughnut data={incomeBreakdown} options={totalIncomeOptions} />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">TND {(billingStats.totalRevenue || 0).toLocaleString()}</p>
                  <p className="text-sm text-pink-500">
                    +2.1% from last quarter
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {incomeBreakdown.labels?.map((label: string, index: number) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: incomeBreakdown.datasets[0].backgroundColor[index] }}
                    ></div>
                    <span>{label}</span>
                  </div>
                  <span>TND {incomeBreakdown.datasets[0].data[index]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}