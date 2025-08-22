"use client";

import { ConnectDoctorContent } from "@/components/patient/connect-doctor/ConnectDoctorContent";
import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";

export default function ConnectDoctorPage() {
  return (
    <PatientDashboardLayout>
      <ConnectDoctorContent />
    </PatientDashboardLayout>
  );
}
