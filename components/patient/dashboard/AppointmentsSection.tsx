"use client";

import { useState, useEffect } from "react";
import { appointmentsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Bell } from "lucide-react";

export function AppointmentsSection() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
    try {
      setError(null);
      const response = await appointmentsAPI.getUpcomingAppointments({
        limit: 3,
      });
      setAppointments(response.data.data.appointments);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setError("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTimeUntil = (scheduledDate: string, scheduledTime: string) => {
    const appointmentDateTime = new Date(scheduledDate);
    const [hours, minutes] = scheduledTime.split(":");
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

    const now = new Date();
    const diffTime = appointmentDateTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return "Past";
    return `in ${diffDays} days`;
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary">
          Your appointments
        </h3>
        <Button
          variant="ghost"
          className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1"
        >
          <span>Go to Calendar</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <Button
            onClick={fetchUpcomingAppointments}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </Button>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No upcoming appointments
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={appointment.doctor?.user?.avatar} />
                  <AvatarFallback>
                    {appointment.doctor?.user?.firstName?.[0]}
                    {appointment.doctor?.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    Dr. {appointment.doctor?.user?.firstName}{" "}
                    {appointment.doctor?.user?.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.scheduledDate).toLocaleDateString()} •{" "}
                    {appointment.scheduledTime.start}
                  </p>
                  <p className="text-xs text-blue-500 font-medium">
                    {calculateTimeUntil(
                      appointment.scheduledDate,
                      appointment.scheduledTime.start
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-pink-500 text-pink-500 hover:bg-pink-50 rounded-full px-4 py-2 flex items-center space-x-2"
              >
                <span>Set reminder</span>
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
