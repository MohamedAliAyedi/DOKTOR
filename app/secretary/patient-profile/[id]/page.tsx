"use client";

import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { PatientProfileContent } from "@/components/doctor/patient-profile/PatientProfileContent";

export default function SecretaryPatientProfilePage() {
  return (
    <SecretaryDashboardLayout>
      <PatientProfileContent />
    </SecretaryDashboardLayout>
  );
}