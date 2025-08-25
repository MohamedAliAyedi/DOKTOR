"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { consultationsAPI, appointmentsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PrescriptionModal } from "./PrescriptionModal";
import { NewBillModal } from "../billing/NewBillModal";
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
  X,
  DollarSign,
} from "lucide-react";

export function ConsultationPatientContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [consultation, setConsultation] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [newSymptom, setNewSymptom] = useState("");
  const [labAnalysis, setLabAnalysis] = useState("");
  const [xRayToDo, setXRayToDo] = useState("");
  const [bodyParts, setBodyParts] = useState("");
  const [referToDoctor, setReferToDoctor] = useState("");
  const [messageForDoctor, setMessageForDoctor] = useState("");
  const [report, setReport] = useState("");
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchConsultationData();
    }
  }, [params.id]);

  const fetchConsultationData = async () => {
    try {
      // Try to fetch existing consultation
      try {
        const consultationResponse = await consultationsAPI.getConsultationById(params.id as string);
        setConsultation(consultationResponse.data.data.consultation);
        setSymptoms(consultationResponse.data.data.consultation.symptoms?.map((s: any) => s.name) || []);
        setLabAnalysis(consultationResponse.data.data.consultation.labOrders?.map((l: any) => l.testName).join(', ') || '');
        setReport(consultationResponse.data.data.consultation.treatmentPlan?.immediate || '');
      } catch (consultationError) {
        // If consultation doesn't exist, try to fetch appointment and create consultation
        const appointmentResponse = await appointmentsAPI.getAppointmentById(params.id as string);
        const appointmentData = appointmentResponse.data.data.appointment;
        setAppointment(appointmentData);
        
        // Create consultation from appointment
        const newConsultation = await consultationsAPI.createConsultation({
          appointmentId: appointmentData._id,
          patientId: appointmentData.patient._id,
          type: 'in-person',
          chiefComplaint: appointmentData.reason,
          symptoms: appointmentData.symptoms || []
        });
        
        setConsultation(newConsultation.data.data.consultation);
        setSymptoms(appointmentData.symptoms || []);
      }
    } catch (error) {
      console.error('Failed to fetch consultation data:', error);
      toast({
        title: "Error",
        description: "Failed to load consultation data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSymptom = () => {
    if (newSymptom.trim() && !symptoms.includes(newSymptom.trim())) {
      setSymptoms([...symptoms, newSymptom.trim()]);
      setNewSymptom("");
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const handleCreatePrescription = () => {
    setIsPrescriptionModalOpen(true);
  };

  const handleReportClick = () => {
    router.push(`/doctor/consultation/report/${consultation?._id || params.id}`);
  };

  const handleSavePrescription = async (medications: any[]) => {
    toast({
      title: "Success",
      description: "Prescription saved successfully",
    });
  };

  const handleSaveConsultation = async () => {
    if (!consultation) return;

    try {
      await consultationsAPI.updateConsultation(consultation._id, {
        symptoms: symptoms.map(name => ({ name, severity: 'moderate' })),
        labOrders: labAnalysis ? [{ testName: labAnalysis, urgency: 'routine' }] : [],
        imagingOrders: xRayToDo ? [{ type: 'x-ray', bodyPart: bodyParts, urgency: 'routine' }] : [],
        referrals: referToDoctor ? [{ specialization: referToDoctor, reason: messageForDoctor }] : [],
        treatmentPlan: {
          immediate: report
        }
      });

      toast({
        title: "Success",
        description: "Consultation updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save consultation",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!consultation && !appointment) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Consultation not found</p>
      </div>
    );
  }

  const patient = consultation?.patient || appointment?.patient;

  return (
    <div className="space-y-6">
      {/* Patient Info Card */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        <div className="flex items-center justify-between">
          {/* Patient Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={patient?.user?.avatar} />
              <AvatarFallback>
                {patient?.user?.firstName?.[0]}{patient?.user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {patient?.user?.firstName} {patient?.user?.lastName}
              </h2>
              <p className="text-gray-500 text-sm">#{patient?.patientId}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="bg-pink-500 hover:bg-pink-500 text-white px-3 py-1 rounded-full text-xs">
                  {patient?.gender === 'male' ? '♂ Male' : patient?.gender === 'female' ? '♀ Female' : '⚧ Other'}
                </Badge>
                <Badge className="bg-pink-500 hover:bg-pink-500 text-white px-3 py-1 rounded-full text-xs">
                  {patient?.age || 'N/A'} years
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
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 flex items-center space-x-2"
              onClick={() => router.push(`/medical-record/${patient?._id}`)}
            >
              <span>Medical record</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Symptoms Section */}
        <h3 className="text-lg font-semibold text-pink-500 mb-4 mt-6">
          Symptoms
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {symptoms.map((symptom, index) => (
            <Badge
              key={index}
              className="bg-blue-500 hover:bg-blue-500 text-white px-3 py-1 rounded-full text-sm relative group"
            >
              {symptom}
              <button
                onClick={() => removeSymptom(symptom)}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Add symptom"
              value={newSymptom}
              onChange={(e) => setNewSymptom(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSymptom();
                }
              }}
              className="w-32 h-8 text-sm border-dashed border-blue-400"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addSymptom}
              className="border-dashed border-blue-400 text-blue-500 hover:bg-blue-50 rounded-full px-3 py-1 text-sm flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </Button>
          </div>
        </div>

        {/* Form Sections */}
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
                className="bg-white border-gray-200 h-12"
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
                className="bg-white border-gray-200 h-12"
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
                className="bg-white border-gray-200 h-12"
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
                className="bg-white border-gray-200 h-12"
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
            className="bg-white border-gray-200 min-h-[120px] resize-none"
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
            className="bg-white border-gray-200 min-h-[120px] resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            className="bg-white border-blue-400 hover:bg-gray-50 px-6 py-3 flex items-center space-x-2"
            onClick={handleReportClick}
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Generate a report</span>
          </Button>
          <Button
            variant="outline"
            className="bg-white border-blue-400 hover:bg-gray-50 px-6 py-3 flex items-center space-x-2"
            onClick={handleSaveConsultation}
          >
            <Settings className="w-4 h-4 text-blue-500" />
            <span>Save consultation</span>
          </Button>
          <Button
            onClick={handleCreatePrescription}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 flex items-center space-x-2"
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
        patientId={patient?._id}
        consultationId={consultation?._id}
      />
    </div>
  );
}