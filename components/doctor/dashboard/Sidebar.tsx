"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Calendar,
  UserCheck,
  CreditCard,
  Smartphone,
  Settings,
  Phone,
  UserPlus,
  UserCheck2,
  UserCog2,
  ChevronDown,
  ChevronRight,
  BrickWall,
  DollarSign,
  CircleDollarSign,
  Signature,
  MessageCircleReply,
  MessageSquarePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: any;
  label: string;
  href?: string;
  active?: boolean;
  badge?: string;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Overview",
    href: "/doctor/dashboard",
    active: true,
  },
  {
    icon: MessageSquarePlus,
    label: "Chat",
    href: "/chat",
  },
  {
    icon: Users,
    label: "Patients",
    subItems: [
      {
        icon: UserCheck2,
        label: "Today’s Patients",
        href: "/doctor/dashboard/today-patients",
      },
      {
        icon: Users,
        label: "Patient’s List",
        href: "/doctor/dashboard/patients-list",
      },
      {
        icon: UserPlus,
        label: "Invitation requests",
        href: "/doctor/invitations",
      },
      {
        icon: UserCog2,
        label: "Connect to patient",
        href: "/doctor/connect-patient",
      },
    ],
  },
  {
    icon: Calendar,
    label: "Appointments",
    href: "/doctor/appointments",
  },
  {
    icon: MessageSquare,
    label: "History consultation",
    href: "/doctor/dashboard/consultation-history",
  },
  {
    icon: UserCheck,
    label: "Secretary management",
    href: "/doctor/dashboard/secretary",
  },
  {
    icon: CreditCard,
    label: "Billing",
    subItems: [
      {
        icon: CircleDollarSign,
        label: "Bills Overview",
        href: "/doctor/dashboard/billing",
      },
      {
        icon: Signature,
        label: "Bills List",
        href: "/doctor/dashboard/billing-list",
      },
    ],
    // href: "/dashboard/billing",
  },
  {
    icon: Smartphone,
    label: "Application",
    href: "/doctor/dashboard/application",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/doctor/settings",
  },
  {
    icon: UserCog2,
    label: "Permissions",
    href: "/doctor/permissions",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return (
      pathname === href || (href === "/dashboard" && pathname === "/dashboard")
    );
  };

  const hasActiveChild = (subItems?: MenuItem[]): boolean => {
    if (!subItems) return false;
    return subItems.some((item) => {
      if (isActive(item.href)) return true;
      if (item.subItems) return hasActiveChild(item.subItems);
      return false;
    });
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded =
      expandedItems[item.label] || hasActiveChild(item.subItems);
    const active = isActive(item.href) || hasActiveChild(item.subItems);

    return (
      <li key={`${item.label}-${depth}`}>
        <div className="flex flex-col">
          <div
            className={cn(
              "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative",
              active && !hasActiveChild(item.subItems)
                ? "sidebar-active text-white shadow-lg"
                : "text-gray-600 hover:bg-white/50 hover:text-blue-600",
              depth > 0 && "pl-8"
            )}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.href && !hasSubItems ? (
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

            {hasSubItems && (
              <button
                onClick={() => toggleExpand(item.label)}
                className="ml-2 p-1 rounded hover:bg-white/20"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {hasSubItems && isExpanded && (
            <ul className="space-y-1 mt-1">
              {item.subItems?.map((subItem) =>
                renderMenuItem(subItem, depth + 1)
              )}
            </ul>
          )}
        </div>
      </li>
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
          {menuItems.map((item) => renderMenuItem(item))}
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
