"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { secretariesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export function SecretaryProfileContent() {
  const params = useParams();
  const { toast } = useToast();
  const [secretary, setSecretary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    jobTitle: "",
    department: "",
    salary: "",
    currency: "TND",
    paymentFrequency: "monthly",
  });

  // Access permissions state
  const [permissions, setPermissions] = useState({
    appointments: { view: true, edit: true, manage: false },
    patients: { view: true, edit: false, manage: false },
    billing: { view: true, edit: true, manage: false },
    consultations: { view: true, edit: false, manage: false },
    medicalRecords: { view: true, edit: false, manage: false },
  });

  useEffect(() => {
    if (params.id) {
      fetchSecretaryData();
    }
  }, [params.id]);

  const fetchSecretaryData = async () => {
    try {
      const response = await secretariesAPI.getSecretaryById(params.id as string);
      const secretaryData = response.data.data.secretary;
      setSecretary(secretaryData);
      
      // Populate form
      setFormData({
        firstName: secretaryData.user?.firstName || "",
        lastName: secretaryData.user?.lastName || "",
        email: secretaryData.user?.email || "",
        phoneNumber: secretaryData.user?.phoneNumber || "",
        jobTitle: secretaryData.jobTitle || "",
        department: secretaryData.department || "",
        salary: secretaryData.salary?.amount?.toString() || "",
        currency: secretaryData.salary?.currency || "TND",
        paymentFrequency: secretaryData.salary?.paymentFrequency || "monthly",
      });

      setPermissions(secretaryData.permissions || permissions);
    } catch (error) {
      console.error('Failed to fetch secretary data:', error);
      toast({
        title: "Error",
        description: "Failed to load secretary data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (
    resource: string,
    permission: string,
    checked: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource as keyof typeof prev],
        [permission]: checked,
      },
    }));
  };

  const handleSaveChanges = async () => {
    if (!secretary) return;

    setIsSaving(true);
    try {
      // Update secretary profile
      await secretariesAPI.updateSecretary(secretary._id, {
        jobTitle: formData.jobTitle,
        department: formData.department,
        salary: {
          amount: parseFloat(formData.salary),
          currency: formData.currency,
          paymentFrequency: formData.paymentFrequency
        }
      });

      // Update permissions
      await secretariesAPI.updatePermissions(secretary._id, { permissions });

      toast({
        title: "Success",
        description: "Secretary profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update secretary profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (secretary) {
      setFormData({
        firstName: secretary.user?.firstName || "",
        lastName: secretary.user?.lastName || "",
        email: secretary.user?.email || "",
        phoneNumber: secretary.user?.phoneNumber || "",
        jobTitle: secretary.jobTitle || "",
        department: secretary.department || "",
        salary: secretary.salary?.amount?.toString() || "",
        currency: secretary.salary?.currency || "TND",
        paymentFrequency: secretary.salary?.paymentFrequency || "monthly",
      });
      setPermissions(secretary.permissions || permissions);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!secretary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Secretary not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 border-gray-50">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-pink-500 mb-1">
            Secretary Profile
          </h1>
        </div>

        <div className="flex items-start space-x-8 mb-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={secretary.user?.avatar} />
                <AvatarFallback className="bg-blue-500 text-white text-2xl">
                  {secretary.user?.firstName?.[0]}{secretary.user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              {/* Blue verification badge */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">
                {secretary.user?.firstName} {secretary.user?.lastName}
              </h3>
              <div className="flex items-center space-x-1 mt-1">
                <div className={`w-2 h-2 ${secretary.isActive ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                <span className={`text-sm ${secretary.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {secretary.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            {/* Employee ID */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">Employee ID</Label>
              <Input
                value={secretary.employeeId}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                disabled
              />
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">Job Title</Label>
              <Input
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">First Name</Label>
              <Input
                value={formData.firstName}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                disabled
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">Last Name</Label>
              <Input
                value={formData.lastName}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                disabled
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">Email</Label>
              <Input
                value={formData.email}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                disabled
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">Phone number</Label>
              <Input
                value={formData.phoneNumber}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                disabled
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">Department</Label>
              <Input
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            {/* Salary */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">Salary</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange("salary", e.target.value)}
                  className="flex-1 h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
                <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                  <SelectTrigger className="w-20 h-12 border-gray-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TND">TND</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Access Permission Section */}
        <div className="space-y-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-700">
            Access Permission
          </h3>

          {/* Permission Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 py-4 px-6 bg-gray-50 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-600">
                Access Permission
              </div>
              <div className="text-sm font-medium text-blue-500 text-center">
                View
              </div>
              <div className="text-sm font-medium text-blue-500 text-center">
                Edit
              </div>
              <div className="text-sm font-medium text-blue-500 text-center">
                Manage
              </div>
            </div>

            {/* Permission Rows */}
            {Object.entries(permissions).map(([resource, perms]) => (
              <div
                key={resource}
                className="grid grid-cols-4 gap-4 py-4 px-6 border-b border-gray-100"
              >
                <div className="text-sm text-gray-700 capitalize">{resource}</div>
                <div className="flex justify-center">
                  <Checkbox
                    checked={perms.view}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(resource, "view", checked as boolean)
                    }
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                </div>
                <div className="flex justify-center">
                  <Checkbox
                    checked={perms.edit}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(resource, "edit", checked as boolean)
                    }
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                </div>
                <div className="flex justify-center">
                  <Checkbox
                    checked={perms.manage}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(resource, "manage", checked as boolean)
                    }
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <Button
            onClick={handleReset}
            variant="outline"
            className="px-8 py-3 h-12 rounded-full border-2 border-pink-500 text-pink-500 hover:bg-pink-50 font-medium"
          >
            Reset
          </Button>
          <Button
            onClick={handleSaveChanges}
            className="px-8 py-3 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}