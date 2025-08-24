"use client";

import { useState } from "react";
import { doctorsAPI } from "@/lib/api";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [reason, setReason] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!fromDate || !toDate || !fromTime || !toTime || !reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await doctorsAPI.addUnavailability({
        startDate: fromDate,
        endDate: toDate,
        startTime: fromTime,
        endTime: toTime,
        reason,
        isRecurring,
        recurringPattern: isRecurring ? recurringPattern : undefined,
      });

      toast({
        title: "Success",
        description: "Unavailability period added successfully",
      });

      handleCancel();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to add unavailability",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFromDate("");
    setToDate("");
    setFromTime("");
    setToTime("");
    setReason("");
    setIsRecurring(false);
    setRecurringPattern("");
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
                  From Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 font-medium">
                  To Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Time Range Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* From Time */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 font-medium">
                  From Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              {/* To Time */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 font-medium">
                  To Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600 font-medium">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Enter reason for unavailability"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[80px] border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200 resize-none"
              />
            </div>

            {/* Recurring Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={isRecurring}
                  onCheckedChange={(checked) =>
                    setIsRecurring(checked as boolean)
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <Label className="text-sm text-gray-700">
                  Make this recurring
                </Label>
              </div>

              {isRecurring && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 font-medium">
                    Recurring Pattern
                  </Label>
                  <Select
                    value={recurringPattern}
                    onValueChange={setRecurringPattern}
                  >
                    <SelectTrigger className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Confirm unavailability"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
