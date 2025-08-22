"use client";

import { useState } from "react";
import { prescriptionsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Plus, Trash2 } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  from: string;
  to: string;
  beforeBreakfast: boolean;
  beforeLunch: boolean;
  beforeDinner: boolean;
  afterBreakfast: boolean;
  afterLunch: boolean;
  afterDinner: boolean;
}

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medications: Medication[]) => void;
  patientId?: string;
  consultationId?: string;
}

export function PrescriptionModal({
  isOpen,
  onClose,
  onSave,
  patientId,
  consultationId,
}: PrescriptionModalProps) {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "",
      dosage: "",
      frequency: "",
      from: "",
      to: "",
      beforeBreakfast: false,
      beforeLunch: false,
      beforeDinner: false,
      afterBreakfast: false,
      afterLunch: false,
      afterDinner: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: "",
      dosage: "",
      frequency: "",
      from: "",
      to: "",
      beforeBreakfast: false,
      beforeLunch: false,
      beforeDinner: false,
      afterBreakfast: false,
      afterLunch: false,
      afterDinner: false,
    };
    setMedications([...medications, newMedication]);
  };

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter((med) => med.id !== id));
    }
  };

  const updateMedication = (
    id: string,
    field: keyof Medication,
    value: any
  ) => {
    setMedications(
      medications.map((med) =>
        med.id === id ? { ...med, [field]: value } : med
      )
    );
  };

  const handleSave = async () => {
    // Validate medications
    const invalidMedications = medications.filter(med => 
      !med.name || !med.dosage || !med.frequency || !med.from || !med.to
    );

    if (invalidMedications.length > 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields for each medication",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const prescriptionData = {
        patientId,
        consultationId,
        medications: medications.map(med => ({
          name: med.name,
          dosage: {
            amount: parseFloat(med.dosage.replace(/[^\d.]/g, '')),
            unit: med.dosage.replace(/[\d.]/g, '').trim() || 'mg'
          },
          frequency: med.frequency,
          duration: {
            startDate: new Date(med.from),
            endDate: new Date(med.to)
          },
          timing: {
            beforeBreakfast: med.beforeBreakfast,
            beforeLunch: med.beforeLunch,
            beforeDinner: med.beforeDinner,
            afterBreakfast: med.afterBreakfast,
            afterLunch: med.afterLunch,
            afterDinner: med.afterDinner
          },
          instructions: `Take ${med.frequency}`,
          isActive: true
        }))
      };

      const response = await prescriptionsAPI.createPrescription(prescriptionData);
      
      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
      
      onSave(medications);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create prescription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white rounded-3xl">
        <div className="p-8">
          {/* Header with Icon */}
          <DialogHeader className="text-center mb-8">
            <h2 className="text-2xl font-bold text-pink-500">
              New prescription
            </h2>
          </DialogHeader>

          {/* Medications List */}
          <div className="space-y-8">
            {medications.map((medication, index) => (
              <div key={medication.id} className="space-y-6">
                {/* Medication Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {index > 0 && <Trash2 className="w-4 h-4 text-pink-500" />}
                    <h3 className="text-blue-500 font-medium">
                      Medicament #{index + 1}
                    </h3>
                  </div>
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(medication.id)}
                      className="text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* First Row: Name, Dosage, Frequency */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-blue-500 mb-2">
                      Medicament #1
                    </label>
                    <Input
                      placeholder="Medicament name"
                      value={medication.name}
                      onChange={(e) =>
                        updateMedication(medication.id, "name", e.target.value)
                      }
                      className=" border-gray-200 rounded-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-blue-500 mb-2">
                      Dosage
                    </label>
                    <Select
                      value={medication.dosage}
                      onValueChange={(value) =>
                        updateMedication(medication.id, "dosage", value)
                      }
                    >
                      <SelectTrigger className=" border-gray-200 rounded-full">
                        <SelectValue placeholder="Dosage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1mg">1mg</SelectItem>
                        <SelectItem value="5mg">5mg</SelectItem>
                        <SelectItem value="10mg">10mg</SelectItem>
                        <SelectItem value="25mg">25mg</SelectItem>
                        <SelectItem value="50mg">50mg</SelectItem>
                        <SelectItem value="100mg">100mg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-blue-500 mb-2">
                      Frequency
                    </label>
                    <Select
                      value={medication.frequency}
                      onValueChange={(value) =>
                        updateMedication(medication.id, "frequency", value)
                      }
                    >
                      <SelectTrigger className=" border-gray-200 rounded-full">
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once-daily">Once daily</SelectItem>
                        <SelectItem value="twice-daily">Twice daily</SelectItem>
                        <SelectItem value="three-times">
                          Three times daily
                        </SelectItem>
                        <SelectItem value="as-needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Second Row: From and To dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-blue-500 mb-2">
                      From
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="DD/MM/YYYY"
                        value={medication.from}
                        onChange={(e) =>
                          updateMedication(
                            medication.id,
                            "from",
                            e.target.value
                          )
                        }
                        className=" border-gray-200 rounded-full pl-12"
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-blue-500 mb-2">
                      To
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="DD/MM/YYYY"
                        value={medication.to}
                        onChange={(e) =>
                          updateMedication(medication.id, "to", e.target.value)
                        }
                        className=" border-gray-200 rounded-full pl-12"
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Timing Buttons */}
                <div className="space-y-3">
                  {/* Before meals row */}
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant={
                        medication.beforeBreakfast ? "default" : "outline"
                      }
                      onClick={() =>
                        updateMedication(
                          medication.id,
                          "beforeBreakfast",
                          !medication.beforeBreakfast
                        )
                      }
                      className={`flex-1  rounded-full ${
                        medication.beforeBreakfast
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "border-blue-200 text-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      Before Breakfast
                    </Button>
                    <Button
                      type="button"
                      variant={medication.beforeLunch ? "default" : "outline"}
                      onClick={() =>
                        updateMedication(
                          medication.id,
                          "beforeLunch",
                          !medication.beforeLunch
                        )
                      }
                      className={`flex-1  rounded-full ${
                        medication.beforeLunch
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "border-blue-200 text-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      Before Lunch
                    </Button>
                    <Button
                      type="button"
                      variant={medication.beforeDinner ? "default" : "outline"}
                      onClick={() =>
                        updateMedication(
                          medication.id,
                          "beforeDinner",
                          !medication.beforeDinner
                        )
                      }
                      className={`flex-1  rounded-full ${
                        medication.beforeDinner
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "border-blue-200 text-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      Before Dinner
                    </Button>
                  </div>

                  {/* After meals row */}
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant={
                        medication.afterBreakfast ? "default" : "outline"
                      }
                      onClick={() =>
                        updateMedication(
                          medication.id,
                          "afterBreakfast",
                          !medication.afterBreakfast
                        )
                      }
                      className={`flex-1  rounded-full ${
                        medication.afterBreakfast
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "border-blue-200 text-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      After Breakfast
                    </Button>
                    <Button
                      type="button"
                      variant={medication.afterLunch ? "default" : "outline"}
                      onClick={() =>
                        updateMedication(
                          medication.id,
                          "afterLunch",
                          !medication.afterLunch
                        )
                      }
                      className={`flex-1  rounded-full ${
                        medication.afterLunch
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "border-blue-200 text-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      After Lunch
                    </Button>
                    <Button
                      type="button"
                      variant={medication.afterDinner ? "default" : "outline"}
                      onClick={() =>
                        updateMedication(
                          medication.id,
                          "afterDinner",
                          !medication.afterDinner
                        )
                      }
                      className={`flex-1 rounded-full ${
                        medication.afterDinner
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "border-blue-200 text-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      After Dinner
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Medication Button */}
          <div className="mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={addMedication}
              className="border-dashed border-2 border-blue-300 text-blue-500 hover:bg-blue-50 rounded-full  px-6 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add a medicament</span>
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-12">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-12 py-3 rounded-full border-2 border-pink-500 text-pink-500 hover:bg-pink-50 font-semibold text-md"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="px-12 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-md"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}