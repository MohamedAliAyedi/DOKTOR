"use client";

import { AppointmentsContent } from "@/components/patient/appointments/AppointmentsContent";
import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";

export default function AppointmentsPage() {
  return (
    <PatientDashboardLayout>
      <AppointmentsContent />
    </PatientDashboardLayout>
  );
}
