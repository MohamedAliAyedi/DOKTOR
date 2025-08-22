"use client";

import { useState } from "react";
import { authAPI } from "@/lib/api";
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
import { Camera } from "lucide-react";

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPatientModal({ isOpen, onClose }: NewPatientModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    lastName: "",
    age: "",
    gender: "",
    jobTitle: "",
    insuranceInfo: "",
    phoneNumber: "",
    emergencyPhone: "",
    diagnosis: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.lastName || !formData.age || !formData.gender || !formData.phoneNumber || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create user account first
      await authAPI.register({
        firstName: formData.fullName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password || 'TempPassword123!',
        role: 'patient'
      });

      toast({
        title: "Success",
        description: "Patient created successfully",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create patient",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: "",
      lastName: "",
      age: "",
      gender: "",
      jobTitle: "",
      insuranceInfo: "",
      phoneNumber: "",
      emergencyPhone: "",
      diagnosis: "",
      email: "",
      password: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-0 border-0 shadow-2xl">
        <div className="p-8">
          <DialogHeader className="text-center mb-8">
            <DialogTitle className="text-2xl text-center font-bold text-secondary mb-6">
              New patient
            </DialogTitle>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-2xl">
                    👤
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200">
                  <Camera className="w-3 h-3 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Click to change photo
              </p>
            </div>
          </DialogHeader>

          {/* Form */}
          <div className="space-y-6">
            {/* Row 1: Full name and Last name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-blue-600 font-medium">
                  Full name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Full name"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-blue-600 font-medium">
                  Last name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Row 1.5: Email and Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-blue-600 font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    handleInputChange("email", e.target.value)
                  }
                  className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-blue-600 font-medium">
                  Temporary Password
                </Label>
                <Input
                  placeholder="Leave empty for auto-generated"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Row 2: Age and Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-blue-600 font-medium">
                  Age <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Age"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-blue-600 font-medium">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <SelectTrigger className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Job title and Insurance information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-blue-600 font-medium">
                  Job title <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Job title"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    handleInputChange("jobTitle", e.target.value)
                  }
                  className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-blue-600 font-medium">
                  Insurance information <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Insurance information"
                  value={formData.insuranceInfo}
                  onChange={(e) =>
                    handleInputChange("insuranceInfo", e.target.value)
                  }
                  className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Row 4: Phone number and Emergency phone number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-blue-600 font-medium">
                  Phone number <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Phone number"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-blue-600 font-medium">
                  Emergency phone number <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Emergency phone number"
                  value={formData.emergencyPhone}
                  onChange={(e) =>
                    handleInputChange("emergencyPhone", e.target.value)
                  }
                  className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Row 5: Diagnosis */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-600 font-medium">
                Diagnosis
              </Label>
              <Textarea
                placeholder="Diagnosis"
                value={formData.diagnosis}
                onChange={(e) => handleInputChange("diagnosis", e.target.value)}
                className="min-h-[80px] border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-6">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="px-12 py-3 border-2 border-pink-500 text-pink-500 hover:bg-pink-50 rounded-full font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="px-12 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium"
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