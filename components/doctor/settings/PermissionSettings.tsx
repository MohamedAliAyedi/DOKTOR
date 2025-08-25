"use client";

import { useState } from "react";
import { useEffect } from "react";
import { secretariesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { NewServiceModal } from "./NewServiceModal";
import { Button } from "@/components/ui/button";

const accessPermissions = [
  { id: "bills", label: "Bills" },
  { id: "patientList", label: "Patient List" },
  { id: "appointmentConfirmation", label: "Appointment confirmation" },
  { id: "invitationRequest", label: "Invitation request" },
  { id: "consultation", label: "Consultation" },
  { id: "medicalRecords", label: "Medical Records" },
];

export function PermissionSettings() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [permissions, setPermissions] = useState({
    bills: { view: true, edit: true, manage: true },
    patientList: { view: true, edit: true, manage: true },
    appointmentConfirmation: { view: true, edit: true, manage: true },
    invitationRequest: { view: true, edit: true, manage: true },
    consultation: { view: true, edit: true, manage: true },
    medicalRecords: { view: true, edit: false, manage: false },
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSecretaries();
  }, []);

  const fetchSecretaries = async () => {
    try {
      const response = await secretariesAPI.getSecretaries();
      const secretaries = response.data.data.secretaries || [];
      setTeamMembers(secretaries);
      
      if (secretaries.length > 0) {
        setSelectedMember(secretaries[0]._id);
        setPermissions(secretaries[0].permissions || permissions);
      }
    } catch (error) {
      console.error('Failed to fetch secretaries:', error);
      setTeamMembers([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberSelect = (id: string) => {
    setSelectedMember(id);
    const member = teamMembers.find(m => m._id === id);
    if (member) {
      setPermissions(member.permissions || permissions);
    }
  };

  const handlePermissionChange = (
    permissionId: string,
    type: "view" | "edit" | "manage",
    checked: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionId]: {
        ...prev[permissionId as keyof typeof prev],
        [type]: checked,
      },
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedMember) return;

    try {
      await secretariesAPI.updatePermissions(selectedMember, {
        permissions
      });

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update permissions",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-lg font-semibold text-pink-500">Permission Settings</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="space-y-8">
        <h2 className="text-lg font-semibold text-pink-500">Permission Settings</h2>
        <div className="text-center py-8 text-gray-500">
          No secretaries found. Add secretaries to manage permissions.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-pink-500">
        Permission Settings
      </h2>

      {/* Team Member Selection */}
      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
        {teamMembers.map((member) => (
          <button
            key={member._id}
            onClick={() => handleMemberSelect(member._id)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-full border-2 transition-all whitespace-nowrap ${
              selectedMember === member._id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={member.user?.avatar} />
              <AvatarFallback>
                {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <span
              className={`text-sm font-medium ${
                selectedMember === member._id ? "text-blue-600" : "text-gray-700"
              }`}
            >
              {member.user?.firstName} {member.user?.lastName}
            </span>
          </button>
        ))}
      </div>

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
            Manage (Full access)
          </div>
        </div>

        {/* Permission Rows */}
        <div className="divide-y divide-gray-100">
          {accessPermissions.map((permission) => (
            <div
              key={permission.id}
              className="grid grid-cols-4 gap-4 py-4 px-6 hover:bg-gray-50 transition-colors items-center"
            >
              {/* Permission Name */}
              <div className="text-sm text-gray-700">{permission.label}</div>

              {/* View Checkbox */}
              <div className="flex justify-center">
                <Checkbox
                  checked={
                    permissions[permission.id as keyof typeof permissions]?.view
                  }
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
                  checked={
                    permissions[permission.id as keyof typeof permissions]?.edit
                  }
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      permission.id,
                      "edit",
                      checked as boolean
                    )
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
              </div>

              {/* Manage Checkbox */}
              <div className="flex justify-center">
                <Checkbox
                  checked={
                    permissions[permission.id as keyof typeof permissions]
                      ?.manage
                  }
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      permission.id,
                      "manage",
                      checked as boolean
                    )
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-16 py-3 h-12 rounded-full font-medium"
          onClick={handleSaveChanges}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}