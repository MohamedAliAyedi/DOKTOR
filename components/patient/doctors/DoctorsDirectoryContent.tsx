"use client";

import { useState } from "react";
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

const doctorsData = [
  {
    id: 1,
    name: "Dr. Charlie Wise",
    specialty: "Dentist",
    avatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    rating: 4.8,
    reviewCount: 156,
    location: "Downtown Medical Center",
    experience: "8 years",
    availableSlots: 12,
    nextAvailable: "Today 2:00 PM",
    isOnline: true,
    consultationFee: "TND 75",
    languages: ["English", "French", "Arabic"],
    education: "Harvard Medical School",
    specializations: [
      "General Dentistry",
      "Cosmetic Dentistry",
      "Oral Surgery",
    ],
  },
  {
    id: 2,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    avatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    rating: 4.9,
    reviewCount: 203,
    location: "Heart Care Clinic",
    experience: "12 years",
    availableSlots: 8,
    nextAvailable: "Tomorrow 9:00 AM",
    isOnline: false,
    consultationFee: "TND 120",
    languages: ["English", "Arabic"],
    education: "Johns Hopkins University",
    specializations: [
      "Interventional Cardiology",
      "Heart Surgery",
      "Preventive Cardiology",
    ],
  },
  {
    id: 3,
    name: "Dr. Ahmed Hassan",
    specialty: "Neurologist",
    avatar:
      "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    rating: 4.7,
    reviewCount: 89,
    location: "Neurology Institute",
    experience: "15 years",
    availableSlots: 5,
    nextAvailable: "Monday 10:00 AM",
    isOnline: true,
    consultationFee: "TND 150",
    languages: ["Arabic", "French", "English"],
    education: "University of Tunis",
    specializations: ["Epilepsy", "Stroke Care", "Movement Disorders"],
  },
  {
    id: 4,
    name: "Dr. Fatima Ali",
    specialty: "Pediatrician",
    avatar:
      "https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    rating: 4.9,
    reviewCount: 312,
    location: "Children's Hospital",
    experience: "10 years",
    availableSlots: 15,
    nextAvailable: "Today 4:00 PM",
    isOnline: true,
    consultationFee: "TND 80",
    languages: ["Arabic", "English"],
    education: "Cairo University",
    specializations: ["Newborn Care", "Child Development", "Vaccination"],
  },
  {
    id: 5,
    name: "Dr. Michael Brown",
    specialty: "Orthopedic Surgeon",
    avatar:
      "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    rating: 4.6,
    reviewCount: 178,
    location: "Orthopedic Center",
    experience: "18 years",
    availableSlots: 3,
    nextAvailable: "Wednesday 11:00 AM",
    isOnline: false,
    consultationFee: "TND 200",
    languages: ["English", "French"],
    education: "Stanford Medical School",
    specializations: ["Joint Replacement", "Sports Medicine", "Trauma Surgery"],
  },
  {
    id: 6,
    name: "Dr. Leila Mansouri",
    specialty: "Dermatologist",
    avatar:
      "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    rating: 4.8,
    reviewCount: 145,
    location: "Skin Care Clinic",
    experience: "9 years",
    availableSlots: 7,
    nextAvailable: "Tomorrow 3:00 PM",
    isOnline: true,
    consultationFee: "TND 90",
    languages: ["Arabic", "French", "English"],
    education: "University of Monastir",
    specializations: ["Acne Treatment", "Skin Cancer", "Cosmetic Dermatology"],
  },
  {
    id: 7,
    name: "Dr. Omar Trabelsi",
    specialty: "General Practitioner",
    avatar:
      "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
    rating: 4.5,
    reviewCount: 267,
    location: "Family Health Center",
    experience: "14 years",
    availableSlots: 20,
    nextAvailable: "Today 1:00 PM",
    isOnline: true,
    consultationFee: "TND 60",
    languages: ["Arabic", "French"],
    education: "University of Sfax",
    specializations: [
      "Family Medicine",
      "Preventive Care",
      "Chronic Disease Management",
    ],
  },
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
          {filteredDoctors.map((doctor) => (
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
          ))}
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
