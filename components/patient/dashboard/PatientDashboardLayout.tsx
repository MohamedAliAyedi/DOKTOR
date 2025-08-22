"use client";

import { ReactNode } from "react";
import { PatientSidebar } from "./PatientSidebar";
import { PatientHeader } from "./PatientHeader";

interface PatientDashboardLayoutProps {
  children: ReactNode;
}

export function PatientDashboardLayout({
  children,
}: PatientDashboardLayoutProps) {
  return (
    <div className="dashboard-bg min-h-screen flex">
      {/* Sidebar - fixed width and position */}
      <div className="fixed left-0 top-0 h-full z-10">
        <PatientSidebar />
      </div>

      {/* Main content - offset by sidebar width */}
      <div className="flex-1 ml-64 pl-3">
        <PatientHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
