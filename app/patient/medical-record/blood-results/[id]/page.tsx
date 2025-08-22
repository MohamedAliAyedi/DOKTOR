"use client";

import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";
import { BloodResultsContent } from "@/components/patient/medical-record/BloodResultsContent";

export default function BloodResultsPage() {
  return (
    <PatientDashboardLayout>
      <BloodResultsContent />
    </PatientDashboardLayout>
  );
}
