"use client";

import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";
import FeatureStatusCard from "@/components/shared/SoonFeat";

export default function PatientApplicationPage() {
  return (
    <PatientDashboardLayout>
      <FeatureStatusCard />
    </PatientDashboardLayout>
  );
}
