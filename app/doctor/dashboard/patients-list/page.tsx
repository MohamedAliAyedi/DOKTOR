"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { PatientListContent } from "@/components/doctor/patients-list/PatientListContent";

export default function PatientListPage() {
  return (
    <DashboardLayout>
      <PatientListContent />
    </DashboardLayout>
  );
}
