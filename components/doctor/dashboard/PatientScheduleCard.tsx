"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";

const appointments = [
  {
    name: "Aruna Nelson",
    time: "09:00 - 09:30 am",
    avatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Aruna Nelson",
    time: "09:30 - 10:00 am",
    avatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Aruna Nelson",
    time: "10:00 - 10:30 am",
    avatar:
      "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Aruna Nelson",
    time: "10:30 - 11:00 am",
    avatar:
      "https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
  },
];

export function PatientScheduleCard() {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-pink-600">
            Patient&apos;s schedule
          </h3>
          <p className="text-sm text-gray-500">Monday, 16 Sept 2021</p>
        </div>
        <div className="flex -space-x-2">
          {appointments.slice(0, 4).map((appointment, index) => (
            <Avatar key={index} className="w-10 h-10 border-2 border-white">
              <AvatarImage src={appointment.avatar} />
              <AvatarFallback>AN</AvatarFallback>
            </Avatar>
          ))}
          <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-sm font-medium text-white w-10 h-10 flex items-center justify-center">
              +9
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {appointments.map((appointment, index) => (
          <div
            key={index}
            className="bg-white flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-2 py-6"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={appointment.avatar} />
                <AvatarFallback>AN</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg text-gray-900">
                  {appointment.name}
                </p>
                <p className="text-md text-gray-500">{appointment.time}</p>
              </div>
            </div>
            <div className="w-10 h-10 border rounded-3xl border-gray-200 flex items-center justify-center">
              <ChevronRight className="w-6 h-6 text-black" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
