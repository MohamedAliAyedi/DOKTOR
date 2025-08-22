"use client";

import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { ConnectPatientContent } from "@/components/doctor/connect-patient/ConnectPatientContent";

export default function SecretaryConnectPatientPage() {
  return (
    <SecretaryDashboardLayout>
      <ConnectPatientContent />
    </SecretaryDashboardLayout>
  );
}