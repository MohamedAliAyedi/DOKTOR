"use client";

import { useState, useEffect } from "react";
import { patientsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function PatientInfoCard() {
  const { user } = useAuth();
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    try {
      const response = await patientsAPI.getPatientProfile();
      setPatientProfile(response.data.data.patient);
    } catch (error) {
      console.error('Failed to fetch patient profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  const patientInfo = [
    { label: "Gender", value: patientProfile?.gender || "Not specified", color: "text-blue-600" },
    { label: "Age", value: patientProfile?.age?.toString() || "N/A", color: "text-blue-600" },
    { label: "Height", value: patientProfile?.height ? `${patientProfile.height.value} ${patientProfile.height.unit}` : "N/A", color: "text-blue-600" },
    { label: "Weight", value: patientProfile?.weight ? `${patientProfile.weight.value} ${patientProfile.weight.unit}` : "N/A", color: "text-blue-600" },
    { label: "Blood Type", value: patientProfile?.bloodType || "Unknown", color: "text-blue-600" },
    { label: "Fitzpatrick", value: patientProfile?.fitzpatrickType ? `${patientProfile.fitzpatrickType} Type` : "N/A", color: "text-blue-600" },
  ];

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
      <div className="flex items-center space-x-6">
        {/* Avatar */}
        <Avatar className="w-20 h-20">
          <AvatarImage src={user?.avatar || "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=face"} />
          <AvatarFallback className="bg-blue-500 text-white text-2xl">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>

        {/* Patient Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            All your indexes in one place
          </p>

          {/* Info Grid */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            {patientInfo.map((info, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 border border-gray-200"
              >
                <p className="text-xs text-gray-500 mb-1">{info.label}</p>
                <p className={`font-semibold ${info.color}`}>{info.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}