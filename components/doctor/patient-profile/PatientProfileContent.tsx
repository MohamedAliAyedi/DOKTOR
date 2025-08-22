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
import { FileText } from "lucide-react";

const appointmentsData = [
  {
    id: 1,
    doctor: "Marwen Said",
    doctorAvatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "22 Jan 2024",
    reason: "Headache",
    checkUps: "22 Jan 2024",
  },
  {
    id: 2,
    doctor: "Mariem Routi",
    doctorAvatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "20 Jan 2024",
    reason: "Headache",
    checkUps: "-",
  },
  {
    id: 3,
    doctor: "Ahmed Bourat",
    doctorAvatar:
      "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "24 Jan 2024",
    reason: "Headache",
    checkUps: "-",
  },
  {
    id: 4,
    doctor: "Hassen Louati",
    doctorAvatar:
      "https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "26 Jan 2024",
    reason: "Headache",
    checkUps: "22 Jan 2024",
  },
  {
    id: 5,
    doctor: "Laila Hamza",
    doctorAvatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "18 Jan 2024",
    reason: "Headache",
    checkUps: "-",
  },
  {
    id: 6,
    doctor: "Sami Ouni",
    doctorAvatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "28 Jan 2024",
    reason: "Headache",
    checkUps: "22 Jan 2024",
  },
];

export function PatientProfileContent() {
  const [firstName, setFirstName] = useState("Mohamed");
  const [lastName, setLastName] = useState("Ben Mohamed");
  const [email, setEmail] = useState("Mohamed2@mail.com");
  const [accountType, setAccountType] = useState("Patient");

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 border-gray-50">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-pink-500 mb-1">My Profile</h1>
          <p className="text-gray-500 text-sm">All About You In One Place</p>
        </div>

        <div className="flex items-start space-x-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <Avatar className="w-32 h-32 mb-4">
              <AvatarImage src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=face" />
              <AvatarFallback className="bg-blue-500 text-white text-2xl">
                M
              </AvatarFallback>
            </Avatar>
            <button className="text-sm text-blue-500 hover:text-blue-600">
              Click to change photo
            </button>
          </div>

          {/* Form Section */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Last name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Account Type</Label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  <SelectItem value="Patient">Patient</SelectItem>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Secretary">Secretary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-3 rounded-full text-base font-medium">
            Save changes
          </Button>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 border-gray-50">
        <h2 className="text-2xl font-bold text-pink-500 mb-6">Appointments</h2>

        {/* Table */}
        <div className="overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 py-4 px-4 text-sm font-medium text-gray-500 border-b border-gray-200">
            <div>Doctor</div>
            <div>Date</div>
            <div>Reason</div>
            <div>Check-ups</div>
            <div>Consultation report</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-1">
            {appointmentsData.map((appointment) => (
              <div
                key={appointment.id}
                className="grid grid-cols-5 gap-4 py-4 px-4 hover:bg-gray-50 transition-colors items-center"
              >
                {/* Doctor */}
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={appointment.doctorAvatar} />
                    <AvatarFallback>
                      {appointment.doctor
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-900 font-medium">
                    {appointment.doctor}
                  </span>
                </div>

                {/* Date */}
                <div className="text-sm text-gray-600">{appointment.date}</div>

                {/* Reason */}
                <div className="text-sm text-blue-500">
                  {appointment.reason}
                </div>

                {/* Check-ups */}
                <div className="text-sm text-gray-600">
                  {appointment.checkUps}
                </div>

                {/* Consultation Report */}
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 text-blue-500 hover:bg-blue-50"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
