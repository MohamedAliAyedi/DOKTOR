"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { BloodResultsContent } from "@/components/medical-record/BloodResultsContent";

export default function BloodResultsPage() {
  return (
    <DashboardLayout>
      <BloodResultsContent />
    </DashboardLayout>
  );
}
