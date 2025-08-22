"use client";

import { useState } from "react";
import { Search, ChevronDown, Plus, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const consultationData = [
  {
    id: 1,
    name: "Marwen Said",
    avatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "22 Jan 2024",
    time: "12:24 pm",
    duration: "35 min",
  },
  {
    id: 2,
    name: "Mariem Routi",
    avatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "20 Jan 2024",
    time: "12:24 pm",
    duration: "35 min",
  },
  {
    id: 3,
    name: "Ahmed Bourat",
    avatar:
      "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "24 Jan 2024",
    time: "12:24 pm",
    duration: "35 min",
  },
  {
    id: 4,
    name: "Hassen Louati",
    avatar:
      "https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "26 Jan 2024",
    time: "12:24 pm",
    duration: "35 min",
  },
  {
    id: 5,
    name: "Laila Hamza",
    avatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "18 Jan 2024",
    time: "12:24 pm",
    duration: "35 min",
  },
  {
    id: 6,
    name: "Sami Ouni",
    avatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "28 Jan 2024",
    time: "12:24 pm",
    duration: "35 min",
  },
  {
    id: 7,
    name: "Sofien Jlassi",
    avatar:
      "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "16 Jan 2024",
    time: "12:24 pm",
    duration: "35 min",
  },
  {
    id: 8,
    name: "Nada Haji",
    avatar:
      "https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "16 Jan 2024",
    time: "12:24 pm",
    duration: "35 min",
  },
  {
    id: 9,
    name: "Sirine Jablon",
    avatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "16 Jan 2024",
    time: "12:24 pm",
    duration: "35 min",
  },
  {
    id: 10,
    name: "Ali Mouradi",
    avatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    date: "16 Jan 2024",
    time: "12:24 pm",
    duration: "35 min",
  },
];

export function ConsultationHistoryContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [duration, setDuration] = useState("Duration");
  const [age, setAge] = useState("Age");
  const [gender, setGender] = useState("Gender");
  const [tableView, setTableView] = useState("Table view");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-pink-500">
              History consultation list
            </h1>
            <p className="text-sm text-gray-500">
              10 New consultations were added yesterday
            </p>
          </div>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2">
          <span>Add new consultation</span>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search keywords"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border border-gray-200 focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg h-10"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center space-x-4">
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-32 h-10 border-gray-200 rounded-lg text-sm">
                <SelectValue />
                <ChevronDown className="w-4 h-4 ml-2" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                <SelectItem value="Duration">Duration</SelectItem>
                <SelectItem value="30min">30 min</SelectItem>
                <SelectItem value="45min">45 min</SelectItem>
                <SelectItem value="60min">60 min</SelectItem>
              </SelectContent>
            </Select>

            <Select value={age} onValueChange={setAge}>
              <SelectTrigger className="w-24 h-10 border-gray-200 rounded-lg text-sm">
                <SelectValue />
                <ChevronDown className="w-4 h-4 ml-2" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                <SelectItem value="Age">Age</SelectItem>
                <SelectItem value="18-30">18-30</SelectItem>
                <SelectItem value="31-50">31-50</SelectItem>
                <SelectItem value="50+">50+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="w-28 h-10 border-gray-200 rounded-lg text-sm">
                <SelectValue />
                <ChevronDown className="w-4 h-4 ml-2" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                <SelectItem value="Gender">Gender</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tableView} onValueChange={setTableView}>
              <SelectTrigger className="w-32 h-10 border-gray-200 rounded-lg text-sm">
                <SelectValue />
                <ChevronDown className="w-4 h-4 ml-2" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                <SelectItem value="Table view">Table view</SelectItem>
                <SelectItem value="Grid view">Grid view</SelectItem>
                <SelectItem value="List view">List view</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 py-3 px-4 text-sm font-medium text-gray-500 border-b border-gray-200">
          <div>Patient</div>
          <div>Date</div>
          <div>Time</div>
          <div>Duration</div>
          <div>Consultation report</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-1 mt-4">
          {consultationData.map((consultation) => (
            <div
              key={consultation.id}
              className="grid grid-cols-5 gap-4 py-4 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center"
            >
              {/* Patient */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={consultation.avatar} />
                  <AvatarFallback>
                    {consultation.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {consultation.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    See patient&apos;s profile
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="text-sm text-gray-600">{consultation.date}</div>

              {/* Time */}
              <div className="text-sm text-gray-600">{consultation.time}</div>

              {/* Duration */}
              <div className="text-sm text-gray-600">
                {consultation.duration}
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
  );
}
