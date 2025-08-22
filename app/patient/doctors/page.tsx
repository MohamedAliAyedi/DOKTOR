"use client";

import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";
import { DoctorsDirectoryContent } from "@/components/patient/doctors/DoctorsDirectoryContent";

export default function DoctorsDirectoryPage() {
  return (
    <PatientDashboardLayout>
      <DoctorsDirectoryContent />
    </PatientDashboardLayout>
  );
}
