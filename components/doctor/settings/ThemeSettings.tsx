"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";

export function ThemeSettings() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logoFile, setLogoFile] = useState("");
  const [prescriptionHeader, setPrescriptionHeader] = useState("");
  const [reportHeader, setReportHeader] = useState("");
  const [appointmentSummary, setAppointmentSummary] = useState("");
  const [prescriptionFooter, setPrescriptionFooter] = useState("");
  const [paperSize, setPaperSize] = useState("A4");
  const [margin, setMargin] = useState("2cm");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.preferences?.theme) {
      const theme = user.preferences.theme;
      setIsDarkMode(theme.darkMode || false);
      setPaperSize(theme.paperSize || "A4");
      setMargin(theme.margin || "2cm");
    }
  }, [user]);

  const handleFileUpload = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In a real app, you would upload the file to a server
        // For now, just show success message
        toast({
          title: "Success",
          description: `${type} uploaded successfully`,
        });
        
        // Update the respective field
        switch (type) {
          case 'logo':
            setLogoFile(file.name);
            break;
          case 'prescription-header':
            setPrescriptionHeader(file.name);
            break;
          case 'report-header':
            setReportHeader(file.name);
            break;
          case 'appointment-summary':
            setAppointmentSummary(file.name);
            break;
          case 'prescription-footer':
            setPrescriptionFooter(file.name);
            break;
        }
      }
    };
    input.click();
  };

  const handleView = (type: string) => {
    toast({
      title: "Info",
      description: `${type} preview will be available soon`,
    });
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        preferences: {
          ...user?.preferences,
          theme: {
            darkMode: isDarkMode,
            paperSize,
            margin,
            customBranding: {
              logo: logoFile,
              prescriptionHeader,
              reportHeader,
              appointmentSummary,
              prescriptionFooter
            }
          }
        }
      });

      toast({
        title: "Success",
        description: "Theme settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update theme settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-pink-500">Theme settings</h2>

      {/* Theme Selection */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-pink-500">Theme Selection</h3>
        <div className="flex items-center justify-between max-w-xs">
          <span className="text-sm text-gray-700">Dark Mode</span>
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
              {logoFile ? (
                <span className="text-white text-xs text-center">Logo uploaded</span>
              ) : (
                <span className="text-white text-xs text-center">No logo uploaded</span>
              )}
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