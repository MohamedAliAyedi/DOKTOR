"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PatientStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  onUpdateStatus: (patientId: number, newStatus: string) => void;
}

export function PatientStatusModal({
  isOpen,
  onClose,
  patient,
  onUpdateStatus,
}: PatientStatusModalProps) {
  const [newStatus, setNewStatus] = useState("");

  const handleUpdate = () => {
    if (newStatus && patient) {
      onUpdateStatus(patient.id, newStatus);
    }
  };

  const handleCancel = () => {
    setNewStatus("");
    onClose();
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-0 border-0 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold text-pink-500 text-center">
              Change Patient Status
            </DialogTitle>
          </DialogHeader>

          {/* Patient Info */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={patient.avatar} />
                <AvatarFallback>
                  {patient.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                <p className="text-sm text-gray-600">Current: {patient.status}</p>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-4">
            <label className="block text-sm text-blue-500 font-medium">
              New Status
            </label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                <SelectItem value="Waiting">Waiting</SelectItem>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="In consultation">In consultation</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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
              onClick={handleUpdate}
              className="px-12 py-3 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium"
              disabled={!newStatus}
            >
              Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}