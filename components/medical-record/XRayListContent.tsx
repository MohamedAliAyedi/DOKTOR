"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronDown, FileText } from "lucide-react";

const xrayData = [
  {
    id: 1,
    type: "Shoulder",
    doctorName: "Marwen Said",
    date: "22 Jan 2024",
    reason: "Headache",
    prescription: "Advised CBC,Painkiller",
  },
  {
    id: 2,
    type: "Skull",
    doctorName: "Mariem Routi",
    date: "20 Jan 2024",
    reason: "Headache",
    prescription: "Advised CBC,Painkiller",
  },
  {
    id: 3,
    type: "Skull",
    doctorName: "Ahmed Bourat",
    date: "24 Jan 2024",
    reason: "Headache",
    prescription: "Advised CBC,Painkiller",
  },
  {
    id: 4,
    type: "Legs",
    doctorName: "Hassen Louati",
    date: "26 Jan 2024",
    reason: "Headache",
    prescription: "Advised CBC,Painkiller",
  },
  {
    id: 5,
    type: "Vertebral column",
    doctorName: "Laila Hamza",
    date: "18 Jan 2024",
    reason: "Headache",
    prescription: "Advised CBC,Painkiller",
  },
  {
    id: 6,
    type: "Upper Limbs",
    doctorName: "Sami Ouni",
    date: "28 Jan 2024",
    reason: "Headache",
    prescription: "Advised CBC,Painkiller",
  },
  {
    id: 7,
    type: "Vertebral column",
    doctorName: "Sofien Jlassi",
    date: "16 Jan 2024",
    reason: "Headache",
    prescription: "Advised CBC,Painkiller",
  },
];

const filterButtons = [
  { label: "Skull", active: true },
  { label: "Vertebral Column", active: false },
  { label: "Upper Limbs", active: false },
  { label: "Pelvic Girdle", active: false },
  { label: "Legs", active: false },
];

export function XRayListContent() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("Skull");
  const [searchTerm, setSearchTerm] = useState("");
  const [duration, setDuration] = useState("Show all");

  const handleXRayClick = (id: number) => {
    router.push(`/medical-record/xray-results/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face" />
            <AvatarFallback className="bg-blue-500 text-white">
              👤
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-pink-500">X-Ray List</h1>
            <p className="text-gray-600">
              Mokhtar Amine Ghannouchi{" "}
              <span className="text-gray-400">#P-00016</span>
            </p>
          </div>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full p-0">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </Button>
      </div>

      {/* Main Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        {/* Search and Duration Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border border-gray-200 focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg h-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Duration</span>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-32 h-8 border-gray-200 rounded-lg text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                <SelectItem value="Show all">Show all</SelectItem>
                <SelectItem value="Last week">Last week</SelectItem>
                <SelectItem value="Last month">Last month</SelectItem>
                <SelectItem value="Last year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-3 mb-6">
          {filterButtons.map((filter) => (
            <Button
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter.label
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 py-3 px-4 text-sm font-medium text-gray-500 border-b border-gray-200">
          <div>X-Ray</div>
          <div>Doctor name</div>
          <div>Date</div>
          <div>Reason</div>
          <div>Prescription</div>
          <div>Report</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-1 mt-4">
          {xrayData.map((xray) => (
            <div
              key={xray.id}
              onClick={() => handleXRayClick(xray.id)}
              className="grid grid-cols-6 gap-4 py-4 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center cursor-pointer"
            >
              {/* X-Ray Type */}
              <div className="text-sm text-gray-900 font-medium">
                {xray.type}
              </div>

              {/* Doctor Name */}
              <div className="text-sm text-gray-600">{xray.doctorName}</div>

              {/* Date */}
              <div className="text-sm text-gray-600">{xray.date}</div>

              {/* Reason */}
              <div className="text-sm text-blue-500">{xray.reason}</div>

              {/* Prescription */}
              <div className="text-sm text-gray-600">{xray.prescription}</div>

              {/* Report */}
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
  );
}
