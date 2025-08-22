"use client";

import { useState } from "react";
import { useEffect } from "react";
import { medicalRecordsAPI, prescriptionsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Plus,
  ArrowRight,
  FileText,
  TestTube,
  Stethoscope,
  X,
} from "lucide-react";

const diagnosticReports = [
  {
    id: 1,
    title: "Lab Tests & Screenings",
    subtitle: "Track your latest lab",
    icon: TestTube,
    bgColor: "bg-gradient-to-br from-red-400 to-yellow-400",
    iconBg: "bg-white/20",
  },
  {
    id: 2,
    title: "Medical Operations",
    subtitle: "Your operations, all in one place",
    icon: Stethoscope,
    bgColor: "bg-gradient-to-br from-blue-400 to-cyan-400",
    iconBg: "bg-white/20",
  },
  {
    id: 3,
    title: "X-Rays",
    subtitle: "Detailed bone and tissue scan results",
    icon: FileText,
    bgColor: "bg-gradient-to-br from-green-400 to-teal-400",
    iconBg: "bg-white/20",
  },
];

const getUrgencyBadge = (urgency: string) => {
  switch (urgency) {
    case "urgent":
      return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
    case "after-meal":
      return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    case "daily":
      return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
    case "take-when-needed":
      return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
    default:
      return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
  }
};

const getUrgencyText = (urgency: string) => {
  switch (urgency) {
    case "urgent":
      return "Urgent";
    case "after-meal":
      return "After meal";
    case "daily":
      return "Daily";
    case "take-when-needed":
      return "Take When Needed";
    default:
      return urgency;
  }
};

export function MedicalRecordContent() {
  const router = useRouter();
  const [recentPrescriptions, setRecentPrescriptions] = useState<any[]>([]);
  const [pastPrescriptions, setPastPrescriptions] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMedicalData();
  }, []);

  const fetchMedicalData = async () => {
    try {
      const [prescriptionsResponse, recordsResponse] = await Promise.all([
        prescriptionsAPI.getPrescriptions({ status: 'active' }),
        medicalRecordsAPI.getMedicalRecords()
      ]);

      const prescriptions = prescriptionsResponse.data.data.prescriptions;
      const records = recordsResponse.data.data.records;

      // Separate recent and past prescriptions
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recent = prescriptions.filter((p: any) => 
        new Date(p.createdAt) > thirtyDaysAgo
      );
      const past = prescriptions.filter((p: any) => 
        new Date(p.createdAt) <= thirtyDaysAgo
      );

      setRecentPrescriptions(recent);
      setPastPrescriptions(past);
      setMedicalRecords(records);
    } catch (error) {
      console.error('Failed to fetch medical data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleXRayClick = () => {
    router.push("/medical-record/xray-list/1");
  };

  const handleBloodTestClick = () => {
    router.push("/medical-record/blood-list/1");
  };

  const handleAddNewPrescription = () => {
    // This would open a prescription modal or navigate to prescription creation
    toast({
      title: "Info",
      description: "Prescription creation is available during consultations",
    });
  };

  const handleAddNewAnalysis = () => {
    // This would open an analysis creation modal
    toast({
      title: "Info",
      description: "Analysis requests are available during consultations",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-500 mb-1">
            Medical record
          </h1>
          <p className="text-gray-600">
            Mokhtar Amine Ghannouchi{" "}
            <span className="text-gray-400">#P-00016</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            onClick={handleAddNewPrescription}
          >
            Add new prescription
          </Button>
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
            onClick={handleAddNewAnalysis}
          >
            <span>Add new Analysis</span>
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="w-10 h-10 rounded-full border-gray-200 hover:bg-gray-50 p-0"
          >
            <ArrowRight className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Recent Prescriptions */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-pink-500">
              Recent prescriptions
            </h2>
          </div>
          <Button
            variant="ghost"
            className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1"
          >
            <span>See more</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search keywords"
              className="pl-10 bg-white border border-gray-200 focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg h-10"
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2"
          >
            <span className="text-sm">Show all</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Prescription Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : recentPrescriptions.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No recent prescriptions found
            </div>
          ) : (
            recentPrescriptions.map((prescription) => (
            <div
              key={prescription._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div
                className="bg-blue-500 text-white px-4 py-3 text-base font-medium text-center"
              >
                {prescription.medications?.[0]?.name || 'Prescription'}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    Notes:
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {prescription.medications?.[0]?.instructions || 'Take as prescribed'}
                  </p>
                </div>
                <hr />
                {prescription.medications?.[0]?.timing?.beforeBreakfast && (
                  <div className="text-sm text-blue-600 font-medium">
                    Before Breakfast
                  </div>
                )}

                <div className="space-y-1 text-sm text-gray-600">
                  <div>From {new Date(prescription.medications?.[0]?.duration?.startDate).toLocaleDateString()}</div>
                  <div>To {new Date(prescription.medications?.[0]?.duration?.endDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Urgent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">After meal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Daily</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Take When Needed</span>
          </div>
        </div>
      </div>

      {/* Past Prescriptions */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-semibold text-pink-500">
              Past prescriptions
            </h2>
          </div>
          <Button
            variant="ghost"
            className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1"
          >
            <span>See more</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search keywords"
              className="pl-10 bg-white border border-gray-200 focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg h-10"
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2"
          >
            <span className="text-sm">Show all</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Past Prescription Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {pastPrescriptions.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No past prescriptions found
            </div>
          ) : (
            pastPrescriptions.map((prescription) => (
            <div
              key={prescription._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div
                className="bg-gray-500 text-white px-4 py-3 text-base font-medium text-center"
              >
                {prescription.medications?.[0]?.name || 'Prescription'}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    Notes:
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {prescription.medications?.[0]?.instructions || 'Take as prescribed'}
                  </p>
                </div>

                {prescription.medications?.[0]?.timing?.beforeBreakfast && (
                  <div className="text-sm text-blue-600 font-medium">
                    Before Breakfast
                  </div>
                )}
                <hr />
                <div className="space-y-1 text-sm text-gray-600">
                  <div>From {new Date(prescription.medications?.[0]?.duration?.startDate).toLocaleDateString()}</div>
                  <div>To {new Date(prescription.medications?.[0]?.duration?.endDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Urgent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">After meal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Daily</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Take When Needed</span>
          </div>
        </div>
      </div>

      {/* Diagnostic Reports */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-pink-500">
            Diagnostic Reports
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {diagnosticReports.map((report) => (
            <div
              key={report.id}
              onClick={
                report.id === 3
                  ? handleXRayClick
                  : report.id === 1
                  ? handleBloodTestClick
                  : undefined
              }
              className={`${report.bgColor} rounded-2xl p-6 text-white relative overflow-hidden`}
            >
              <div className="relative z-10">
                <div
                  className={`w-16 h-16 ${report.iconBg} rounded-2xl flex items-center justify-center mb-4`}
                >
                  <report.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                <p className="text-sm text-white/90 mb-4">{report.subtitle}</p>
                <Button
                  variant="ghost"
                  onClick={
                    report.id === 3
                      ? handleXRayClick
                      : report.id === 1
                      ? handleBloodTestClick
                      : undefined
                  }
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full p-0 text-white"
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-4 right-8 w-12 h-12 bg-white/10 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}