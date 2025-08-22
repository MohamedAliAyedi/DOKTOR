"use client";

import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { NotificationsContent } from "@/components/notifications/NotificationsContent";

export default function SecretaryNotificationsPage() {
  return (
    <SecretaryDashboardLayout>
      <NotificationsContent />
    </SecretaryDashboardLayout>
  );
}