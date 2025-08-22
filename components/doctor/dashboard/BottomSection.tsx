"use client";

import { VisitorRevenueCard } from "./VisitorRevenueCard";
import { TotalPatientCard } from "./TotalPatientCard";
import { PatientScheduleCard } from "./PatientScheduleCard";
import { CalendarCard } from "./CalendarCard";

export function BottomSection() {
  return (
    <div className="space-y-6">
      {/* First Row - Left wider (2/3), Right narrower (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VisitorRevenueCard />
        </div>
        <div>
          <TotalPatientCard />
        </div>
      </div>

      {/* Second Row - Left wider (2/3), Right narrower (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <PatientScheduleCard />
        </div>
        <div>
          <CalendarCard />
        </div>
      </div>
    </div>
  );
}
