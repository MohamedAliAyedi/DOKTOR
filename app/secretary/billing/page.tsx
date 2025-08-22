"use client";

import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { BillingListContent } from "@/components/doctor/billing/BillingListContent";

export default function SecretaryBillingPage() {
  return (
    <SecretaryDashboardLayout>
      <BillingListContent />
    </SecretaryDashboardLayout>
  );
}