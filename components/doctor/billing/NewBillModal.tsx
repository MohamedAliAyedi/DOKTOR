"use client";

import { useState } from "react";
import { billingAPI, patientsAPI, doctorsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Plus, Trash2 } from "lucide-react";

interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface NewBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewBillModal({ isOpen, onClose }: NewBillModalProps) {
  const [patient, setPatient] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [billType, setBillType] = useState("consultation");
  const [items, setItems] = useState<BillItem[]>([
    { description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);
  const [patients, setPatients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      fetchServices();
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    try {
      const response = await patientsAPI.getPatients();
      setPatients(response.data.data.patients || []);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setPatients([]); // Set empty array on error
    }
  };

  const fetchServices = async () => {
    try {
      const response = await doctorsAPI.getDoctorProfile();
      const doctorProfile = response.data.data.doctor;
      setServices(doctorProfile?.services || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([]); // Set empty array on error
    }
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof BillItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate total price for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const selectService = (index: number, serviceId: string) => {
    const service = services.find(s => s._id === serviceId);
    if (service) {
      updateItem(index, 'description', service.name);
      updateItem(index, 'unitPrice', service.price);
      updateItem(index, 'totalPrice', items[index].quantity * service.price);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleCreate = async () => {
    if (!patient || !paymentMethod || items.some(item => !item.description || item.unitPrice <= 0)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await billingAPI.createBill({
        patientId: patient,
        billType,
        items,
        paymentMethod,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      });

      toast({
        title: "Success",
        description: "Bill created successfully",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create bill",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setPatient("");
    setPaymentMethod("");
    setBillType("consultation");
    setItems([{ description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-0 border-0 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold text-pink-500 text-center">
              New Bill
            </DialogTitle>
          </DialogHeader>

          {/* Form */}
          <div className="space-y-6">
            {/* Patient and Bill Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-blue-500 font-medium">
                  Patient <span className="text-red-500">*</span>
                </Label>
                <Select value={patient} onValueChange={setPatient}>
                  <SelectTrigger className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                    <SelectValue placeholder="Select Patient" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                    {patients.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.user?.firstName} {p.user?.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-blue-500 font-medium">
                  Bill Type <span className="text-red-500">*</span>
                </Label>
                <Select value={billType} onValueChange={setBillType}>
                  <SelectTrigger className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                    <SelectValue placeholder="Bill Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="lab-test">Lab Test</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-blue-500 font-medium">
                  Services/Items <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="border-blue-500 text-blue-500 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Item #{index + 1}</span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Description</Label>
                      <Select
                        value={item.description}
                        onValueChange={(value) => {
                          if (value === 'custom') {
                            updateItem(index, 'description', '');
                          } else {
                            selectService(index, value);
                          }
                        }}
                      >
                        <SelectTrigger className="h-10 border-gray-200 rounded-lg">
                          <SelectValue placeholder="Select service or enter custom" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom Description</SelectItem>
                          {services.map((service) => (
                            <SelectItem key={service._id} value={service._id}>
                              {service.name} - {service.price} TND
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!services.find(s => s.name === item.description) && (
                        <Input
                          placeholder="Enter description"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="h-10 border-gray-200 rounded-lg"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="h-10 border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Unit Price (TND)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="h-10 border-gray-200 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Total Price</Label>
                      <Input
                        value={`${item.totalPrice.toFixed(2)} TND`}
                        disabled
                        className="h-10 border-gray-200 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-sm text-blue-500 font-medium">
                Payment method <span className="text-red-500">*</span>
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-200">
                  <SelectValue placeholder="Payment method" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="mobile-payment">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Total Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">{calculateTotal().toFixed(2)} TND</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-6">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="px-12 py-3 h-12 border-2 border-pink-500 text-pink-500 hover:bg-pink-50 rounded-full font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                className="px-12 py-3 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}