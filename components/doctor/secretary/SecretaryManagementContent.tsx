"use client";

import { useState } from "react";
import { useEffect } from "react";
import { secretariesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCog, MoreHorizontal, Trash2, Edit, UserPlus } from "lucide-react";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return (
        <Badge className="bg-green-500 hover:bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Active
        </Badge>
      );
    case "Inactive":
      return (
        <Badge className="bg-gray-400 hover:bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-medium">
          Inactive
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-500 hover:bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          {status}
        </Badge>
      );
  }
};

const getPaymentBadge = (paymentStatus: string) => {
  switch (paymentStatus) {
    case "Paid":
      return (
        <Badge className="bg-green-500 hover:bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Paid
        </Badge>
      );
    case "Unpaid":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Unpaid
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-500 hover:bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          {paymentStatus}
        </Badge>
      );
  }
};

export function SecretaryManagementContent() {
  const [secretaries, setSecretaries] = useState<any[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [secretaryToDelete, setSecretaryToDelete] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchSecretaries();
  }, []);

  const fetchSecretaries = async () => {
    try {
      const response = await secretariesAPI.getSecretaries();
      setSecretaries(response.data.data.secretaries || []);
    } catch (error) {
      console.error('Failed to fetch secretaries:', error);
      setSecretaries([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSecretaryToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (secretaryToDelete) {
      try {
        await secretariesAPI.removeSecretary(secretaryToDelete.toString());
        toast({
          title: "Success",
          description: "Secretary removed successfully",
        });
        fetchSecretaries();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to remove secretary",
          variant: "destructive",
        });
      }
    }
    setDeleteModalOpen(false);
    setSecretaryToDelete(null);
  };

  const handleEdit = (id: number) => {
    router.push(`/doctor/dashboard/secretary/profile/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
            <UserCog className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-secondary">
                Secretary List
              </h1>
              <Badge className="bg-blue-500 hover:bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Total 3
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              Here is the performance of each secretary
            </p>
          </div>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2">
          <span>Add a new patient</span>
          <UserPlus className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 py-3 px-4 text-sm font-medium text-gray-500 border-b border-gray-200">
          <div>Name</div>
          <div>Join Since</div>
          <div>Salary</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-1 mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : secretaries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No secretaries found
            </div>
          ) : (
            secretaries.map((secretary) => (
            <div
              key={secretary._id}
              className="grid grid-cols-5 gap-4 py-4 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center"
            >
              {/* Name */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={secretary.user?.avatar} />
                  <AvatarFallback>
                    {secretary.user?.firstName?.[0]}{secretary.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {secretary.user?.firstName} {secretary.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{secretary.jobTitle}</p>
                </div>
              </div>

              {/* Join Since */}
              <div className="text-sm text-gray-600">
                {new Date(secretary.hireDate).toLocaleDateString()}
              </div>

              {/* Salary */}
              <div className="text-sm text-gray-900 font-medium">
                {secretary.salary?.currency} {secretary.salary?.amount}
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                {getStatusBadge(secretary.isActive ? "Active" : "Inactive")}
                {getPaymentBadge("Paid")} {/* You might want to add payment tracking */}
              </div>

              {/* Action */}
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-gray-500 hover:bg-gray-100"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white border border-gray-200 rounded-lg shadow-lg w-40"
                  >
                    <DropdownMenuItem
                      onClick={() => handleEdit(secretary._id)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                      <span>Edit profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(secretary._id)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}