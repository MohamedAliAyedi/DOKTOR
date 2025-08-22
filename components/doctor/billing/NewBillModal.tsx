"use client";

import { useState } from "react";
import { billingAPI, patientsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
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
import { Upload } from "lucide-react";

interface NewBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewBillModal({ isOpen, onClose }: NewBillModalProps) {
  const [patient, setPatient] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cost, setCost] = useState("");
  const [billFile, setBillFile] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    try {
      const response = await patientsAPI.getPatients();
      setPatients(response.data.data.patients);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const handleCreate = async () => {
    if (!patient || !paymentMethod || !cost) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await billingAPI.createBill({
        patientId: patient,
        billType: 'consultation',
        items: [{
          description: 'Medical consultation',
          quantity: 1,
          unitPrice: parseFloat(cost),
          totalPrice: parseFloat(cost)
        }],
        paymentMethod,
        notes: billFile ? `Bill file: ${billFile}` : undefined
      });

      toast({
        title: "Success",
        description: "Bill created successfully",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create bill",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setPatient("");
    setPaymentMethod("");
    setCost("");
    setBillFile("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-3xl p-0 border-0 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold text-pink-500 text-center">
              New Bill
            </DialogTitle>
          </DialogHeader>

          {/* Form */}
          <div className="space-y-6">
            {/* Patient Field */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500 font-medium">
                Patient <span className="text-red-500">*</span>
              </Label>
              <Select value={patient} onValueChange={setPatient}>
                <SelectTrigger className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                  <SelectValue placeholder="Patient" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  {patients.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.user?.firstName} {p.user?.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method and Cost Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="text-sm text-blue-500 font-medium">
                  Payment method <span className="text-red-500">*</span>
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                    <SelectValue placeholder="Payment method" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cost */}
              <div className="space-y-2">
                <Label className="text-sm text-blue-500 font-medium">
                  Cost <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Cost (TND)"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Upload Bill File */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500 font-medium">
                Upload bill file
              </Label>
              <div className="relative">
                <Input
                  placeholder="Upload bill file"
                  value={billFile}
                  onChange={(e) => setBillFile(e.target.value)}
                  className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200 pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
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
                onClick={handleCreate}
                className="px-12 py-3 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}