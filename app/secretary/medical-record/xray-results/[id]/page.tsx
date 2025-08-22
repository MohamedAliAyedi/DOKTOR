"use client";

import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { XRayResultsContent } from "@/components/medical-record/XRayResultsContent";

export default function SecretaryXRayResultsPage() {
  return (
    <SecretaryDashboardLayout>
      <XRayResultsContent />
    </SecretaryDashboardLayout>
  );
}