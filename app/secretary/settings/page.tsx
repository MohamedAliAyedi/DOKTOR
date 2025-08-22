"use client";

import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { SecretarySettingsContent } from "@/components/secretary/settings/SecretarySettingsContent";

export default function SecretarySettingsPage() {
  return (
    <SecretaryDashboardLayout>
      <SecretarySettingsContent />
    </SecretaryDashboardLayout>
  );
}