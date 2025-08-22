"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Trash2, Edit } from "lucide-react";
import { NewServiceModal } from "./NewServiceModal";

const servicesData = [
  {
    id: 1,
    name: "Visit",
    price: "TND 50",
    duration: "35 min",
    description: "In-person consultation for personalize...",
    status: "Inactive",
  },
  {
    id: 2,
    name: "X-Ray",
    price: "TND 50",
    duration: "35 min",
    description: "Surgical intervention for effective trea...",
    status: "Active",
  },
  {
    id: 3,
    name: "Blood Test",
    price: "TND 50",
    duration: "35 min",
    description: "Comprehensive blood analysis for ac...",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Urine Test",
    price: "TND 50",
    duration: "35 min",
    description: "Urine screening to detect infections a...",
    status: "Inactive",
  },
  {
    id: 5,
    name: "Operation",
    price: "TND 50",
    duration: "35 min",
    description: "Surgical intervention for effective trea...",
    status: "Active",
  },
];

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

export function ServiceSettings() {
  const [services, setServices] = useState(servicesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("Price");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [durationFilter, setDurationFilter] = useState("Duration");
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);

  const handleAddNewService = (newService: any) => {
    setServices([...services, newService]);
  };

  const handleDeleteService = (id: number) => {
    setServices(services.filter((service) => service.id !== id));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-pink-500">Services Settings</h2>

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
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-24 h-8 border-gray-200 rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
              <SelectItem value="Price">Price</SelectItem>
              <SelectItem value="Low to High">Low to High</SelectItem>
              <SelectItem value="High to Low">High to Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-24 h-8 border-gray-200 rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
              <SelectItem value="Status">Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={durationFilter} onValueChange={setDurationFilter}>
            <SelectTrigger className="w-28 h-8 border-gray-200 rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
              <SelectItem value="Duration">Duration</SelectItem>
              <SelectItem value="Short">Short</SelectItem>
              <SelectItem value="Long">Long</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setIsNewServiceModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 h-8"
          >
            <span className="text-sm">Add new Service</span>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 py-4 px-6 bg-gray-50 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-600">Service name</div>
          <div className="text-sm font-medium text-gray-600">Price</div>
          <div className="text-sm font-medium text-gray-600">Duration</div>
          <div className="text-sm font-medium text-gray-600">Description</div>
          <div className="text-sm font-medium text-gray-600">Status</div>
          <div className="text-sm font-medium text-gray-600">Actions</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-100">
          {services.map((service) => (
            <div
              key={service.id}
              className="grid grid-cols-6 gap-4 py-4 px-6 hover:bg-gray-50 transition-colors items-center"
            >
              {/* Service Name */}
              <div className="text-sm text-gray-900 font-medium">
                {service.name}
              </div>

              {/* Price */}
              <div className="text-sm text-gray-600">{service.price}</div>

              {/* Duration */}
              <div className="text-sm text-gray-600">{service.duration}</div>

              {/* Description */}
              <div className="text-sm text-gray-600 truncate">
                {service.description}
              </div>

              {/* Status */}
              <div>{getStatusBadge(service.status)}</div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-red-500 hover:bg-red-50"
                  onClick={() => handleDeleteService(service.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-blue-500 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Service Modal */}
      <NewServiceModal
        isOpen={isNewServiceModalOpen}
        onClose={() => setIsNewServiceModalOpen(false)}
        onSave={handleAddNewService}
      />
    </div>
  );
}
