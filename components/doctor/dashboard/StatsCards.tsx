"use client";

import { useEffect, useState } from "react";
import { dashboardAPI } from "@/lib/api";
import { TrendingUp, Heart, Users, FileText } from "lucide-react";

export function StatsCards() {
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);
        const response = await dashboardAPI.getDoctorDashboardStats();
        const { statistics } = response.data.data;

        setStats([
          {
            title: "Revenue this month",
            value: `TND ${(statistics.monthlyRevenue || 0).toLocaleString()}`,
            subtitle: "This month's earnings",
            icon: "$",
            bgColor: "bg-white",
            cardBg: "bg-primary",
            textColor: "text-primary",
          },
          {
            title: "Pending payments",
            value: `TND ${(statistics.pendingRevenue || 0).toLocaleString()}`,
            subtitle: `${statistics.pendingBills || 0} invoices pending`,
            icon: "♥",
            bgColor: "bg-white",
            cardBg: "bg-secondary",
            textColor: "text-secondary",
          },
          {
            title: "Today's patients",
            value: `${statistics.todayAppointments || 0}`,
            subtitle: "Scheduled for today",
            icon: "⚡",
            bgColor: "bg-white",
            cardBg: "bg-yellow-400",
            textColor: "text-yellow-400",
          },
          {
            title: "Paid invoices",
            value: `${statistics.paidBills || 0}`,
            subtitle: `Out of ${statistics.totalBills || 0} total invoices`,
            icon: "📋",
            bgColor: "bg-white",
            cardBg: "bg-sky-400",
            textColor: "text-sky-400",
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setError('Failed to load statistics');
        // Set default stats on error
        setStats([
          {
            title: "Revenue this month",
            value: "TND 0",
            subtitle: "This month's earnings",
            icon: "$",
            bgColor: "bg-white",
            cardBg: "bg-primary",
            textColor: "text-primary",
          },
          {
            title: "Pending payments",
            value: "TND 0",
            subtitle: "0 invoices pending",
            icon: "♥",
            bgColor: "bg-white",
            cardBg: "bg-secondary",
            textColor: "text-secondary",
          },
          {
            title: "Today's patients",
            value: "0",
            subtitle: "Scheduled for today",
            icon: "⚡",
            bgColor: "bg-white",
            cardBg: "bg-yellow-400",
            textColor: "text-yellow-400",
          },
          {
            title: "Paid invoices",
            value: "0",
            subtitle: "Out of 0 total invoices",
            icon: "📋",
            bgColor: "bg-white",
            cardBg: "bg-sky-400",
            textColor: "text-sky-400",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {error && (
        <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`rounded-2xl shadow-lg text-white relative overflow-hidden`}
        >
          <div className="flex items-start justify-between h-full">
            <div
              className={`${stat.cardBg} w-1/4 h-full flex items-center justify-center text-4xl`}
            >
              {stat.icon}
            </div>
            <div className={`${stat.textColor} ${stat.bgColor} flex-1 p-4`}>
              <p className="text-xl mb-2">{stat.title}</p>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              {stat.subtitle && <p className="text-sm">{stat.subtitle}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}