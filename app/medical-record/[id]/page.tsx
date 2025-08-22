"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { MedicalRecordContent } from "@/components/medical-record/MedicalRecordContent";

export default function MedicalRecordPage() {
  return (
    <DashboardLayout>
      <MedicalRecordContent />
    </DashboardLayout>
  );
}
