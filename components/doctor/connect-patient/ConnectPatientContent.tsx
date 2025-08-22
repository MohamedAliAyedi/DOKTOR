"use client";

import { useState } from "react";
import { patientsAPI, usersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Camera, Share2, Phone, Mail } from "lucide-react";

export function ConnectPatientContent() {
  const [patientId, setPatientId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConnectByPatientId = async () => {
    if (!patientId) {
      toast({
        title: "Error",
        description: "Please enter a patient ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Find patient by ID and send connection request
      const searchResponse = await usersAPI.searchUsers({
        query: patientId,
        role: 'patient'
      });

      if (searchResponse.data.data.users.length === 0) {
        throw new Error("Patient not found");
      }

      const patient = searchResponse.data.data.users[0];
      await patientsAPI.acceptPatientConnection(patient._id);

      toast({
        title: "Success",
        description: "Connection request sent successfully",
      });
      
      setPatientId("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send connection request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneInvitation = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    // This would typically send an SMS invitation
    toast({
      title: "Success",
      description: "Phone invitation sent successfully",
    });
  };

  const handleSendEmailInvitation = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // This would typically send an email invitation
    toast({
      title: "Success",
      description: "Email invitation sent successfully",
    });
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/connect-doctor?ref=${btoa(JSON.stringify({ type: 'doctor' }))}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Connect with me on DOKTOR',
        text: 'Join me on DOKTOR for better healthcare management',
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Link copied to clipboard",
      });
    }
  };

  const handleUploadHeader = () => {
    // Create file input for QR code upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Process QR code file
        toast({
          title: "Success",
          description: "QR code uploaded successfully",
        });
      }
    };
    input.click();
  };

  const handleOpenCamera = () => {
    // This would open camera for QR code scanning
    toast({
      title: "Info",
      description: "Camera QR scanner will be available in the mobile app",
    });
  };

  return (
    <div className="space-y-6 relative mt-8">
      {/* Stay Connected Banner with Phone extending outside */}
      <div className="relative">
        {/* Phone illustration positioned absolutely to extend outside */}
        <div className="absolute -top-12 right-8 z-10">
          <div className="w-24 h-44 bg-gray-900 rounded-2xl border-4 border-gray-700 relative shadow-2xl">
            {/* Phone screen */}
            <div className="bg-white rounded-xl m-1 relative overflow-hidden">
              {/* Status bar */}
              <div className="h-6 bg-gray-100 flex items-center justify-end px-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              </div>

              {/* Chat bubbles */}
              <div className="p-2 space-y-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                <div className="w-12 h-3 bg-gray-200 rounded-full ml-auto"></div>
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="w-10 h-3 bg-blue-200 rounded-full ml-auto"></div>
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-600 rounded-full"></div>
          </div>

          {/* Floating elements around phone */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-300 rounded-full"></div>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="flex items-center justify-between pr-32">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Stay Connected</h1>
              <p className="text-blue-100 text-lg">
                Effortless access to care, anytime you need it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        {/* Left Column - Connect to My patient */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-pink-500">
            Connect to My patient
          </h2>

          {/* Add Patient by ID */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-blue-500 font-medium mb-2">
                Add Patient by their ID
              </label>
              <Input
                placeholder="Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="h-12 bg-white border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
              <Button
                onClick={handleConnectByPatientId}
                className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </div>

          {/* Connect by QR Code */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-pink-500">
              Connect by QR Code
            </h3>

            {/* QR Code - Using dummy image */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-center">
                <img
                  src="https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
                  alt="QR Code"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            {/* QR Code Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleUploadHeader}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload header</span>
              </Button>
              <Button
                onClick={handleOpenCamera}
                variant="outline"
                className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 h-12 rounded-xl flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Send Invitation */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-pink-500">Send Invitation</h2>

          {/* Phone Number */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-blue-500 font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-12 bg-white border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200 pl-12 pr-12"
                />
                <Button
                  onClick={handleSendPhoneInvitation}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-blue-500 font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-white border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200 pl-12 pr-12"
                />
                <Button
                  onClick={handleSendEmailInvitation}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Share Link Button */}
          <div className="pt-4">
            <Button
              onClick={handleShareLink}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl flex items-center justify-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share my link</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}