"use client";

import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { AppointmentsContent } from "@/components/doctor/appointments/AppointmentsContent";

export default function SecretaryAppointmentsPage() {
  return (
    <SecretaryDashboardLayout>
      <AppointmentsContent />
    </SecretaryDashboardLayout>
  );
}