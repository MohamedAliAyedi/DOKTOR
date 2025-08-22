"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ValidationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patientName?: string;
  accepted?: boolean;
}

export function ValidationRequestModal({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  accepted = false,
}: ValidationRequestModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-3xl p-0 border-0 shadow-2xl">
        <div className="p-8">
          {/* Header with close button */}
          <DialogHeader className="relative mb-8 mt-8">
            <DialogTitle className="text-md font-semibold text-center">
              Are you sure you want to {accepted ? "accept" : "decline"}{" "}
              {patientName}’s request?
            </DialogTitle>
          </DialogHeader>

          {/* Form */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-6">
              <Button
                onClick={onClose}
                variant="outline"
                className={`px-12 py-3 border-2 ${
                  accepted
                    ? "border-pink-500 text-pink-500 hover:bg-pink-50"
                    : "border-blue-500 text-blue-500 hover:bg-blue-50"
                } rounded-full font-medium`}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className={`px-12 py-3 ${
                  accepted
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                } text-white rounded-full font-medium`}
              >
                {accepted ? "Accept" : "Decline"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
