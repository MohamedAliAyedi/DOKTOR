"use client";

import { useState, useEffect } from "react";
import { billingAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NewBillModal } from "./NewBillModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Paid":
      return (
        <Badge className="bg-green-500 hover:bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Paid
        </Badge>
      );
    case "Pending":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Pending
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

export function BillingListContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("All bills");
  const [isNewBillModalOpen, setIsNewBillModalOpen] = useState(false);
  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      const response = await billingAPI.getBills({
        search: searchTerm,
        paymentStatus:
          filterValue === "All bills" ? undefined : filterValue.toLowerCase(),
      });
      setBills(response.data.data.bills || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch bills",
        variant: "destructive",
      });
      setBills([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBills();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterValue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-secondary">Bills List</h1>
              <Badge className="bg-blue-500 hover:bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Total 23
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              15 new bill were added today
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsNewBillModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
        >
          <span>Add a new bill</span>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        {/* Search and Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search keywords"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border border-gray-200 focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg h-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
            <Select value={filterValue} onValueChange={setFilterValue}>
              <SelectTrigger className="w-32 h-8 border-gray-200 rounded-lg text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                <SelectItem value="All bills">All bills</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 py-3 px-4 text-sm font-medium text-gray-500 border-b border-gray-200">
          <div>Patient</div>
          <div>Date</div>
          <div>Cost</div>
          <div>Payment method</div>
          <div>Time</div>
          <div>Status</div>
          <div>Bill</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-1 mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bills found</div>
          ) : (
            bills.map((bill) => (
              <div
                key={bill._id}
                className="grid grid-cols-7 gap-4 py-4 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center"
              >
                {/* Patient */}
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={bill.patient?.user?.avatar} />
                    <AvatarFallback>
                      {bill.patient?.user?.firstName?.[0]}
                      {bill.patient?.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {bill.patient?.user?.firstName}{" "}
                      {bill.patient?.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      See patient&apos;s profile
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="text-sm text-gray-600">
                  {new Date(bill.issueDate).toLocaleDateString()}
                </div>

                {/* Cost */}
                <div className="text-sm text-gray-900 font-medium">
                  {bill.currency} {bill.totalAmount}
                </div>

                {/* Payment Method */}
                <div className="text-sm text-gray-600 capitalize">
                  {bill.paymentMethod || "Not specified"}
                </div>

                {/* Time */}
                <div className="text-sm text-gray-600">
                  {new Date(bill.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                {/* Status */}
                <div>{getStatusBadge(bill.paymentStatus || "pending")}</div>

                {/* Bill */}
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 text-blue-500 hover:bg-blue-50"
                    onClick={() =>
                      window.open(`/api/bills/${bill._id}/pdf`, "_blank")
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

      {/* New Bill Modal */}
      <NewBillModal
        isOpen={isNewBillModalOpen}
        onClose={() => {
          setIsNewBillModalOpen(false);
          fetchBills(); // Refresh bills after creating new one
        }}
      />
    </div>
  );
}
