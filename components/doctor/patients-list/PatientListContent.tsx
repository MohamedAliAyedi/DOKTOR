"use client";

import { useState } from "react";
import { Search, ChevronDown, UserPlus, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NewPatientModal } from "./NewPatientModal";
import { useRouter } from "next/navigation";

const patientData = [
  {
    id: 1,
    name: "Marwen Said",
    avatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    age: 38,
    visits: 4,
    joinDate: "22 Jan 2024",
    lastVisit: "22 Jan 2024",
  },
  {
    id: 2,
    name: "Mariem Raali",
    avatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    age: 26,
    visits: 8,
    joinDate: "20 Jan 2024",
    lastVisit: "20 Jan 2024",
  },
  {
    id: 3,
    name: "Ahmed Bourat",
    avatar:
      "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    age: 31,
    visits: 1,
    joinDate: "24 Jan 2024",
    lastVisit: "24 Jan 2024",
  },
  {
    id: 4,
    name: "Hassen Louati",
    avatar:
      "https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    age: 31,
    visits: 5,
    joinDate: "26 Jan 2024",
    lastVisit: "26 Jan 2024",
  },
  {
    id: 5,
    name: "Laila Hamza",
    avatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    age: 31,
    visits: 2,
    joinDate: "18 Jan 2024",
    lastVisit: "18 Jan 2024",
  },
  {
    id: 6,
    name: "Sami Ouni",
    avatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    age: 40,
    visits: 2,
    joinDate: "28 Jan 2024",
    lastVisit: "28 Jan 2024",
  },
  {
    id: 7,
    name: "Sofien Jlassi",
    avatar:
      "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    age: 35,
    visits: 4,
    joinDate: "16 Jan 2024",
    lastVisit: "16 Jan 2024",
  },
  {
    id: 8,
    name: "Nada Haji",
    avatar:
      "https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    age: 26,
    visits: 5,
    joinDate: "16 Jan 2024",
    lastVisit: "16 Jan 2024",
  },
  {
    id: 9,
    name: "Sirine Jablon",
    avatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    age: 19,
    visits: 1,
    joinDate: "16 Jan 2024",
    lastVisit: "16 Jan 2024",
  },
  {
    id: 10,
    name: "Ali Mouradi",
    avatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    age: 42,
    visits: 10,
    joinDate: "16 Jan 2024",
    lastVisit: "16 Jan 2024",
  },
];

export function PatientListContent() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePatientClick = (id: number) => {
    router.push(`/doctor/dashboard/patient-profile/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary flex items-center space-x-2">
              <span>Patient List</span>
              <Badge className="bg-blue-500 hover:bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                Total 231
              </Badge>
            </h1>
            <p className="text-sm text-gray-500">
              4 New patients were added yesterday
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add a new patient</span>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        <div className="flex items-center justify-between mb-6">
          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search keywords"
              className="pl-10 bg-white border border-gray-200 focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg h-10"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2"
            >
              <span className="text-sm">Duration</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2"
            >
              <span className="text-sm">Age</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2"
            >
              <span className="text-sm">Gender</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2"
            >
              <span className="text-sm">Table view</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 py-3 px-4 text-sm font-medium text-gray-500 border-b border-gray-200">
          <div>List Of Patients</div>
          <div>Age</div>
          <div>Visit</div>
          <div>Join Since</div>
          <div>Last visit</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-2 mt-4">
          {patientData.map((patient) => (
            <div
              key={patient.id}
              onClick={() => handlePatientClick(patient.id)}
              className="grid grid-cols-5 gap-4 py-4 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center cursor-pointer"
            >
              {/* Patient */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={patient.avatar} />
                  <AvatarFallback>
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {patient.name}
                  </p>
                  <p className="text-xs text-gray-500">See patient profile</p>
                </div>
              </div>

              {/* Age */}
              <div className="text-sm text-gray-600">{patient.age}</div>

              {/* Visits */}
              <div className="text-sm text-gray-600">{patient.visits}</div>

              {/* Join Date */}
              <div className="text-sm text-gray-600">{patient.joinDate}</div>

              {/* Last Visit */}
              <div className="text-sm text-gray-600">{patient.lastVisit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* New Patient Modal */}
      <NewPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
