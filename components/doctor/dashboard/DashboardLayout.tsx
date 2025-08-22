"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-bg min-h-screen flex">
      {/* Sidebar - fixed width and position */}
      <div className="fixed left-0 top-0 h-full z-10">
        <Sidebar />
      </div>

      {/* Main content - offset by sidebar width */}
      <div className="flex-1 ml-64 pl-3">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
