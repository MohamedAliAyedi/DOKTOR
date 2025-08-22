import { DashboardLayout } from "@/components/doctor/dashboard/DashboardLayout";
import { WelcomeMessage } from "@/components/doctor/dashboard/WelcomeMessage";
import { StatsCards } from "@/components/doctor/dashboard/StatsCards";
import { PatientStatistic } from "@/components/doctor/dashboard/PatientStatistic";
import { BottomSection } from "@/components/doctor/dashboard/BottomSection";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <WelcomeMessage />
        <StatsCards />
        <PatientStatistic />
        <BottomSection />
      </div>
    </DashboardLayout>
  );
}
