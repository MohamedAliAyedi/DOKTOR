"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { BillingListContent } from "@/components/doctor/billing/BillingListContent";

export default function BillingListPage() {
  return (
    <DashboardLayout>
      <BillingListContent />
    </DashboardLayout>
  );
}
