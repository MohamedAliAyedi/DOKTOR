"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { PermissionSettingsContent } from "@/components/secretary/permissions/PermissionSettingsContent";

export default function PermissionsPage() {
  return (
    <DashboardLayout>
      <PermissionSettingsContent />
    </DashboardLayout>
  );
}