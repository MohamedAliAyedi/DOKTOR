"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function GeneralSettings() {
  const [language, setLanguage] = useState("English (USA)");
  const [timezone, setTimezone] = useState("UCT +00:00");
  const [dateFormat, setDateFormat] = useState("mm/dd/yyyy");
  const [timeFormat, setTimeFormat] = useState("12 hours");

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-pink-500">General settings</h2>

      {/* Language Section */}
      <div className="space-y-6">
        <h3 className="text-base font-medium text-pink-500">Language</h3>
        <div className="space-y-2">
          <label className="block text-sm text-gray-700">Language</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-80 h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
              <SelectItem value="English (USA)">English (USA)</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="Arabic">Arabic</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date & Time Section */}
      <div className="space-y-6">
        <h3 className="text-base font-medium text-pink-500">Date & Time</h3>

        {/* Timezone */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-700">Timezone</label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-80 h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
              <SelectItem value="UCT +00:00">UCT +00:00</SelectItem>
              <SelectItem value="UCT +01:00">UCT +01:00</SelectItem>
              <SelectItem value="UCT +02:00">UCT +02:00</SelectItem>
              <SelectItem value="UCT -05:00">UCT -05:00</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date and Time Format */}
        <div className="grid grid-cols-2 gap-8">
          {/* Date Format */}
          <div className="space-y-4">
            <label className="block text-sm text-gray-700">Date Format</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="date-format-1"
                  name="dateFormat"
                  value="mm/dd/yyyy"
                  checked={dateFormat === "mm/dd/yyyy"}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="date-format-1"
                  className="text-sm text-gray-700"
                >
                  mm/dd/yyyy
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="date-format-2"
                  name="dateFormat"
                  value="dd/mm/yyyy"
                  checked={dateFormat === "dd/mm/yyyy"}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="date-format-2"
                  className="text-sm text-gray-700"
                >
                  dd/mm/yyyy
                </label>
              </div>
            </div>
          </div>

          {/* Time Format */}
          <div className="space-y-4">
            <label className="block text-sm text-gray-700">Time Format</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="time-format-12"
                  name="timeFormat"
                  value="12 hours"
                  checked={timeFormat === "12 hours"}
                  onChange={(e) => setTimeFormat(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="time-format-12"
                  className="text-sm text-gray-700"
                >
                  12 hours
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="time-format-24"
                  name="timeFormat"
                  value="24 hours"
                  checked={timeFormat === "24 hours"}
                  onChange={(e) => setTimeFormat(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="time-format-24"
                  className="text-sm text-gray-700"
                >
                  24 hours
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
