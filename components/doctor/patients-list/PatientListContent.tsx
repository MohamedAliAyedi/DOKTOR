"use client";

import { useState, useEffect } from "react";
import { patientsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Search, ChevronDown, UserPlus, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NewPatientModal } from "./NewPatientModal";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PatientListContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("Age");
  const [genderFilter, setGenderFilter] = useState("Gender");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPatients();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, ageFilter, genderFilter]);

  const fetchPatients = async () => {
    try {
      setError(null);
      const params: any = {};

      if (searchTerm) params.search = searchTerm;
      if (ageFilter !== "Age") {
        const [min, max] = ageFilter
          .split("-")
          .map((a) => parseInt(a.replace("+", "")));
        if (min) params.ageMin = min;
        if (max) params.ageMax = max;
      }
      if (genderFilter !== "Gender") params.gender = genderFilter.toLowerCase();

      const response = await patientsAPI.getPatients(params);
      const patientsData = response.data.data.patients || [];

      // Transform data to match component expectations
      const transformedPatients = patientsData.map((patient: any) => ({
        id: patient._id,
        name: `${patient.user?.firstName} ${patient.user?.lastName}`,
        avatar:
          patient.user?.avatar ||
          "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
        age: patient.age || "N/A",
        visits: 0, // You might want to calculate this from appointments
        joinDate: new Date(patient.createdAt).toLocaleDateString(),
        lastVisit: new Date(patient.updatedAt).toLocaleDateString(),
        patientId: patient.patientId,
      }));

      setPatients(transformedPatients);
    } catch (error: any) {
      console.error("Failed to fetch patients:", error);
      setError("Failed to load patients");
      setPatients([]); // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientClick = (id: number) => {
    router.push(`/doctor/dashboard/patient-profile/${id}`);
  };

  const handleNewPatientAdded = () => {
    fetchPatients(); // Refresh the list
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary flex items-center space-x-2">
              <span>Patient List</span>
              <Badge className="bg-blue-500 hover:bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                Total {patients.length}
              </Badge>
            </h1>
            <p className="text-sm text-gray-500">
              {
                patients.filter((p) => {
                  const joinDate = new Date(p.joinDate);
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  return joinDate >= yesterday;
                }).length
              }{" "}
              New patients were added recently
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add a new patient</span>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
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

          {/* Filter Buttons */}
          <div className="flex items-center space-x-4">
            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="w-32 h-10 border-gray-200 rounded-lg text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Age">Age</SelectItem>
                <SelectItem value="0-18">0-18</SelectItem>
                <SelectItem value="19-35">19-35</SelectItem>
                <SelectItem value="36-60">36-60</SelectItem>
                <SelectItem value="60+">60+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-28 h-10 border-gray-200 rounded-lg text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gender">Gender</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2"
            >
              <span className="text-sm">Table view</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 py-3 px-4 text-sm font-medium text-gray-500 border-b border-gray-200">
          <div>List Of Patients</div>
          <div>Age</div>
          <div>Visit</div>
          <div>Join Since</div>
          <div>Last visit</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-2 mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
              <Button
                onClick={fetchPatients}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Retry
              </Button>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No patients found
            </div>
          ) : (
            patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handlePatientClick(patient.id)}
                className="grid grid-cols-5 gap-4 py-4 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center cursor-pointer"
              >
                {/* Patient */}
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={patient.avatar} />
                    <AvatarFallback>
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {patient.name}
                    </p>
                    <p className="text-xs text-gray-500">See patient profile</p>
                  </div>
                </div>

                {/* Age */}
                <div className="text-sm text-gray-600">{patient.age}</div>

                {/* Visits */}
                <div className="text-sm text-gray-600">{patient.visits}</div>

                {/* Join Date */}
                <div className="text-sm text-gray-600">{patient.joinDate}</div>

                {/* Last Visit */}
                <div className="text-sm text-gray-600">{patient.lastVisit}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Patient Modal */}
      <NewPatientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          handleNewPatientAdded();
        }}
      />
    </div>
  );
}
