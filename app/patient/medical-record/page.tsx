"use client";

import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";
import { MedicalRecordContent } from "@/components/patient/medical-record/MedicalRecordContent";

export default function MedicalRecordPage() {
  return (
    <PatientDashboardLayout>
      <MedicalRecordContent />
    </PatientDashboardLayout>
  );
}
