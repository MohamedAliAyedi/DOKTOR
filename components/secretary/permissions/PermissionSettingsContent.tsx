"use client";

import { useState, useEffect } from "react";
import { secretariesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserCog,
  Shield,
  Eye,
  Edit,
  Settings,
  Calendar,
  Users,
  CreditCard,
  FileText,
  Heart,
} from "lucide-react";

const accessPermissions = [
  {
    id: "appointments",
    label: "Appointments",
    description: "Schedule, view, and manage patient appointments",
    icon: Calendar,
  },
  {
    id: "patients",
    label: "Patient Management",
    description: "Access patient profiles and medical information",
    icon: Users,
  },
  {
    id: "billing",
    label: "Billing & Payments",
    description: "Handle invoices, payments, and financial records",
    icon: CreditCard,
  },
  {
    id: "consultations",
    label: "Consultations",
    description: "View consultation notes and medical reports",
    icon: FileText,
  },
  {
    id: "medicalRecords",
    label: "Medical Records",
    description: "Access lab results, prescriptions, and medical history",
    icon: Heart,
  },
];

export function PermissionSettingsContent() {
  const [secretaries, setSecretaries] = useState<any[]>([]);
  const [selectedSecretary, setSelectedSecretary] = useState<string>("");
  const [permissions, setPermissions] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSecretaries();
  }, []);

  const fetchSecretaries = async () => {
    try {
      const response = await secretariesAPI.getSecretaries();
      const secretariesData = response.data.data.secretaries;
      setSecretaries(secretariesData);

      if (secretariesData.length > 0) {
        setSelectedSecretary(secretariesData[0]._id);
        setPermissions(secretariesData[0].permissions || {});
      }
    } catch (error) {
      console.error("Failed to fetch secretaries:", error);
      toast({
        title: "Error",
        description: "Failed to load secretaries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecretarySelect = (secretaryId: string) => {
    setSelectedSecretary(secretaryId);
    const secretary = secretaries.find((s) => s._id === secretaryId);
    if (secretary) {
      setPermissions(secretary.permissions || {});
    }
  };

  const handlePermissionChange = (
    resource: string,
    action: "view" | "edit" | "manage",
    checked: boolean
  ) => {
    setPermissions((prev: any) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: checked,
      },
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedSecretary) return;

    setIsSaving(true);
    try {
      await secretariesAPI.updatePermissions(selectedSecretary, {
        permissions,
      });

      // Update local state
      setSecretaries((prev) =>
        prev.map((secretary) =>
          secretary._id === selectedSecretary
            ? { ...secretary, permissions }
            : secretary
        )
      );

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update permissions",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-pink-500">
              Permission Management
            </h1>
            <p className="text-gray-600">Manage secretary access permissions</p>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-50 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (secretaries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-pink-500">
              Permission Management
            </h1>
            <p className="text-gray-600">Manage secretary access permissions</p>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-50 p-8">
          <div className="text-center py-8 text-gray-500">
            No secretaries found. Add secretaries to manage permissions.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-pink-500">
            Permission Management
          </h1>
          <p className="text-gray-600">Manage secretary access permissions</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-50 overflow-hidden">
        {/* Secretary Selection */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Select Secretary
          </h3>
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {secretaries.map((secretary) => (
              <button
                key={secretary._id}
                onClick={() => handleSecretarySelect(secretary._id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-full border-2 transition-all whitespace-nowrap ${
                  selectedSecretary === secretary._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={secretary.user?.avatar} />
                  <AvatarFallback>
                    {secretary.user?.firstName?.[0]}
                    {secretary.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <span
                    className={`text-sm font-medium ${
                      selectedSecretary === secretary._id
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {secretary.user?.firstName} {secretary.user?.lastName}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Badge
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        secretary.isActive
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {secretary.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Table */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Access Permissions
            </h3>
            <p className="text-sm text-gray-600">
              Configure what{" "}
              {
                secretaries.find((s) => s._id === selectedSecretary)?.user
                  ?.firstName
              }{" "}
              can access and modify
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 py-4 px-6 bg-gray-50 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-600">Resource</div>
              <div className="text-sm font-medium text-blue-500 text-center flex items-center justify-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>View</span>
              </div>
              <div className="text-sm font-medium text-blue-500 text-center flex items-center justify-center space-x-1">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </div>
              <div className="text-sm font-medium text-blue-500 text-center flex items-center justify-center space-x-1">
                <Settings className="w-4 h-4" />
                <span>Manage</span>
              </div>
              <div className="text-sm font-medium text-gray-600 text-center">
                Quick Actions
              </div>
            </div>

            {/* Permission Rows */}
            <div className="divide-y divide-gray-100">
              {accessPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="grid grid-cols-5 gap-4 py-4 px-6 hover:bg-gray-50 transition-colors items-center"
                >
                  {/* Resource Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <permission.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {permission.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {permission.description}
                      </div>
                    </div>
                  </div>

                  {/* View Checkbox */}
                  <div className="flex justify-center">
                    <Checkbox
                      checked={permissions[permission.id]?.view || false}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(
                          permission.id,
                          "view",
                          checked as boolean
                        )
                      }
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                  </div>

                  {/* Edit Checkbox */}
                  <div className="flex justify-center">
                    <Checkbox
                      checked={permissions[permission.id]?.edit || false}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(
                          permission.id,
                          "edit",
                          checked as boolean
                        )
                      }
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      disabled={!permissions[permission.id]?.view}
                    />
                  </div>

                  {/* Manage Checkbox */}
                  <div className="flex justify-center">
                    <Checkbox
                      checked={permissions[permission.id]?.manage || false}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(
                          permission.id,
                          "manage",
                          checked as boolean
                        )
                      }
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      disabled={!permissions[permission.id]?.edit}
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 py-1 h-7"
                      onClick={() => {
                        handlePermissionChange(permission.id, "view", true);
                        handlePermissionChange(permission.id, "edit", false);
                        handlePermissionChange(permission.id, "manage", false);
                      }}
                    >
                      View Only
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 py-1 h-7"
                      onClick={() => {
                        handlePermissionChange(permission.id, "view", true);
                        handlePermissionChange(permission.id, "edit", true);
                        handlePermissionChange(permission.id, "manage", true);
                      }}
                    >
                      Full Access
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permission Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Permission Summary
            </h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-medium text-blue-800">View Access:</span>
                <div className="mt-1">
                  {
                    Object.entries(permissions).filter(
                      ([_, perms]: any) => perms?.view
                    ).length
                  }{" "}
                  / {accessPermissions.length} resources
                </div>
              </div>
              <div>
                <span className="font-medium text-blue-800">Edit Access:</span>
                <div className="mt-1">
                  {
                    Object.entries(permissions).filter(
                      ([_, perms]: any) => perms?.edit
                    ).length
                  }{" "}
                  / {accessPermissions.length} resources
                </div>
              </div>
              <div>
                <span className="font-medium text-blue-800">
                  Manage Access:
                </span>
                <div className="mt-1">
                  {
                    Object.entries(permissions).filter(
                      ([_, perms]: any) => perms?.manage
                    ).length
                  }{" "}
                  / {accessPermissions.length} resources
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-8">
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white px-16 py-3 h-12 rounded-full font-medium"
              onClick={handleSaveChanges}
              disabled={isSaving || !selectedSecretary}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
