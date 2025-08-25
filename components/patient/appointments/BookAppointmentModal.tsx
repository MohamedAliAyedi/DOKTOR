"use client";

import { useState } from "react";
import { useEffect } from "react";
import { appointmentsAPI, doctorsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, X } from "lucide-react";

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookAppointmentModal({
  isOpen,
  onClose,
}: BookAppointmentModalProps) {
  const [doctor, setDoctor] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  const fetchDoctors = async () => {
    try {
      const response = await doctorsAPI.searchDoctors();
      setDoctors(response.data.data.doctors || []);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      setDoctors([]); // Set empty array on error
    }
  };

  const handleBook = async () => {
    if (!doctor || !appointmentType || !date || !time || !reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Parse the time input and calculate end time based on duration
      const startTime = time.includes("-") ? time.split("-")[0].trim() : time;

      await appointmentsAPI.createAppointment({
        doctorId: doctor,
        appointmentType,
        scheduledDate: date,
        scheduledTime: {
          start: startTime,
          end: calculateEndTime(startTime, 30), // 30 minutes duration
        },
        reason,
        duration: 30,
      });

      toast({
        title: "Success",
        description: "Appointment booked successfully",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to book appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate end time based on start time and duration
  const calculateEndTime = (
    startTime: string,
    durationMinutes: number
  ): string => {
    try {
      const [hours, minutes] = startTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

      return `${endDate.getHours().toString().padStart(2, "0")}:${endDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } catch (error) {
      console.error("Error calculating end time:", error);
      return startTime; // Fallback to start time if calculation fails
    }
  };

  const handleCancel = () => {
    // Reset form
    setDoctor("");
    setAppointmentType("");
    setDate("");
    setTime("");
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-3xl p-0 border-0 shadow-2xl">
        <div className="p-8">
          {/* Header with close button */}
          <DialogHeader className="relative mb-8">
            {/* <button
              onClick={onClose}
              className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button> */}
            <DialogTitle className="text-2xl font-bold text-pink-500 text-center">
              Book an appointment
            </DialogTitle>
          </DialogHeader>

          {/* Form */}
          <div className="space-y-6">
            {/* Doctor Selection */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500 font-medium">
                Doctor <span className="text-red-500">*</span>
              </Label>
              <Select value={doctor} onValueChange={setDoctor}>
                <SelectTrigger className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  {doctors.map((doc) => (
                    <SelectItem key={doc._id} value={doc._id}>
                      Dr. {doc.user?.firstName} {doc.user?.lastName} -{" "}
                      {doc.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Appointment Type */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500 font-medium">
                Appointment type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={appointmentType}
                onValueChange={setAppointmentType}
              >
                <SelectTrigger className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="routine-checkup">
                    Routine Checkup
                  </SelectItem>
                  <SelectItem value="urgent-care">Urgent Care</SelectItem>
                  <SelectItem value="virtual">Virtual Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-2">
                <Label className="text-sm text-blue-500 font-medium">
                  Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200 pr-12"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label className="text-sm text-blue-500 font-medium">
                  Time <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200 pr-12"
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500 font-medium">
                Reason for appointment
              </Label>
              <Textarea
                placeholder="Describe your symptoms or reason for the appointment..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px] border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-6">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="px-12 py-3 h-12 border-2 border-pink-500 text-pink-500 hover:bg-pink-50 rounded-full font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBook}
                className="px-12 py-3 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Booking..." : "Book"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
