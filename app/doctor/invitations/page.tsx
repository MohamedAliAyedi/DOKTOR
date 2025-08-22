"use client";

import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { InvitationRequestsContent } from "@/components/doctor/invitations/InvitationRequestsContent";

export default function InvitationRequestsPage() {
  return (
    <DashboardLayout>
      <InvitationRequestsContent />
    </DashboardLayout>
  );
}
