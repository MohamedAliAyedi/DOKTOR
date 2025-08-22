"use client";

import { ReactNode } from "react";
import { SecretarySidebar } from "./SecretarySidebar";
import { SecretaryHeader } from "./SecretaryHeader";

interface SecretaryDashboardLayoutProps {
  children: ReactNode;
}

export function SecretaryDashboardLayout({ children }: SecretaryDashboardLayoutProps) {
  return (
    <div className="dashboard-bg min-h-screen flex">
      {/* Sidebar - fixed width and position */}
      <div className="fixed left-0 top-0 h-full z-10">
        <SecretarySidebar />
      </div>

      {/* Main content - offset by sidebar width */}
      <div className="flex-1 ml-64 pl-3">
        <SecretaryHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}