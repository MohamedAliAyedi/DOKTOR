"use client";

import { useState, useEffect } from "react";
import { consultationsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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

export function ConsultationHistoryContent() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [duration, setDuration] = useState("Duration");
  const [age, setAge] = useState("Age");
  const [gender, setGender] = useState("Gender");
  const [tableView, setTableView] = useState("Table view");
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchConsultations();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, duration, age, gender]);

  const fetchConsultations = async () => {
    try {
      setError(null);
      const params: any = {};

      if (searchTerm) params.search = searchTerm;
      if (duration !== "Duration") {
        // Add duration filter logic
        const durationMap: any = {
          "30min": { duration: 30 },
          "45min": { duration: 45 },
          "60min": { duration: 60 }
        };
        if (durationMap[duration]) {
          Object.assign(params, durationMap[duration]);
        }
      }

      const response = await consultationsAPI.getConsultations(params);
      setConsultations(response.data.data.consultations || []);
    } catch (error) {
      console.error("Failed to fetch consultations:", error);
      setError("Failed to load consultations");
      setConsultations([]);
      toast({
        title: "Error",
        description: "Failed to fetch consultations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewConsultation = () => {
    toast({
      title: "Info",
      description: "New consultations are created from appointments",
    });
  };

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
              {
                consultations.filter((c) => {
                  const consultDate = new Date(c.createdAt);
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  return consultDate >= yesterday;
                }).length
              }{" "}
              New consultations were added recently
            </p>
          </div>
        </div>
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
          onClick={handleAddNewConsultation}
        >
          <span>Add new consultation</span>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mb-6">
            <p className="text-red-600 text-sm">{error}</p>
            <Button
              onClick={fetchConsultations}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </Button>
          </div>
        )}

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
          <div>Doctor</div>
          <div>Date</div>
          <div>Time</div>
          <div>Duration</div>
          <div>Consultation report</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-1 mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No consultations found
            </div>
          ) : (
            consultations.map((consultation) => (
            <div
              key={consultation._id}
              className="grid grid-cols-5 gap-4 py-4 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center"
            >
              {/* Doctor */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={consultation.doctor?.user?.avatar} />
                  <AvatarFallback>
                    {consultation.doctor?.user?.firstName?.[0]}
                    {consultation.doctor?.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    Dr. {consultation.doctor?.user?.firstName} {consultation.doctor?.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {consultation.doctor?.specialization}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="text-sm text-gray-600">
                {new Date(consultation.startTime).toLocaleDateString()}
              </div>

              {/* Time */}
              <div className="text-sm text-gray-600">
                {new Date(consultation.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {/* Duration */}
              <div className="text-sm text-gray-600">
                {consultation.duration || 0} min
              </div>

              {/* Consultation Report */}
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-blue-500 hover:bg-blue-50"
                  onClick={() =>
                    window.open(`/doctor/consultation/report/${consultation._id}`, "_blank")
                  }
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
