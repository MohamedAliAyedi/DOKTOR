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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  X,
  Edit,
  Trash2,
} from "lucide-react";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onUpdate?: () => void;
}

export function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onUpdate,
}: AppointmentDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (!appointment) return null;

  const handleCancelAppointment = async () => {
    setIsLoading(true);
    try {
      await appointmentsAPI.cancelAppointment(appointment.id, {
        reason: "Cancelled by doctor"
      });

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });

      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to cancel appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAppointment = async () => {
    setIsLoading(true);
    try {
      await appointmentsAPI.confirmAppointment(appointment.id);

      toast({
        title: "Success",
        description: "Appointment confirmed successfully",
      });

      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to confirm appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100">
            Scheduled
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100">
            Confirmed
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-600 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-600 hover:bg-red-100">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-3xl p-0 border-0 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <DialogHeader className="relative mb-8">
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <DialogTitle className="text-2xl font-bold text-pink-500 text-center">
              Appointment Details
            </DialogTitle>
          </DialogHeader>

          {/* Patient Info */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={appointment.patientAvatar} />
                <AvatarFallback>
                  {appointment.patient || appointment.fullPatientName?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {appointment.fullPatientName || appointment.patientName || 'Patient'}
                </h3>
                <p className="text-sm text-gray-600">#{appointment.patientId || 'N/A'}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(appointment.status || 'scheduled')}
                  <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100">
                    {appointment.type}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date</p>
                <p className="text-sm text-gray-600">
                  {new Date(appointment.date || appointment.dateKey).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Time</p>
                <p className="text-sm text-gray-600">
                  {appointment.time} ({appointment.duration || 30} minutes)
                </p>
              </div>
            </div>

            {appointment.reason && (
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Reason</p>
                  <p className="text-sm text-gray-600">{appointment.reason}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {appointment.status === 'scheduled' && (
              <Button
                onClick={handleConfirmAppointment}
                className="px-6 py-3 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Confirming..." : "Confirm"}
              </Button>
            )}
            
            <Button
              onClick={handleCancelAppointment}
              variant="outline"
              className="px-6 py-3 h-12 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-full font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}