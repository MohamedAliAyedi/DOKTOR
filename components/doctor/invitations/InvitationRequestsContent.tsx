"use client";

import { useState } from "react";
import { useEffect } from "react";
import { patientsAPI, doctorsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Search, ChevronDown, X, Check, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ValidationRequestModal } from "./ValidationRequestModal";

export function InvitationRequestsContent() {
  const [selectedFilter, setSelectedFilter] = useState("All requests");
  const [searchTerm, setSearchTerm] = useState("");
  const [invitationRequests, setInvitationRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    id: number;
    name: string;
    action: "accept" | "decline";
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingConnections();
  }, []);

  const fetchPendingConnections = async () => {
    try {
      const response = await doctorsAPI.getDoctorPatients();
      const pendingPatients = response.data.data.patients.filter(
        (p: any) => p.status === 'pending'
      );
      setInvitationRequests(pendingPatients);
    } catch (error) {
      console.error('Failed to fetch pending connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = (id: number, name: string) => {
    setSelectedRequest({ id, name, action: "accept" });
    setModalOpen(true);
  };

  const handleReject = (id: number, name: string) => {
    setSelectedRequest({ id, name, action: "decline" });
    setModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (selectedRequest) {
      try {
        if (selectedRequest.action === 'accept') {
          await patientsAPI.acceptPatientConnection(selectedRequest.id.toString());
          toast({
            title: "Success",
            description: "Patient connection accepted",
          });
        } else {
          await patientsAPI.disconnectPatient(selectedRequest.id.toString());
          toast({
            title: "Success",
            description: "Patient connection declined",
          });
        }
        
        // Refresh the list
        fetchPendingConnections();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to update connection",
          variant: "destructive",
        });
      }
    }
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-secondary">
          Invitation requests
        </h1>
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

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center space-x-2 bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2"
              >
                <span className="text-sm">{selectedFilter}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-2">
                <div className="flex items-center space-x-2 p-2 text-sm text-gray-700">
                  <span>All requests</span>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="text-sm font-medium text-gray-900 px-2">
                    Today
                  </div>
                  <div className="text-sm font-medium text-gray-900 px-2">
                    This week
                  </div>
                  <div className="text-sm font-medium text-gray-900 px-2">
                    This month
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 py-3 px-4 text-sm font-medium text-gray-500 border-b border-gray-200">
          <div>Name</div>
          <div>Date</div>
          <div>Message</div>
          <div className="text-center">Action</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-2 mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : invitationRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending invitation requests
            </div>
          ) : (
            invitationRequests.map((request) => (
            <div
              key={request.patient._id}
              className="grid grid-cols-4 gap-4 py-4 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center"
            >
              {/* Name */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={request.patient.user?.avatar} />
                  <AvatarFallback>
                    {request.patient.user?.firstName?.[0]}{request.patient.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {request.patient.user?.firstName} {request.patient.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">See patient profile</p>
                </div>
              </div>

              {/* Date */}
              <div className="text-sm text-gray-600">
                <div>{new Date(request.connectedAt).toLocaleDateString()}</div>
                <div className="text-xs text-gray-500">
                  {new Date(request.connectedAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="text-sm text-gray-600 pr-4">
                Connection request from patient
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-2">
                <Button
                  onClick={() => handleReject(request.patient._id, `${request.patient.user?.firstName} ${request.patient.user?.lastName}`)}
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 rounded-full border-red-200 text-red-500 hover:bg-red-50 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleAccept(request.patient._id, `${request.patient.user?.firstName} ${request.patient.user?.lastName}`)}
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 rounded-full border-green-200 text-green-500 hover:bg-green-50 p-0"
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* Validation Modal */}
      <ValidationRequestModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        patientName={selectedRequest?.name}
        accepted={selectedRequest?.action === "accept"}
      />
    </div>
  );
}