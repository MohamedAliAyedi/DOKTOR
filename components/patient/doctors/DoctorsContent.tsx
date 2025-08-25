"use client";

import { useState } from "react";
import { useEffect } from "react";
import { doctorsAPI, patientsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  QrCode,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Calendar,
} from "lucide-react";

export function DoctorsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("Speciality");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyDoctors();
  }, []);

  const fetchMyDoctors = async () => {
    try {
      setError(null);
      const response = await patientsAPI.getPatientDoctors();
      const connectedDoctors = response.data.data.doctors
        .filter((d: any) => d.status === "active")
        .map((d: any) => ({
          ...d.doctor,
          connectedAt: d.connectedAt,
          isPrimary: d.isPrimary,
        }));
      setDoctors(connectedDoctors);
    } catch (error) {
      console.error("Failed to fetch connected doctors:", error);
      setError("Failed to load connected doctors");
      toast({
        title: "Error",
        description: "Failed to load your connected doctors",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectDoctor = async (doctorId: string) => {
    try {
      await doctorsAPI.disconnectFromDoctor(doctorId);
      toast({
        title: "Success",
        description: "Disconnected from doctor successfully",
      });
      fetchMyDoctors();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to disconnect",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <div key={i} className="w-2 h-2 bg-green-500 rounded-sm"></div>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="w-2 h-2 bg-green-300 rounded-sm"></div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <div
          key={`empty-${i}`}
          className="w-2 h-2 bg-gray-300 rounded-sm"
        ></div>
      );
    }

    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-secondary">My doctors</h1>
        </div>
        <Button
          variant="outline"
          className="border-blue-500 text-blue-500 hover:bg-blue-50 rounded-lg px-4 py-2 flex items-center space-x-2"
        >
          <span>Scan a QR code</span>
          <QrCode className="w-4 h-4" />
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search keywords"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border border-gray-200 focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg h-10"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-32 h-10 border-gray-200 rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
              <SelectItem value="Speciality">Speciality</SelectItem>
              <SelectItem value="Dentist">Dentist</SelectItem>
              <SelectItem value="Cardiologist">Cardiologist</SelectItem>
              <SelectItem value="Dermatologist">Dermatologist</SelectItem>
              <SelectItem value="Neurologist">Neurologist</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show available only</span>
            <Switch
              checked={showAvailableOnly}
              onCheckedChange={setShowAvailableOnly}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No connected doctors found
          </div>
        ) : (
          doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Doctor Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={doctor.user?.avatar} />
                      <AvatarFallback>
                        {doctor.user?.firstName?.[0]}
                        {doctor.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {doctor.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {doctor.specialization}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
                  onClick={() =>
                    window.open(`tel:${doctor.user?.phoneNumber}`, "_self")
                  }
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-xs text-gray-600">Doctor rating</span>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(doctor.rating?.average || 0)}
                </div>
              </div>

              {/* Available Time */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">Available time</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {doctor.workingHours?.monday?.start} -{" "}
                  {doctor.workingHours?.monday?.end}
                </p>
              </div>

              {/* Location */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    Location Practical
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {doctor.clinicInfo?.name || "Medical Center"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 rounded-lg h-10 flex items-center justify-center space-x-2"
                  onClick={() =>
                    window.open(`/chat?doctor=${doctor._id}`, "_blank")
                  }
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10 flex items-center justify-center space-x-2"
                  onClick={() =>
                    window.open(
                      `/patient/appointments?doctor=${doctor._id}`,
                      "_blank"
                    )
                  }
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book</span>
                </Button>
              </div>

              {/* Disconnect Button */}
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-red-200 text-red-500 hover:bg-red-50 rounded-lg h-8 text-xs"
                  onClick={() => handleDisconnectDoctor(doctor._id)}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 p-0"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        >
          ‹
        </Button>

        {[1, 2, 3, 4, 5].map((page) => (
          <Button
            key={page}
            variant="ghost"
            size="sm"
            className={`w-8 h-8 rounded-full p-0 ${
              currentPage === page
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 p-0"
          onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
        >
          ›
        </Button>
      </div>
    </div>
  );
}
