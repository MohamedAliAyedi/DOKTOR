"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { BloodListContent } from "@/components/medical-record/BloodListContent";

export default function BloodListPage() {
  return (
    <DashboardLayout>
      <BloodListContent />
    </DashboardLayout>
  );
}
