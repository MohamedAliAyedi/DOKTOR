import { SecretaryDashboardLayout } from "@/components/secretary/dashboard/SecretaryDashboardLayout";
import { ConsultationHistoryContent } from "@/components/doctor/consultation-history/ConsultationHistoryContent";

export default function SecretaryDashboard() {
  return (
    <SecretaryDashboardLayout>
      <ConsultationHistoryContent />
    </SecretaryDashboardLayout>
  );
}