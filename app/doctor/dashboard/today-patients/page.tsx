"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { PatientManagementContent } from "@/components/doctor/dashboard/PatientManagementContent";

export default function TodayPatientsPage() {
  return (
    <DashboardLayout>
      <PatientManagementContent />
    </DashboardLayout>
  );
}
