"use client";

import { useState, useEffect } from "react";
import { doctorsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, QrCode, Plus, Star, MapPin, Clock } from "lucide-react";
import { BookAppointmentModal } from "./BookAppointmentModal";

const specialties = [
  "All Specialties",
  "Dentist",
  "Cardiologist",
  "Neurologist",
  "Pediatrician",
  "Orthopedic Surgeon",
  "Dermatologist",
  "General Practitioner",
];

export function DoctorsDirectoryContent() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsData, setDoctorsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDoctors();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSpecialty, showAvailableOnly]);

  const fetchDoctors = async () => {
    try {
      setError(null);
      const params: any = {};
      
      if (searchTerm) params.search = searchTerm;
      if (selectedSpecialty !== "All Specialties") params.specialization = selectedSpecialty;
      
      const response = await doctorsAPI.searchDoctors(params);
      const doctors = response.data.data.doctors;
      
      // Transform data to match component expectations
      const transformedDoctors = doctors.map((doctor: any) => ({
        id: doctor._id,
        name: `Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`,
        specialty: doctor.specialization,
        avatar: doctor.user?.avatar || "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
        rating: doctor.rating?.average || 0,
        reviewCount: doctor.rating?.count || 0,
        location: doctor.clinicInfo?.name || "Medical Center",
        experience: `${doctor.experience} years`,
        availableSlots: Math.floor(Math.random() * 20), // This would need to be calculated from actual availability
        nextAvailable: "Today 2:00 PM", // This would need to be calculated from working hours
        isOnline: Math.random() > 0.5, // This would come from real-time status
        consultationFee: `TND ${doctor.consultationFee}`,
        languages: ["Arabic", "French", "English"], // This would come from doctor profile
        education: doctor.education?.[0]?.institution || "Medical University",
        specializations: doctor.subSpecializations || [doctor.specialization]
      }));
      
      setDoctorsData(transformedDoctors);
    } catch (error: any) {
      console.error('Failed to fetch doctors:', error);
      setError('Failed to load doctors');
      toast({
        title: "Error",
        description: "Failed to fetch doctors",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDoctors = doctorsData.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "All Specialties" ||
      doctor.specialty === selectedSpecialty;
    const matchesAvailability = !showAvailableOnly || doctor.isOnline;

    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  const handleBookAppointment = (doctor: any) => {
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-pink-500">Doctors</h1>
            <p className="text-gray-600">
              Find and connect with healthcare professionals
            </p>
          </div>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2">
          <QrCode className="w-4 h-4" />
          <span>Scan a QR code</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mb-6">
            <p className="text-red-600 text-sm">{error}</p>
            <Button 
              onClick={fetchDoctors}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </Button>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          {/* Search */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border border-gray-200 focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg h-12"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            {/* Specialty Filter */}
            <Select
              value={selectedSpecialty}
              onValueChange={setSelectedSpecialty}
            >
              <SelectTrigger className="w-48 h-12 border-gray-200 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Show Available Only Toggle */}
            <div className="flex items-center space-x-3 bg-white px-4 py-3 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-700">Show available only</span>
              <Switch
                checked={showAvailableOnly}
                onCheckedChange={setShowAvailableOnly}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Doctors List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No doctors found matching your criteria
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                {/* Doctor Info */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={doctor.avatar} />
                      <AvatarFallback>
                        {doctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {doctor.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {doctor.name}
                      </h3>
                      <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-full text-xs">
                        {doctor.specialty}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      {/* Rating */}
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-700">
                          Doctor rating
                        </span>
                        <div className="flex items-center space-x-1">
                          {renderStars(doctor.rating)}
                          <span className="text-sm text-gray-600 ml-1">
                            ({doctor.reviewCount})
                          </span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{doctor.location}</span>
                      </div>

                      {/* Experience */}
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{doctor.experience} experience</span>
                      </div>
                    </div>

                    {/* Overall booked appointments progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          Overall booked appointments
                        </span>
                        <span className="text-sm text-gray-600">
                          {doctor.availableSlots}/20
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(doctor.availableSlots / 20) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Fee: {doctor.consultationFee}</span>
                      <span>Next: {doctor.nextAvailable}</span>
                      <span>Languages: {doctor.languages.join(", ")}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex flex-col items-end space-y-2">
                  <Button
                    onClick={() => handleBookAppointment(doctor)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Make an appointment</span>
                  </Button>
                  {doctor.isOnline && (
                    <Badge className="bg-green-100 text-green-600 hover:bg-green-100 px-2 py-1 rounded-full text-xs">
                      Available now
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 rounded-full border-gray-200 text-gray-600 hover:bg-gray-50 p-0"
            disabled={currentPage === 1}
          >
            ‹
          </Button>

          {[1, 2, 3, 4, 5].map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full p-0 ${
                currentPage === page
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 rounded-full border-gray-200 text-gray-600 hover:bg-gray-50 p-0"
            disabled={currentPage === 5}
          >
            ›
          </Button>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        doctor={selectedDoctor}
      />
    </div>
  );
}
