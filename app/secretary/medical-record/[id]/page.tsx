"use client";

import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { MedicalRecordContent } from "@/components/medical-record/MedicalRecordContent";

export default function SecretaryMedicalRecordPage() {
  return (
    <SecretaryDashboardLayout>
      <MedicalRecordContent />
    </SecretaryDashboardLayout>
  );
}