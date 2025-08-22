"use client";

import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { BloodListContent } from "@/components/medical-record/BloodListContent";

export default function SecretaryBloodListPage() {
  return (
    <SecretaryDashboardLayout>
      <BloodListContent />
    </SecretaryDashboardLayout>
  );
}