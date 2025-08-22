"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";

export function ThemeSettings() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logoFile, setLogoFile] = useState("");
  const [prescriptionHeader, setPrescriptionHeader] = useState("");
  const [reportHeader, setReportHeader] = useState("");
  const [appointmentSummary, setAppointmentSummary] = useState("");
  const [prescriptionFooter, setPrescriptionFooter] = useState("");
  const [paperSize, setPaperSize] = useState("");
  const [margin, setMargin] = useState("");

  const handleFileUpload = (type: string) => {
    console.log(`Uploading ${type}`);
  };

  const handleView = (type: string) => {
    console.log(`Viewing ${type}`);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-pink-500">Theme settings</h2>

      {/* Theme Selection */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-pink-500">Theme Selection</h3>
        <div className="flex items-center justify-between max-w-xs">
          <span className="text-sm text-gray-700">Dark</span>
          <Switch
            checked={isDarkMode}
            onCheckedChange={setIsDarkMode}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>
      </div>

      {/* Custom Branding */}
      <div className="space-y-6">
        <h3 className="text-base font-medium text-pink-500">Custom Branding</h3>
        {/* Logo Upload */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">No logo uploaded</span>
            </div>
            <div className="flex-1">
              <Label className="text-sm text-blue-500 font-medium mb-2 block">
                Logo
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Upload logo"
                  value={logoFile}
                  onChange={(e) => setLogoFile(e.target.value)}
                  className="flex-1 h-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
                <Button
                  onClick={() => handleFileUpload("logo")}
                  className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full p-0"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Customization */}
      <div className="space-y-6">
        <h3 className="text-base font-medium text-pink-500">
          Document customization
        </h3>

        {/* Prescription Header */}
        <div className="space-y-2">
          <Label className="text-sm text-blue-500 font-medium">
            Prescription Header
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Upload Prescription Header"
              value={prescriptionHeader}
              onChange={(e) => setPrescriptionHeader(e.target.value)}
              className="flex-1 h-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
            <Button
              onClick={() => handleFileUpload("prescription-header")}
              className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full p-0"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleView("prescription-header")}
              variant="outline"
              className="px-4 py-2 h-10 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm"
            >
              View
            </Button>
          </div>
        </div>

        {/* Report Header */}
        <div className="space-y-2">
          <Label className="text-sm text-blue-500 font-medium">
            Report Header
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Upload Report Header"
              value={reportHeader}
              onChange={(e) => setReportHeader(e.target.value)}
              className="flex-1 h-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
            <Button
              onClick={() => handleFileUpload("report-header")}
              className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full p-0"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleView("report-header")}
              variant="outline"
              className="px-4 py-2 h-10 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm"
            >
              View
            </Button>
          </div>
        </div>

        {/* Appointment Summary */}
        <div className="space-y-2">
          <Label className="text-sm text-blue-500 font-medium">
            Appointment Summary
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Upload Appointment Summary"
              value={appointmentSummary}
              onChange={(e) => setAppointmentSummary(e.target.value)}
              className="flex-1 h-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
            <Button
              onClick={() => handleFileUpload("appointment-summary")}
              className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full p-0"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleView("appointment-summary")}
              variant="outline"
              className="px-4 py-2 h-10 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm"
            >
              View
            </Button>
          </div>
        </div>

        {/* Prescription Footer */}
        <div className="space-y-2">
          <Label className="text-sm text-blue-500 font-medium">
            Prescription Footer
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Upload Footer"
              value={prescriptionFooter}
              onChange={(e) => setPrescriptionFooter(e.target.value)}
              className="flex-1 h-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
            <Button
              onClick={() => handleFileUpload("prescription-footer")}
              className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full p-0"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleView("prescription-footer")}
              variant="outline"
              className="px-4 py-2 h-10 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm"
            >
              View
            </Button>
          </div>
        </div>

        {/* Paper Size and Margin */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm text-blue-500 font-medium">
              Paper Size
            </Label>
            <Input
              placeholder="Paper Size"
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              className="h-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-blue-500 font-medium">Margin</Label>
            <Input
              placeholder="Margin"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              className="h-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
