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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  onUpdatePayment: (patientId: number, newPaymentStatus: string) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  patient,
  onUpdatePayment,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const handleUpdate = () => {
    if (paymentStatus && patient) {
      onUpdatePayment(patient.id, paymentStatus);
    }
  };

  const handleCancel = () => {
    setPaymentMethod("");
    setAmount("");
    setPaymentStatus("");
    onClose();
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-3xl p-0 border-0 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold text-pink-500 text-center">
              Payment Management
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
                <p className="text-sm text-gray-600">
                  Current: {patient.paymentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500 font-medium">
                Payment Method
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500 font-medium">
                Amount (TND)
              </Label>
              <Input
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500 font-medium">
                Payment Status
              </Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
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
                disabled={!paymentStatus}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}