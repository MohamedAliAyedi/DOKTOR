"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { NotificationsContent } from "@/components/notifications/NotificationsContent";

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <NotificationsContent />
    </DashboardLayout>
  );
}
