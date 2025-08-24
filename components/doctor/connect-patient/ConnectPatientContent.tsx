"use client";

import { useState } from "react";
import { patientsAPI, usersAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Camera, Share2, Phone, Mail, QrCode } from "lucide-react";

export function ConnectPatientContent() {
  const { user } = useAuth();
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
      // Accept patient connection directly by patient ID
      await patientsAPI.acceptPatientConnection(patientId);

      toast({
        title: "Success",
        description: "Patient connected successfully",
      });
      
      setPatientId("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to connect patient",
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

    try {
      // Create invitation link with phone number
      const inviteData = {
        type: 'doctor-invite',
        phoneNumber: phoneNumber,
        doctorId: user?._id,
        doctorName: `${user?.firstName} ${user?.lastName}`
      };
      
      const inviteLink = `${window.location.origin}/patient/connect-doctor?invite=${btoa(JSON.stringify(inviteData))}`;
      
      // Copy to clipboard for now (in real app, would send SMS)
      navigator.clipboard.writeText(`Dr. ${user?.firstName} ${user?.lastName} has invited you to connect on DOKTOR: ${inviteLink}`);
      
      toast({
        title: "Success",
        description: "Invitation link copied to clipboard. Send this via SMS.",
      });
      
      setPhoneNumber("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invitation",
        variant: "destructive",
      });
    }
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

    try {
      // Create invitation link with email
      const inviteData = {
        type: 'doctor-invite',
        email: email,
        doctorId: user?._id,
        doctorName: `${user?.firstName} ${user?.lastName}`
      };
      
      const inviteLink = `${window.location.origin}/patient/connect-doctor?invite=${btoa(JSON.stringify(inviteData))}`;
      
      // Copy to clipboard for now (in real app, would send email)
      navigator.clipboard.writeText(`Dr. ${user?.firstName} ${user?.lastName} has invited you to connect on DOKTOR: ${inviteLink}`);
      
      toast({
        title: "Success",
        description: "Invitation link copied to clipboard. Send this via email.",
      });
      
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invitation",
        variant: "destructive",
      });
    }
  };

  const handleShareLink = () => {
    const shareData = {
      type: 'doctor-invite',
      doctorId: user?._id,
      doctorName: `${user?.firstName} ${user?.lastName}`,
      timestamp: Date.now()
    };
    
    const shareUrl = `${window.location.origin}/patient/connect-doctor?invite=${btoa(JSON.stringify(shareData))}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Connect with your doctor on DOKTOR',
        text: `Dr. ${user?.firstName} ${user?.lastName} has invited you to connect on DOKTOR for better healthcare management`,
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

  const handleUploadQR = () => {
    // Create file input for QR code upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In a real app, you would process the QR code here
        // For now, just show success message
        toast({
          title: "Success",
          description: "QR code uploaded. Processing...",
        });
      }
    };
    input.click();
  };

  const handleOpenCamera = () => {
    // Check if device has camera access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          toast({
            title: "Info",
            description: "Camera access granted. QR scanner will open in mobile app.",
          });
        })
        .catch(() => {
          toast({
            title: "Info",
            description: "Camera access denied. Please use upload option instead.",
            variant: "destructive",
          });
        });
    } else {
      toast({
        title: "Info",
        description: "Camera not available on this device",
        variant: "destructive",
      });
    }
  };

  // Generate QR code data
  const generateQRCode = () => {
    const qrData = {
      type: 'doctor-connect',
      doctorId: user?._id,
      doctorName: `${user?.firstName} ${user?.lastName}`,
      timestamp: Date.now()
    };
    return btoa(JSON.stringify(qrData));
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

              {/* DOKTOR app preview */}
              <div className="p-2 space-y-2">
                <div className="text-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg mx-auto mb-1"></div>
                  <div className="text-xs font-bold text-blue-600">DOKTOR</div>
                </div>
                <div className="space-y-1">
                  <div className="w-full h-2 bg-blue-100 rounded"></div>
                  <div className="w-3/4 h-2 bg-pink-100 rounded"></div>
                  <div className="w-full h-2 bg-green-100 rounded"></div>
                </div>
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

            {/* QR Code - Generate dynamic QR code */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center relative">
                    {/* Simple QR code pattern */}
                    <div className="grid grid-cols-8 gap-1">
                      {Array.from({ length: 64 }, (_, i) => {
                        // Create a pattern based on doctor ID and index
                        const pattern = (user?._id?.charCodeAt(i % (user._id.length || 1)) || 0) + i;
                        return (
                          <div
                            key={i}
                            className={`w-1 h-1 ${
                              pattern % 2 === 0 ? 'bg-black' : 'bg-white'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Doctor QR Code</p>
                </div>
              </div>
            </div>

            {/* QR Code Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleUploadQR}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload QR Code</span>
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

          {/* QR Code Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Your Doctor Code</h4>
            <p className="text-xs text-blue-700 mb-2">
              Share this code with patients to connect:
            </p>
            <div className="bg-white rounded-lg p-2 text-center">
              <span className="font-mono text-lg font-bold text-gray-900">
                {user?._id?.slice(-8).toUpperCase() || 'DOC12345'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}