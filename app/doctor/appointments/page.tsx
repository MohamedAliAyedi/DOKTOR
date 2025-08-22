"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { AppointmentsContent } from "@/components/doctor/appointments/AppointmentsContent";

export default function AppointmentsPage() {
  return (
    <DashboardLayout>
      <AppointmentsContent />
    </DashboardLayout>
  );
}
