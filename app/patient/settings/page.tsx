"use client";

import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";
import { SettingsContent } from "@/components/patient/settings/SettingsContent";

export default function PatientSettingsPage() {
  return (
    <PatientDashboardLayout>
      <SettingsContent />
    </PatientDashboardLayout>
  );
}
