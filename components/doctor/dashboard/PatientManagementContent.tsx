"use client";

import { useState, useEffect } from "react";
import { appointmentsAPI, doctorsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Search, ChevronDown, Calendar, Users, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "scheduled":
    case "waiting":
      return (
        <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 px-3 py-1 rounded-full text-xs font-medium">
          Scheduled
        </Badge>
      );
    case "confirmed":
    case "booked":
      return (
        <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-full text-xs font-medium">
          Confirmed
        </Badge>
      );
    case "in-progress":
      return (
        <Badge className="bg-purple-100 text-purple-600 hover:bg-purple-100 px-3 py-1 rounded-full text-xs font-medium">
          In consultation
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-600 hover:bg-green-100 px-3 py-1 rounded-full text-xs font-medium">
          Completed
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-red-100 text-red-600 hover:bg-red-100 px-3 py-1 rounded-full text-xs font-medium">
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
          {status}
        </Badge>
      );
  }
};

const getPaymentBadge = (status: string) => {
  switch (status) {
    case "paid":
      return (
        <Badge className="bg-green-100 text-green-600 hover:bg-green-100 px-3 py-1 rounded-full text-xs font-medium">
          Paid
        </Badge>
      );
    case "pending":
    case "unpaid":
      return (
        <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 px-3 py-1 rounded-full text-xs font-medium">
          Pending
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
          {status}
        </Badge>
      );
  }
};

export function PatientManagementContent() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [stats, setStats] = useState({
    recovered: 0,
    scheduled: 0,
    totalPatients: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTodayAppointments();
    fetchStats();
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const response = await appointmentsAPI.getAppointments({
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString()
      });
      
      setAppointments(response.data.data.appointments);
    } catch (error) {
      console.error('Failed to fetch today\'s appointments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch today's appointments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [appointmentStats, doctorStats] = await Promise.all([
        appointmentsAPI.getAppointmentStatistics(),
        doctorsAPI.getDoctorStatistics()
      ]);
      
      const appointmentData = appointmentStats.data.data.statistics;
      const doctorData = doctorStats.data.data.statistics;
      
      setStats({
        recovered: appointmentData.completedAppointments || 0,
        scheduled: appointmentData.totalAppointments - (appointmentData.completedAppointments || 0),
        totalPatients: doctorData.totalPatients || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handlePatientClick = (appointmentId: string) => {
    router.push(`/doctor/consultation/${appointmentId}`);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchTerm || 
      appointment.patient?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-secondary mb-6">
          Today&apos;s patient
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Recovered Card */}
          <div className="bg-green-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-2">Recovered</p>
                <p className="text-4xl font-bold">{stats.recovered}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Scheduled Card */}
          <div className="bg-blue-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-2">Scheduled</p>
                <p className="text-4xl font-bold">{stats.scheduled}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Patient Card */}
          <div className="bg-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm mb-2">Total Patient</p>
                <p className="text-4xl font-bold">{stats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        <div className="flex items-center justify-between mb-6">
          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search keywords"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border border-gray-200 focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg h-10"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-10 border-gray-200 rounded-lg text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="w-24 h-10 border-gray-200 rounded-lg text-sm">
                <SelectValue placeholder="Age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="0-18">0-18</SelectItem>
                <SelectItem value="19-35">19-35</SelectItem>
                <SelectItem value="36-60">36-60</SelectItem>
                <SelectItem value="60+">60+</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-28 h-10 border-gray-200 rounded-lg text-sm">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 py-3 px-4 text-sm font-medium text-gray-500 border-b border-gray-200">
          <div>Patient</div>
          <div>Time</div>
          <div>Date</div>
          <div>Last visit</div>
          <div>Reason</div>
          <div>Status</div>
          <div>Payment status</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-2 mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments for today
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
            <div
              key={appointment._id}
              onClick={() => handlePatientClick(appointment._id)}
              className="grid grid-cols-7 gap-4 py-4 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center cursor-pointer"
            >
              {/* Patient */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={appointment.patient?.user?.avatar} />
                  <AvatarFallback>
                    {appointment.patient?.user?.firstName?.[0]}{appointment.patient?.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {appointment.patient?.user?.firstName} {appointment.patient?.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    See patient&apos;s profile
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="text-sm text-gray-600">{appointment.scheduledTime?.start}</div>

              {/* Date */}
              <div className="text-sm text-gray-600">
                {new Date(appointment.scheduledDate).toLocaleDateString()}
              </div>

              {/* Last Visit */}
              <div className="text-sm text-gray-600">
                {appointment.updatedAt ? 
                  new Date(appointment.updatedAt).toLocaleDateString() : 
                  'First visit'
                }
              </div>

              {/* Reason */}
              <div className="text-sm text-gray-600">{appointment.reason}</div>

              {/* Status */}
              <div>{getStatusBadge(appointment.status)}</div>

              {/* Payment Status */}
              <div>{getPaymentBadge(appointment.billing ? "paid" : "pending")}</div>
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  );
}