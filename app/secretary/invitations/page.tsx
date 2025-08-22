"use client";

import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { InvitationRequestsContent } from "@/components/doctor/invitations/InvitationRequestsContent";

export default function SecretaryInvitationsPage() {
  return (
    <SecretaryDashboardLayout>
      <InvitationRequestsContent />
    </SecretaryDashboardLayout>
  );
}