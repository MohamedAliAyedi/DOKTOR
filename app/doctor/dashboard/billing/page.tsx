"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { BillingContent } from "@/components/doctor/billing/BillingContent";

export default function BillingPage() {
  return (
    <DashboardLayout>
      <BillingContent />
    </DashboardLayout>
  );
}
