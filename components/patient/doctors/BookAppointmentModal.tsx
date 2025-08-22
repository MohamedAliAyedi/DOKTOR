"use client";

import { useState } from "react";
import { appointmentsAPI } from "@/lib/api";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, X, Star } from "lucide-react";

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: any;
}

export function BookAppointmentModal({
  isOpen,
  onClose,
  doctor,
}: BookAppointmentModalProps) {
  const [appointmentType, setAppointmentType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleBook = async () => {
    if (!appointmentType || !date || !time || !reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const [startTime, endTime] = time.includes('-') 
        ? time.split('-').map(t => t.trim())
        : [time, time]; // If no end time provided, use same time

      await appointmentsAPI.createAppointment({
        doctorId: doctor._id,
        appointmentType,
        scheduledDate: date,
        scheduledTime: {
          start: startTime,
          end: endTime
        },
        reason,
        duration: 30 // Default duration
      });

      toast({
        title: "Success",
        description: "Appointment booked successfully",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to book appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setAppointmentType("");
    setDate("");
    setTime("");
    setReason("");
    onClose();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-3xl p-0 border-0 shadow-2xl">
        <div className="p-8">
          {/* Header with close button */}
          <DialogHeader className="relative mb-8">
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <DialogTitle className="text-2xl font-bold text-pink-500 text-center">
              Book an appointment
            </DialogTitle>
          </DialogHeader>

          {/* Doctor Info */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback>
                    {doctor.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {doctor.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {doctor.name}
                </h3>
                <p className="text-sm text-blue-600 mb-1">{doctor.specialty}</p>
                <div className="flex items-center space-x-1 mb-1">
                  {renderStars(doctor.rating)}
                  <span className="text-sm text-gray-600 ml-1">
                    {doctor.rating} ({doctor.reviewCount} reviews)
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {doctor.consultationFee}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
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
                    placeholder="DD/MM/YYYY"
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
                    placeholder="HH:MM"
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