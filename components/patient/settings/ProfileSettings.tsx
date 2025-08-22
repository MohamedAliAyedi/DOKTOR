"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy } from "lucide-react";

export function ProfileSettings() {
  const [firstName, setFirstName] = useState("Ahmed");
  const [lastName, setLastName] = useState("Ben Ahmed");
  const [email, setEmail] = useState("Ahmed@mail.com");
  const [phoneNumber, setPhoneNumber] = useState("+216 92 928 2891");
  const [licenceId, setLicenceId] = useState("");
  const [address, setAddress] = useState("21 Street, Hammamet");

  const copyUserId = () => {
    navigator.clipboard.writeText("215368");
  };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-pink-500">Profile settings</h2>

      <div className="flex items-start space-x-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <Avatar className="w-32 h-32 mb-4">
            <AvatarImage src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=face" />
            <AvatarFallback className="bg-blue-500 text-white text-2xl">
              A
            </AvatarFallback>
          </Avatar>
          <button className="text-sm text-blue-500 hover:text-blue-600">
            Click to change photo
          </button>

          {/* My ID Section */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-pink-500 mb-2">My ID</h3>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-700">215368</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyUserId}
                className="w-6 h-6 p-0 text-blue-500 hover:bg-blue-50"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 grid grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <Label className="text-sm text-blue-500">First name</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label className="text-sm text-blue-500">Last name</Label>
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

          {/* Licence ID */}
          <div className="space-y-2">
            <Label className="text-sm text-blue-500">Licence ID</Label>
            <Input
              placeholder="Enter licence ID"
              value={licenceId}
              onChange={(e) => setLicenceId(e.target.value)}
              className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className="text-sm text-blue-500">Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-16 py-3 h-12 rounded-full font-medium">
          Save changes
        </Button>
      </div>
    </div>
  );
}
