"use client";

import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";
import { BloodListContent } from "@/components/patient/medical-record/BloodListContent";

export default function BloodListPage() {
  return (
    <PatientDashboardLayout>
      <BloodListContent />
    </PatientDashboardLayout>
  );
}
