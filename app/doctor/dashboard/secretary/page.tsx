"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { SecretaryManagementContent } from "@/components/doctor/secretary/SecretaryManagementContent";

export default function SecretaryManagementPage() {
  return (
    <DashboardLayout>
      <SecretaryManagementContent />
    </DashboardLayout>
  );
}
