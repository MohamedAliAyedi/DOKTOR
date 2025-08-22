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
import { Switch } from "@/components/ui/switch";

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: any) => void;
}

export function NewServiceModal({
  isOpen,
  onClose,
  onSave,
}: NewServiceModalProps) {
  const [serviceName, setServiceName] = useState("");
  const [cost, setCost] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleCreate = () => {
    const newService = {
      id: Date.now(),
      name: serviceName,
      price: cost,
      duration: duration,
      description: description,
      status: isActive ? "Active" : "Inactive",
    };
    onSave(newService);
    handleCancel();
  };

  const handleCancel = () => {
    setServiceName("");
    setCost("");
    setDuration("");
    setDescription("");
    setIsActive(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-0 border-0 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold text-pink-500 text-center">
              New service
            </DialogTitle>
          </DialogHeader>

          {/* Form */}
          <div className="space-y-6">
            {/* Service Name */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500 font-medium">Name</Label>
              <Input
                placeholder="Service name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            {/* Cost and Duration Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-blue-500 font-medium">
                  Cost
                </Label>
                <Input
                  placeholder="Cost"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-blue-500 font-medium">
                  Approximate Duration
                </Label>
                <Input
                  placeholder="Approximate Duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500 font-medium">
                Description
              </Label>
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            {/* Service Status */}
            <div className="space-y-4">
              <Label className="text-sm text-blue-500 font-medium">
                Service Status
              </Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inactive</span>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="data-[state=checked]:bg-green-500"
                />
                <span className="text-sm text-gray-600">Active</span>
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
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
