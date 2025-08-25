"use client";

import { useState, useEffect } from "react";
import { dashboardAPI } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";


export function PatientScheduleCard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setError(null);
        const response = await dashboardAPI.getDoctorDashboardStats();
        const { recentAppointments } = response.data.data;
        
        const formattedAppointments = (recentAppointments || []).map((apt: any) => ({
          id: apt._id,
          name: `${apt.patient.user.firstName} ${apt.patient.user.lastName}`,
          time: `${apt.scheduledTime.start} - ${apt.scheduledTime.end}`,
          avatar: apt.patient.user.avatar || "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
          appointmentId: apt.appointmentId
        }));
        
        setAppointments(formattedAppointments);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
        setError('Failed to load appointments');
        setAppointments([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex-1">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-pink-600">
            Patient&apos;s schedule
          </h3>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}</p>
        </div>
        <div className="flex -space-x-2">
          {appointments.slice(0, 4).map((appointment, index) => (
            <Avatar key={index} className="w-10 h-10 border-2 border-white">
              <AvatarImage src={appointment.avatar} />
              <AvatarFallback>
                {appointment.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          ))}
          {appointments.length > 4 && (
            <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                +{appointments.length - 4}
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {appointments.length === 0 && !error ? (
        <div className="text-center py-8 text-gray-500">
          <p>No appointments scheduled for today</p>
        </div>
      ) : (
      <div className="space-y-4">
        {appointments.map((appointment, index) => (
          <div
            key={index}
            className="bg-white flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-2 py-6"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={appointment.avatar} />
                <AvatarFallback>
                  {appointment.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg text-gray-900">
                  {appointment.name}
                </p>
                <p className="text-md text-gray-500">{appointment.time}</p>
              </div>
            </div>
            <div className="w-10 h-10 border rounded-3xl border-gray-200 flex items-center justify-center">
              <ChevronRight className="w-6 h-6 text-black" />
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
