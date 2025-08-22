"use client";

import { ConsultationHistoryContent } from "@/components/patient/consultation-history/ConsultationHistoryContent";
import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";

export default function ConsultationHistoryPage() {
  return (
    <PatientDashboardLayout>
      <ConsultationHistoryContent />
    </PatientDashboardLayout>
  );
}
