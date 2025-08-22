"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { ConsultationHistoryContent } from "@/components/doctor/consultation-history/ConsultationHistoryContent";

export default function ConsultationHistoryPage() {
  return (
    <DashboardLayout>
      <ConsultationHistoryContent />
    </DashboardLayout>
  );
}
