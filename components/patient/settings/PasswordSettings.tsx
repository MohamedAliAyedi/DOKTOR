"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-pink-500">Password</h2>

      <div className="space-y-6 max-w-md">
        {/* Current Password */}
        <div className="space-y-2">
          <Label className="text-sm text-blue-500">Current password</Label>
          <Input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          />
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label className="text-sm text-blue-500">New password</Label>
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          />
        </div>

        {/* Confirm New Password */}
        <div className="space-y-2">
          <Label className="text-sm text-blue-500">Confirm new password</Label>
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          />
        </div>

        {/* Save Button */}
        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-16 py-3 h-12 rounded-full font-medium">
          Save changes
        </Button>
      </div>
    </div>
  );
}
