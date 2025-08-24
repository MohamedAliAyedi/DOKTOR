"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { patientsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy } from "lucide-react";

export function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientId, setPatientId] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
      
      // Fetch patient profile for additional fields
      fetchPatientProfile();
    }
  }, [user]);

  const fetchPatientProfile = async () => {
    try {
      const response = await patientsAPI.getPatientProfile();
      const patientProfile = response.data.data.patient;
      setPatientId(patientProfile.patientId || "");
      setAddress(patientProfile.address?.street || "");
    } catch (error) {
      console.error('Failed to fetch patient profile:', error);
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(user?._id || "");
    toast({
      title: "Success",
      description: "User ID copied to clipboard",
    });
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      // Update user profile
      await updateProfile({
        firstName,
        lastName,
        phoneNumber
      });

      // Update patient profile
      await patientsAPI.updatePatientProfile({
        address: {
          street: address
        }
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-pink-500">Profile settings</h2>

      <div className="flex items-start space-x-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <Avatar className="w-32 h-32 mb-4">
            <AvatarImage src={user?.avatar || "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=face"} />
            <AvatarFallback className="bg-blue-500 text-white text-2xl">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <button className="text-sm text-blue-500 hover:text-blue-600">
            Click to change photo
          </button>

          {/* My ID Section */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-pink-500 mb-2">My ID</h3>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-700">
                {patientId || user?._id?.slice(-6) || "N/A"}
              </span>
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
              disabled
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

          {/* Patient ID */}
          <div className="space-y-2">
            <Label className="text-sm text-blue-500">Patient ID</Label>
            <Input
              value={patientId}
              className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              disabled
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
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-16 py-3 h-12 rounded-full font-medium"
          onClick={handleSaveChanges}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}