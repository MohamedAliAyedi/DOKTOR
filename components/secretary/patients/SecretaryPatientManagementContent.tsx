"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  Calendar,
  Users,
  Heart,
  DollarSign,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientStatusModal } from "./PatientStatusModal";
import { PaymentModal } from "./PaymentModal";

const patientData = [
  {
    id: 1,
    name: "Marwen Said",
    avatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    time: "12:24 pm",
    date: "22 Jan 2024",
    lastVisit: "22 Jan 2024",
    reason: "Headache",
    status: "Waiting",
    paymentStatus: "Paid",
  },
  {
    id: 2,
    name: "Mariem Raali",
    avatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    time: "12:24 pm",
    date: "20 Jan 2024",
    lastVisit: "20 Jan 2024",
    reason: "Headache",
    status: "Waiting",
    paymentStatus: "Unpaid",
  },
  {
    id: 3,
    name: "Ahmed Bourat",
    avatar:
      "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    time: "12:24 pm",
    date: "24 Jan 2024",
    lastVisit: "24 Jan 2024",
    reason: "Headache",
    status: "Booked",
    paymentStatus: "Paid",
  },
  {
    id: 4,
    name: "Hassen Louati",
    avatar:
      "https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    time: "12:24 pm",
    date: "26 Jan 2024",
    lastVisit: "26 Jan 2024",
    reason: "Headache",
    status: "Waiting",
    paymentStatus: "Unpaid",
  },
  {
    id: 5,
    name: "Laila Hamza",
    avatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    time: "12:24 pm",
    date: "18 Jan 2024",
    lastVisit: "18 Jan 2024",
    reason: "Headache",
    status: "In consultation",
    paymentStatus: "Paid",
  },
  {
    id: 6,
    name: "Sami Ouni",
    avatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    time: "12:24 pm",
    date: "28 Jan 2024",
    lastVisit: "28 Jan 2024",
    reason: "Headache",
    status: "In consultation",
    paymentStatus: "Unpaid",
  },
  {
    id: 7,
    name: "Sofien Jlassi",
    avatar:
      "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    time: "12:24 pm",
    date: "16 Jan 2024",
    lastVisit: "16 Jan 2024",
    reason: "Headache",
    status: "Booked",
    paymentStatus: "Paid",
  },
  {
    id: 8,
    name: "Nada Haji",
    avatar:
      "https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    time: "12:24 pm",
    date: "16 Jan 2024",
    lastVisit: "16 Jan 2024",
    reason: "Headache",
    status: "Booked",
    paymentStatus: "Unpaid",
  },
  {
    id: 9,
    name: "Sirine Jablon",
    avatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    time: "12:24 pm",
    date: "16 Jan 2024",
    lastVisit: "16 Jan 2024",
    reason: "Headache",
    status: "In consultation",
    paymentStatus: "Unpaid",
  },
  {
    id: 10,
    name: "Ali Mouradi",
    avatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    time: "12:24 pm",
    date: "16 Jan 2024",
    lastVisit: "16 Jan 2024",
    reason: "Headache",
    status: "Cancelled",
    paymentStatus: "Paid",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Waiting":
      return (
        <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 px-3 py-1 rounded-full text-xs font-medium">
          Waiting
        </Badge>
      );
    case "Booked":
      return (
        <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-full text-xs font-medium">
          Booked
        </Badge>
      );
    case "In consultation":
      return (
        <Badge className="bg-purple-100 text-purple-600 hover:bg-purple-100 px-3 py-1 rounded-full text-xs font-medium">
          In consultation
        </Badge>
      );
    case "Cancelled":
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
    case "Paid":
      return (
        <Badge className="bg-green-100 text-green-600 hover:bg-green-100 px-3 py-1 rounded-full text-xs font-medium">
          Paid
        </Badge>
      );
    case "Unpaid":
      return (
        <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 px-3 py-1 rounded-full text-xs font-medium">
          Unpaid
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

export function SecretaryPatientManagementContent() {
  const [patients, setPatients] = useState(patientData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const handleStatusChange = (patient: any) => {
    setSelectedPatient(patient);
    setIsStatusModalOpen(true);
  };

  const handlePaymentChange = (patient: any) => {
    setSelectedPatient(patient);
    setIsPaymentModalOpen(true);
  };

  const handleUpdateStatus = (patientId: number, newStatus: string) => {
    const updateStatusAsync = async () => {
      try {
        // Update appointment status via API
        await appointmentsAPI.updateAppointment(patientId.toString(), {
          status: newStatus.toLowerCase().replace(' ', '-')
        });
        
        setPatients(
          patients.map((p) =>
            p.id === patientId ? { ...p, status: newStatus } : p
          )
        );
        
        toast({
          title: "Success",
          description: "Patient status updated successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to update status",
          variant: "destructive",
        });
      }
    };
    
    updateStatusAsync();
    setIsStatusModalOpen(false);
    setSelectedPatient(null);
  };

  const handleUpdatePayment = (patientId: number, newPaymentStatus: string) => {
    const updatePaymentAsync = async () => {
      try {
        // This would typically update a bill's payment status
        // You might need to find the related bill first
        setPatients(
          patients.map((p) =>
            p.id === patientId ? { ...p, paymentStatus: newPaymentStatus } : p
          )
        );
        
        toast({
          title: "Success",
          description: "Payment status updated successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update payment status",
          variant: "destructive",
        });
      }
    };
    
    updatePaymentAsync();
    setIsPaymentModalOpen(false);
    setSelectedPatient(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-secondary mb-6">
          Today&apos;s patient management
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Recovered Card */}
          <div className="bg-green-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-2">Recovered</p>
                <p className="text-4xl font-bold">35</p>
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
                <p className="text-4xl font-bold">15</p>
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
                <p className="text-4xl font-bold">250</p>
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
            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2"
            >
              <span className="text-sm">Reason</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2"
            >
              <span className="text-sm">Age</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2"
            >
              <span className="text-sm">Gender</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2"
            >
              <span className="text-sm">Table view</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-8 gap-4 py-3 px-4 text-sm font-medium text-gray-500 border-b border-gray-200">
          <div>Patient</div>
          <div>Time</div>
          <div>Date</div>
          <div>Last visit</div>
          <div>Reason</div>
          <div>Status</div>
          <div>Payment status</div>
          <div>Actions</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-2 mt-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="grid grid-cols-8 gap-4 py-4 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center"
            >
              {/* Patient */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={patient.avatar} />
                  <AvatarFallback>
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {patient.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    See patient&apos;s profile
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="text-sm text-gray-600">{patient.time}</div>

              {/* Date */}
              <div className="text-sm text-gray-600">{patient.date}</div>

              {/* Last Visit */}
              <div className="text-sm text-gray-600">{patient.lastVisit}</div>

              {/* Reason */}
              <div className="text-sm text-gray-600">{patient.reason}</div>

              {/* Status */}
              <div>{getStatusBadge(patient.status)}</div>

              {/* Payment Status */}
              <div>{getPaymentBadge(patient.paymentStatus)}</div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handleStatusChange(patient)}
                  variant="outline"
                  size="sm"
                  className="border-blue-500 text-blue-500 hover:bg-blue-50 rounded-lg px-3 py-1 text-xs"
                >
                  Change Status
                </Button>
                <Button
                  onClick={() => handlePaymentChange(patient)}
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-500 hover:bg-green-50 rounded-lg px-3 py-1 text-xs flex items-center space-x-1"
                >
                  <DollarSign className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <PatientStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        patient={selectedPatient}
        onUpdateStatus={handleUpdateStatus}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        patient={selectedPatient}
        onUpdatePayment={handleUpdatePayment}
      />
    </div>
  );
}
