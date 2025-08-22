"use client";

import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { XRayListContent } from "@/components/medical-record/XRayListContent";

export default function SecretaryXRayListPage() {
  return (
    <SecretaryDashboardLayout>
      <XRayListContent />
    </SecretaryDashboardLayout>
  );
}