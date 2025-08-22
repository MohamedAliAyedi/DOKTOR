"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { ConnectPatientContent } from "@/components/doctor/connect-patient/ConnectPatientContent";

export default function ConnectPatientPage() {
  return (
    <DashboardLayout>
      <ConnectPatientContent />
    </DashboardLayout>
  );
}
