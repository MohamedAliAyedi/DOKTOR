"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export function AppointmentSettings() {
  const [availabilityFrom, setAvailabilityFrom] = useState("9:00 AM");
  const [availabilityTo, setAvailabilityTo] = useState("6:00 PM");
  const [breakFrom, setBreakFrom] = useState("12:00 PM");
  const [breakTo, setBreakTo] = useState("1:00 PM");
  const [workingDays, setWorkingDays] = useState([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]);
  const [appointmentTypes, setAppointmentTypes] = useState([
    { id: 1, name: "Consultation", checked: true },
    { id: 2, name: "Follow up", checked: true },
    { id: 3, name: "Virtual", checked: false },
  ]);
  const [bufferTime, setBufferTime] = useState("30 min");
  const [newAppointmentType, setNewAppointmentType] = useState("");

  const toggleWorkingDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleAppointmentType = (id: number) => {
    setAppointmentTypes((prev) =>
      prev.map((type) =>
        type.id === id ? { ...type, checked: !type.checked } : type
      )
    );
  };

  const addAppointmentType = () => {
    if (newAppointmentType.trim()) {
      const newType = {
        id: appointmentTypes.length + 1,
        name: newAppointmentType,
        checked: true,
      };
      setAppointmentTypes([...appointmentTypes, newType]);
      setNewAppointmentType("");
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-pink-500">
        Appointment settings
      </h2>

      {/* Availability Hours */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-pink-500">
          Availability Hours
        </h3>
        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">From</Label>
            <Input
              value={availabilityFrom}
              onChange={(e) => setAvailabilityFrom(e.target.value)}
              className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">To</Label>
            <Input
              value={availabilityTo}
              onChange={(e) => setAvailabilityTo(e.target.value)}
              className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>

      {/* Break Time */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-pink-500">Break time</h3>
        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">From</Label>
            <Input
              value={breakFrom}
              onChange={(e) => setBreakFrom(e.target.value)}
              className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">To</Label>
            <Input
              value={breakTo}
              onChange={(e) => setBreakTo(e.target.value)}
              className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>

      {/* Working Days */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-pink-500">Working days</h3>
        <div className="flex flex-wrap gap-3">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (
            <Button
              key={day}
              onClick={() => toggleWorkingDay(day)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                workingDays.includes(day)
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
            >
              {day}
            </Button>
          ))}
        </div>
      </div>

      {/* Appointment Types */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-pink-500">
          Appointment types
        </h3>
        <div className="space-y-3">
          {appointmentTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-3">
              <Checkbox
                checked={type.checked}
                onCheckedChange={() => toggleAppointmentType(type.id)}
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <span className="text-sm text-gray-700">{type.name}</span>
            </div>
          ))}

          {/* Add new appointment type */}
          <div className="flex items-center space-x-3 mt-4">
            <span className="text-sm text-blue-500">Add appointment Type</span>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add appointment type"
                value={newAppointmentType}
                onChange={(e) => setNewAppointmentType(e.target.value)}
                className="h-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 w-48"
              />
              <Button
                onClick={addAppointmentType}
                className="w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Buffer Time */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-pink-500">
          Buffer time (Between consultations)
        </h3>
        <Select value={bufferTime} onValueChange={setBufferTime}>
          <SelectTrigger className="w-48 h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
            <SelectItem value="15 min">15 min</SelectItem>
            <SelectItem value="30 min">30 min</SelectItem>
            <SelectItem value="45 min">45 min</SelectItem>
            <SelectItem value="60 min">60 min</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
