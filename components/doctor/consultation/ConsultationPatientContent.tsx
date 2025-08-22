"use client";

import { useState } from "react";
import { PrescriptionModal } from "./PrescriptionModal";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  Download,
  ExternalLink,
  Plus,
  Sparkles,
  Settings,
} from "lucide-react";

const symptoms = [
  { name: "Fever", color: "bg-blue-500" },
  { name: "Nausea", color: "bg-blue-500" },
  { name: "Fatigue", color: "bg-blue-500" },
  { name: "Headache", color: "bg-blue-500" },
  { name: "Dizziness", color: "bg-blue-500" },
  { name: "Insomnia", color: "bg-blue-500" },
  { name: "Muscle Pain", color: "bg-blue-500" },
  { name: "Joint Pain", color: "bg-blue-500" },
  { name: "Chest Pain", color: "bg-blue-500" },
  { name: "Shortness of Breath", color: "bg-blue-500" },
  { name: "Tingling", color: "bg-blue-500" },
  { name: "Confusion", color: "bg-blue-500" },
  { name: "Sensitivity to Light", color: "bg-blue-500" },
  { name: "Cold Sweats", color: "bg-blue-500" },
  { name: "Fever", color: "bg-blue-500" },
  { name: "Rash", color: "bg-blue-500" },
  { name: "Rash", color: "bg-blue-500" },
];

export function ConsultationPatientContent() {
  const router = useRouter();
  const [labAnalysis, setLabAnalysis] = useState("");
  const [xRayToDo, setXRayToDo] = useState("");
  const [bodyParts, setBodyParts] = useState("");
  const [referToDoctor, setReferToDoctor] = useState("");
  const [messageForDoctor, setMessageForDoctor] = useState("");
  const [report, setReport] = useState("");
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  const handleCreatePrescription = () => {
    setIsPrescriptionModalOpen(true);
  };

  const handleReportClick = (id: number) => {
    router.push(`/doctor/consultation/report/${id}`);
  };

  const handleSavePrescription = async (medications: any[]) => {
    // This will be handled by the PrescriptionModal component
    toast({
      title: "Success",
      description: "Prescription saved successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      {/* <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          className="bg-white border-gray-200 hover:bg-gray-50  px-4 py-2 text-sm"
        >
          Export
        </Button>
      </div> */}

      {/* Patient Info Card */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        <div className="flex items-center justify-between">
          {/* Patient Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=face" />
              <AvatarFallback>MA</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Mokhtar Amine Ghannouchi
              </h2>
              <p className="text-gray-500 text-sm">#Pt-00016</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="bg-pink-500 hover:bg-pink-500 text-white px-3 py-1 rounded-full text-xs">
                  ♂ Male
                </Badge>
                <Badge className="bg-pink-500 hover:bg-pink-500 text-white px-3 py-1 rounded-full text-xs">
                  24 years
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="w-10 h-10 rounded-full border-gray-200 hover:bg-gray-50 p-0"
            >
              <MessageCircle className="w-4 h-4 text-blue-500" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-10 h-10 rounded-full border-gray-200 hover:bg-gray-50 p-0"
            >
              <Download className="w-4 h-4 text-blue-500" />
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2  flex items-center space-x-2"
              onClick={() => router.push("/medical-record/1")}
            >
              <span>Medical record</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* </div> */}

        {/* Symptoms Section */}
        {/* <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50"> */}
        <h3 className="text-lg font-semibold text-pink-500 mb-4 mt-6">
          Symptoms
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {symptoms.map((symptom, index) => (
            <Badge
              key={index}
              className={`${symptom.color} hover:${symptom.color} text-white px-3 py-1 rounded-full text-sm`}
            >
              {symptom.name}
            </Badge>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="border-dashed border-blue-400 text-blue-500 hover:bg-blue-50 rounded-full px-3 py-1 text-sm flex items-center space-x-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add a symptom</span>
          </Button>
        </div>
        {/* </div> */}

        {/* Form Sections */}
        {/* <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50"> */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Laboratory analysis to do */}
            <div>
              <label className="block text-sm font-medium text-blue-500 mb-2">
                Laboratory analysis to do
              </label>
              <Input
                placeholder="Laboratory analysis to do"
                value={labAnalysis}
                onChange={(e) => setLabAnalysis(e.target.value)}
                className="bg-white border-gray-200  h-12"
              />
            </div>

            {/* Body parts that hurt */}
            <div>
              <label className="block text-sm font-medium text-blue-500 mb-2">
                Body parts that hurt
              </label>
              <Input
                placeholder="Body parts that hurt"
                value={bodyParts}
                onChange={(e) => setBodyParts(e.target.value)}
                className="bg-white border-gray-200  h-12"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* X-Ray to do */}
            <div>
              <label className="block text-sm font-medium text-blue-500 mb-2">
                X-Ray to do
              </label>
              <Input
                placeholder="X-Ray to do"
                value={xRayToDo}
                onChange={(e) => setXRayToDo(e.target.value)}
                className="bg-white border-gray-200  h-12"
              />
            </div>

            {/* Refer to doctor */}
            <div>
              <label className="block text-sm font-medium text-blue-500 mb-2">
                Refer to doctor
              </label>
              <Input
                placeholder="Refer to doctor"
                value={referToDoctor}
                onChange={(e) => setReferToDoctor(e.target.value)}
                className="bg-white border-gray-200  h-12"
              />
            </div>
          </div>
        </div>

        {/* Message for referred doctor */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-blue-500 mb-2">
            Message for referred doctor
          </label>
          <Textarea
            placeholder="Message for referred doctor"
            value={messageForDoctor}
            onChange={(e) => setMessageForDoctor(e.target.value)}
            className="bg-white border-gray-200  min-h-[120px] resize-none"
          />
        </div>

        {/* Report */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-blue-500 mb-2">
            Report
          </label>
          <Textarea
            placeholder="Report"
            value={report}
            onChange={(e) => setReport(e.target.value)}
            className="bg-white border-gray-200  min-h-[120px] resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            className="bg-white border-blue-400 hover:bg-gray-50  px-6 py-3 flex items-center space-x-2"
            onClick={() => handleReportClick(1)}
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Generate a report</span>
          </Button>
          <Button
            variant="outline"
            className="bg-white border-blue-400 hover:bg-gray-50  px-6 py-3 flex items-center space-x-2"
          >
            <Settings className="w-4 h-4 text-blue-500" />
            <span>Refer to a doctor</span>
          </Button>
          <Button
            onClick={handleCreatePrescription}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3  flex items-center space-x-2"
          >
            <span>Create prescription</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        onSave={handleSavePrescription}
        patientId="patient-id-here" // You would get this from the consultation context
        consultationId="consultation-id-here" // You would get this from the consultation context
      />
    </div>
  );
}
