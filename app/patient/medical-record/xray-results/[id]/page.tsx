"use client";

import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";
import { XRayResultsContent } from "@/components/patient/medical-record/XRayResultsContent";

export default function XRayResultsPage() {
  return (
    <PatientDashboardLayout>
      <XRayResultsContent />
    </PatientDashboardLayout>
  );
}
