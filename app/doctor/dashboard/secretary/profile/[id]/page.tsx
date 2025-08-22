"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { SecretaryProfileContent } from "@/components/doctor/secretary/SecretaryProfileContent";

export default function SecretaryProfilePage() {
  return (
    <DashboardLayout>
      <SecretaryProfileContent />
    </DashboardLayout>
  );
}
