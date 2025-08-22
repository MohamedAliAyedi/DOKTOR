"use client";

import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";
import { XRayListContent } from "@/components/patient/medical-record/XRayListContent";

export default function XRayListPage() {
  return (
    <PatientDashboardLayout>
      <XRayListContent />
    </PatientDashboardLayout>
  );
}
