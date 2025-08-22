"use client";

import { ChatContent } from "@/components/chat/ChatContent";
import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";

export default function PatientChatPage() {
  return (
    <PatientDashboardLayout>
      <ChatContent />
    </PatientDashboardLayout>
  );
}
