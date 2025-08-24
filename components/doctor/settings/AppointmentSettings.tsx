"use client";

import { useState } from "react";
import { useEffect } from "react";
import { doctorsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [workingHours, setWorkingHours] = useState({
    monday: { start: "09:00", end: "17:00", isWorking: true },
    tuesday: { start: "09:00", end: "17:00", isWorking: true },
    wednesday: { start: "09:00", end: "17:00", isWorking: true },
    thursday: { start: "09:00", end: "17:00", isWorking: true },
    friday: { start: "09:00", end: "17:00", isWorking: true },
    saturday: { start: "09:00", end: "13:00", isWorking: true },
    sunday: { start: "00:00", end: "00:00", isWorking: false },
  });
  const [breakTime, setBreakTime] = useState({
    start: "12:00",
    end: "13:00"
  });
  const [appointmentTypes, setAppointmentTypes] = useState([
    { id: 1, name: "Consultation", checked: true },
    { id: 2, name: "Follow up", checked: true },
    { id: 3, name: "Virtual", checked: false },
    { id: 4, name: "Routine Checkup", checked: true },
    { id: 5, name: "Urgent Care", checked: true },
  ]);
  const [bufferTime, setBufferTime] = useState("30");
  const [newAppointmentType, setNewAppointmentType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const response = await doctorsAPI.getDoctorProfile();
      const doctor = response.data.data.doctor;
      
      if (doctor.workingHours) {
        setWorkingHours(doctor.workingHours);
      }
    } catch (error) {
      console.error('Failed to fetch doctor profile:', error);
    }
  };

  const toggleWorkingDay = (day: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        isWorking: !prev[day as keyof typeof prev].isWorking
      }
    }));
  };

  const updateWorkingHours = (day: string, field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
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

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await doctorsAPI.updateWorkingHours(workingHours);

      toast({
        title: "Success",
        description: "Appointment settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update appointment settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-pink-500">
        Appointment settings
      </h2>

      {/* Working Hours */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-pink-500">
          Working Hours
        </h3>
        <div className="space-y-4">
          {Object.entries(workingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-24">
                <Checkbox
                  checked={hours.isWorking}
                  onCheckedChange={() => toggleWorkingDay(day)}
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700 capitalize">{day}</span>
              </div>
              {hours.isWorking && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={hours.start}
                    onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                    className="w-32 h-10 border-gray-200 rounded-lg"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="time"
                    value={hours.end}
                    onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                    className="w-32 h-10 border-gray-200 rounded-lg"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Break Time */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-pink-500">Break time</h3>
        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">From</Label>
            <Input
              type="time"
              value={breakTime.start}
              onChange={(e) => setBreakTime(prev => ({ ...prev, start: e.target.value }))}
              className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">To</Label>
            <Input
              type="time"
              value={breakTime.end}
              onChange={(e) => setBreakTime(prev => ({ ...prev, end: e.target.value }))}
              className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>
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
            <SelectItem value="15">15 min</SelectItem>
            <SelectItem value="30">30 min</SelectItem>
            <SelectItem value="45">45 min</SelectItem>
            <SelectItem value="60">60 min</SelectItem>
          </SelectContent>
        </Select>
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