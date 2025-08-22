"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, X } from "lucide-react";

interface AddUnavailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddUnavailabilityModal({
  isOpen,
  onClose,
}: AddUnavailabilityModalProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const handleConfirm = () => {
    console.log("Adding unavailability:", {
      fromDate,
      toDate,
      fromTime,
      toTime,
    });
    // Handle the unavailability creation logic here
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setFromDate("");
    setToDate("");
    setFromTime("");
    setToTime("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-0 border-0 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <DialogHeader className="relative mb-8">
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <DialogTitle className="text-xl font-semibold text-pink-500 text-left">
              Add Unavailability
            </DialogTitle>
          </DialogHeader>

          {/* Form */}
          <div className="space-y-6">
            {/* Date Range Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* From Date */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 font-medium">
                  From
                </Label>
                <div className="relative">
                  <Input
                    placeholder="DD/MM/YYYY"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200 pr-12"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* From Time */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 font-medium">
                  Time
                </Label>
                <Input
                  placeholder="From ( e.g. 9:00 AM)"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* To Date and Time Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* To Date */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 font-medium">To</Label>
                <div className="relative">
                  <Input
                    placeholder="DD/MM/YYYY"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200 pr-12"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* To Time */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 font-medium">
                  Time
                </Label>
                <Input
                  placeholder="From ( e.g. 9:00 AM)"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-6">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="px-8 py-3 h-12 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className="px-8 py-3 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium"
              >
                Confirm unavailability
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
