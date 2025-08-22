"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Calendar,
  CreditCard,
  Smartphone,
  Settings,
  Phone,
  FileText,
  BluetoothConnected,
  History,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: any;
  label: string;
  href?: string;
  active?: boolean;
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Overview",
    href: "/patient",
    active: true,
  },
  {
    icon: MessageSquare,
    label: "Chats",
    href: "/patient/chat",
    badge: "10",
  },
  {
    icon: Users,
    label: "Doctors",
    href: "/patient/doctors",
  },
  {
    icon: Calendar,
    label: "Appointments",
    href: "/patient/appointments",
  },
  {
    icon: FileText,
    label: "Medical Record",
    href: "/patient/medical-record",
  },
  {
    icon: ExternalLink,
    label: "Connect to Doctor",
    href: "/patient/connect-doctor",
  },
  {
    icon: MessageSquare,
    label: "History consultation",
    href: "/patient/consultation-history",
  },
  {
    icon: Smartphone,
    label: "Application",
    href: "/patient/application",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/patient/settings",
  },
];

export function PatientSidebar() {
  const pathname = usePathname();

  const isActive = (href?: string) => {
    if (!href) return false;
    return (
      pathname === href || (href === "/patient" && pathname === "/patient")
    );
  };

  return (
    <div className="w-64 h-[97vh] bg-white/60 backdrop-blur-sm flex flex-col shadow-lg rounded-2xl border-2 border-gray-50 m-3">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-600">DOKTOR</h1>
            <p className="text-xs text-gray-500 -mt-1">MEDICAL INFO ANYTIME</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 relative overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              <div
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative",
                  isActive(item.href)
                    ? "sidebar-active text-white shadow-lg"
                    : "text-gray-600 hover:bg-white/50 hover:text-blue-600"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.href ? (
                  <Link href={item.href} className="flex-1 flex items-center">
                    {item.label}
                  </Link>
                ) : (
                  <span className="flex-1">{item.label}</span>
                )}

                {item.badge && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </nav>

      <hr className="my-4 w-90" />

      {/* Emergency Contact */}
      <div className="p-4">
        <div className="rounded-lg p-4 flex justify-between">
          <div className="bg-blue-600 text-white items-center h-10 w-10 rounded-md flex justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-pink-500">
              Emergency Number:
            </span>
            <div>
              <p className="text-sm font-medium">+216 22 987 653</p>
              <p className="text-sm font-medium">+216 22 987 653</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
