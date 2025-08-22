"use client";

import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { SecretaryPatientManagementContent } from "@/components/secretary/patients/SecretaryPatientManagementContent";

export default function SecretaryTodayPatientsPage() {
  return (
    <SecretaryDashboardLayout>
      <SecretaryPatientManagementContent />
    </SecretaryDashboardLayout>
  );
}