import { PatientDashboardLayout } from "@/components/patient/dashboard/PatientDashboardLayout";
import { PatientWelcomeMessage } from "@/components/patient/dashboard/PatientWelcomeMessage";
import { PatientInfoCard } from "@/components/patient/dashboard/PatientInfoCard";
import { NotificationsSection } from "@/components/patient/dashboard/NotificationsSection";
import { AppointmentsSection } from "@/components/patient/dashboard/AppointmentsSection";
import { MedicationReminders } from "@/components/patient/dashboard/MedicationReminders";

export default function PatientDashboard() {
  return (
    <PatientDashboardLayout>
      <div className="space-y-6">
        <PatientWelcomeMessage />
        <PatientInfoCard />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <NotificationsSection />
            <AppointmentsSection />
          </div>
          <div>
            <MedicationReminders />
          </div>
        </div>
      </div>
    </PatientDashboardLayout>
  );
}
