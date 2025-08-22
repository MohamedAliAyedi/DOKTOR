"use client";

import { ChatContent } from "@/components/chat/ChatContent";
import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";

export default function SecretaryChatPage() {
  return (
    <SecretaryDashboardLayout>
      <ChatContent />
    </SecretaryDashboardLayout>
  );
}