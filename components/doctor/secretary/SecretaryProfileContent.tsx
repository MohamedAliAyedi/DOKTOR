"use client";

import { useState } from "react";
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
  const [userId, setUserId] = useState("215367");
  const [firstName, setFirstName] = useState("Marwa");
  const [lastName, setLastName] = useState("Saidi");
  const [email, setEmail] = useState("Marwa@mail.com");
  const [phoneNumber, setPhoneNumber] = useState("+216 22 333 444");
  const [role, setRole] = useState("Secretary");

  // Access permissions state
  const [permissions, setPermissions] = useState({
    superAdmin: { view: true, edit: true, manage: true },
    admin: { view: true, edit: false, manage: false },
    employee: { view: true, edit: false, manage: false },
  });

  const handlePermissionChange = (
    role: string,
    permission: string,
    checked: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role as keyof typeof prev],
        [permission]: checked,
      },
    }));
  };

  const handleReset = () => {
    setUserId("215367");
    setFirstName("Marwa");
    setLastName("Saidi");
    setEmail("Marwa@mail.com");
    setPhoneNumber("+216 22 333 444");
    setRole("Secretary");
    setPermissions({
      superAdmin: { view: true, edit: true, manage: true },
      admin: { view: true, edit: false, manage: false },
      employee: { view: true, edit: false, manage: false },
    });
  };

  const handleSaveChanges = () => {
    console.log("Saving changes...");
  };

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
                <AvatarImage src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=face" />
                <AvatarFallback className="bg-blue-500 text-white text-2xl">
                  MS
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
              <h3 className="font-semibold text-gray-900">Marwa Saidi</h3>
              <div className="flex items-center space-x-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            {/* User ID */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">User ID *</Label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">Role *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  <SelectItem value="Secretary">Secretary</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">First Name *</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">Last Name *</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500">Phone number</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>
          </div>
        </div>

        {/* Access Permission Section */}
        <div className="space-y-6">
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

            {/* Super Admin Row */}
            <div className="grid grid-cols-4 gap-4 py-4 px-6 border-b border-gray-100">
              <div className="text-sm text-gray-700">Super Admin</div>
              <div className="flex justify-center">
                <Checkbox
                  checked={permissions.superAdmin.view}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "superAdmin",
                      "view",
                      checked as boolean
                    )
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={permissions.superAdmin.edit}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "superAdmin",
                      "edit",
                      checked as boolean
                    )
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={permissions.superAdmin.manage}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "superAdmin",
                      "manage",
                      checked as boolean
                    )
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
              </div>
            </div>

            {/* Admin Row */}
            <div className="grid grid-cols-4 gap-4 py-4 px-6 border-b border-gray-100">
              <div className="text-sm text-gray-700">Admin</div>
              <div className="flex justify-center">
                <Checkbox
                  checked={permissions.admin.view}
                  onCheckedChange={(checked) =>
                    handlePermissionChange("admin", "view", checked as boolean)
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={permissions.admin.edit}
                  onCheckedChange={(checked) =>
                    handlePermissionChange("admin", "edit", checked as boolean)
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={permissions.admin.manage}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "admin",
                      "manage",
                      checked as boolean
                    )
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
              </div>
            </div>

            {/* Employee Row */}
            <div className="grid grid-cols-4 gap-4 py-4 px-6">
              <div className="text-sm text-gray-700">Employee</div>
              <div className="flex justify-center">
                <Checkbox
                  checked={permissions.employee.view}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "employee",
                      "view",
                      checked as boolean
                    )
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={permissions.employee.edit}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "employee",
                      "edit",
                      checked as boolean
                    )
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={permissions.employee.manage}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(
                      "employee",
                      "manage",
                      checked as boolean
                    )
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
              </div>
            </div>
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
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
