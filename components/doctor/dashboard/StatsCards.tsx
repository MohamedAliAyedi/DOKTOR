"use client";

import { useEffect, useState } from "react";
import { doctorsAPI, billingAPI, appointmentsAPI } from "@/lib/api";
import { TrendingUp, Heart, Users, FileText } from "lucide-react";

export function StatsCards() {
  const [stats, setStats] = useState([
    {
      title: "Revenue this month",
      value: "DT 0",
      subtitle: "Loading...",
      icon: "$",
      bgColor: "bg-white",
      cardBg: "bg-primary",
      textColor: "text-primary",
    },
    {
      title: "Pending payments",
      value: "DT 0",
      subtitle: "Loading...",
      icon: "♥",
      bgColor: "bg-white",
      cardBg: "bg-secondary",
      textColor: "text-secondary",
    },
    {
      title: "Today's patients",
      value: "0",
      subtitle: "Loading...",
      icon: "⚡",
      bgColor: "bg-white",
      cardBg: "bg-yellow-400",
      textColor: "text-yellow-400",
    },
    {
      title: "Paid invoices",
      value: "0",
      subtitle: "Loading...",
      icon: "📋",
      bgColor: "bg-white",
      cardBg: "bg-sky-400",
      textColor: "text-sky-400",
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [doctorStats, billingStats, appointmentStats] = await Promise.all([
          doctorsAPI.getDoctorStatistics(),
          billingAPI.getBillingStatistics(),
          appointmentsAPI.getAppointmentStatistics()
        ]);

        const doctorData = doctorStats.data.data.statistics;
        const billingData = billingStats.data.data.statistics;
        const appointmentData = appointmentStats.data.data.statistics;

        setStats([
          {
            title: "Revenue this month",
            value: `DT ${doctorData.monthlyRevenue?.toLocaleString() || 0}`,
            subtitle: "This month's earnings",
            icon: "$",
            bgColor: "bg-white",
            cardBg: "bg-primary",
            textColor: "text-primary",
          },
          {
            title: "Pending payments",
            value: `DT ${billingData.pendingRevenue?.toLocaleString() || 0}`,
            subtitle: `${billingData.pendingBills || 0} invoices pending`,
            icon: "♥",
            bgColor: "bg-white",
            cardBg: "bg-secondary",
            textColor: "text-secondary",
          },
          {
            title: "Today's patients",
            value: `${doctorData.todayAppointments || 0}`,
            subtitle: "Scheduled for today",
            icon: "⚡",
            bgColor: "bg-white",
            cardBg: "bg-yellow-400",
            textColor: "text-yellow-400",
          },
          {
            title: "Paid invoices",
            value: `${billingData.paidBills || 0}`,
            subtitle: `Out of ${billingData.totalBills || 0} total invoices`,
            icon: "📋",
            bgColor: "bg-white",
            cardBg: "bg-sky-400",
            textColor: "text-sky-400",
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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