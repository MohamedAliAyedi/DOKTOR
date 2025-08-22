"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { PatientProfileContent } from "@/components/doctor/patient-profile/PatientProfileContent";

export default function PatientProfilePage() {
  return (
    <DashboardLayout>
      <PatientProfileContent />
    </DashboardLayout>
  );
}
