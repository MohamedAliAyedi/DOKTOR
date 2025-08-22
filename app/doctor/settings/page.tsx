"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { SettingsContent } from "@/components/doctor/settings/SettingsContent";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsContent />
    </DashboardLayout>
  );
}
