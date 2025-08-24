"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { medicalRecordsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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

const filterButtons = [
  { label: "Blood", active: true },
  { label: "Urine", active: false },
  { label: "HIV Test", active: false },
  { label: "Cortisol Test", active: false },
  { label: "Iron Panel", active: false },
];

export function BloodListContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState("Blood");
  const [searchTerm, setSearchTerm] = useState("");
  const [duration, setDuration] = useState("Show all");
  const [bloodData, setBloodData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBloodTestRecords();
  }, [activeFilter, searchTerm, duration]);

  const fetchBloodTestRecords = async () => {
    try {
      setError(null);
      const params: any = {
        testType: activeFilter !== "Blood" ? activeFilter : undefined
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await medicalRecordsAPI.getBloodTestRecords(params);
      const records = response.data.data.records;
      
      // Transform data to match component expectations
      const transformedData = records.map((record: any) => ({
        id: record._id,
        type: record.labResults?.testName || 'Blood Test',
        doctorName: `${record.doctor?.user?.firstName} ${record.doctor?.user?.lastName}`,
        date: new Date(record.createdAt).toLocaleDateString(),
        reason: record.title || 'Blood analysis',
        prescription: record.labResults?.recommendations || 'See report for details'
      }));
      
      setBloodData(transformedData);
    } catch (error: any) {
      console.error('Failed to fetch blood test records:', error);
      setError('Failed to load blood test records');
      toast({
        title: "Error",
        description: "Failed to fetch blood test records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBloodTestClick = (id: number) => {
    router.push(`/medical-record/blood-results/${id}`);
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
            <h1 className="text-2xl font-bold text-pink-500">
              Analysis Reports
            </h1>
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mb-6">
            <p className="text-red-600 text-sm">{error}</p>
            <Button 
              onClick={fetchBloodTestRecords}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </Button>
          </div>
        )}
        
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
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : bloodData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No blood test records found
            </div>
          ) : (
            bloodData.map((blood) => (
            <div
              key={blood.id}
              onClick={() => handleBloodTestClick(blood.id)}
              className="grid grid-cols-6 gap-4 py-4 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center cursor-pointer"
            >
              {/* Blood Test Type */}
              <div className="text-sm text-gray-900 font-medium">
                {blood.type}
              </div>

              {/* Doctor Name */}
              <div className="text-sm text-gray-600">{blood.doctorName}</div>

              {/* Date */}
              <div className="text-sm text-gray-600">{blood.date}</div>

              {/* Reason */}
              <div className="text-sm text-blue-500">{blood.reason}</div>

              {/* Prescription */}
              <div className="text-sm text-gray-600">{blood.prescription}</div>

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
          ))
          )}
        </div>
      </div>
    </div>
  );
}
