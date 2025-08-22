"use client";

import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";
import { DoctorsContent } from "@/components/patient/doctors/DoctorsContent";

export default function MyDoctorsPage() {
  return (
    <PatientDashboardLayout>
      <DoctorsContent />
    </PatientDashboardLayout>
  );
}
