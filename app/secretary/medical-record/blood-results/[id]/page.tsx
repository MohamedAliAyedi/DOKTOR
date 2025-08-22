"use client";

import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { BloodResultsContent } from "@/components/medical-record/BloodResultsContent";

export default function SecretaryBloodResultsPage() {
  return (
    <SecretaryDashboardLayout>
      <BloodResultsContent />
    </SecretaryDashboardLayout>
  );
}