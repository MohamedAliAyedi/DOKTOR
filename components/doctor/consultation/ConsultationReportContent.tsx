"use client";

import { useState, useRef, useCallback } from "react";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { consultationsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Paperclip,
  Maximize2,
  MessageCircle,
} from "lucide-react";

export function ConsultationReportContent() {
  const params = useParams();
  const { toast } = useToast();
  const [consultation, setConsultation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reportContent, setReportContent] =
    useState('');

  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    alignment: "left",
    listType: null as "ordered" | "unordered" | null,
  });

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      fetchConsultation();
    }
  }, [params.id]);

  const fetchConsultation = async () => {
    try {
      const response = await consultationsAPI.getConsultationById(params.id as string);
      const consultationData = response.data.data.consultation;
      setConsultation(consultationData);
      
      // Generate initial report content
      const initialReport = generateInitialReport(consultationData);
      setReportContent(initialReport);
    } catch (error) {
      console.error('Failed to fetch consultation:', error);
      toast({
        title: "Error",
        description: "Failed to load consultation data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateInitialReport = (consultation: any) => {
    const patient = consultation.patient;
    const doctor = consultation.doctor;
    
    return `
      <h2>Consultation Report</h2>
      <p><strong>Patient:</strong> ${patient?.user?.firstName} ${patient?.user?.lastName}</p>
      <p><strong>Date:</strong> ${new Date(consultation.startTime).toLocaleDateString()}</p>
      <p><strong>Doctor:</strong> Dr. ${doctor?.user?.firstName} ${doctor?.user?.lastName}</p>
      
      <h3>Chief Complaint</h3>
      <p>${consultation.chiefComplaint || 'Not specified'}</p>
      
      <h3>Symptoms</h3>
      <ul>
        ${consultation.symptoms?.map((s: any) => `<li>${s.name}</li>`).join('') || '<li>No symptoms recorded</li>'}
      </ul>
      
      <h3>Physical Examination</h3>
      <p>${consultation.physicalExamination?.general || 'Physical examination pending...'}</p>
      
      <h3>Diagnosis</h3>
      <p>${consultation.diagnosis?.primary?.description || 'Diagnosis pending...'}</p>
      
      <h3>Treatment Plan</h3>
      <p>${consultation.treatmentPlan?.immediate || 'Treatment plan to be determined...'}</p>
      
      <h3>Follow-up Instructions</h3>
      <p>${consultation.followUpInstructions?.nextAppointment?.reason || 'Follow-up as needed.'}</p>
    `;
  };

  // Function to apply formatting to selected text
  const applyFormat = useCallback((format: string, value: string | boolean) => {
    document.execCommand(format, false, value.toString());
    if (editorRef.current) {
      setReportContent(editorRef.current.innerHTML);
    }

    // Update formatting state for visual feedback
    if (format === "bold")
      setFormatting((prev) => ({ ...prev, bold: value as boolean }));
    if (format === "italic")
      setFormatting((prev) => ({ ...prev, italic: value as boolean }));
    if (format === "underline")
      setFormatting((prev) => ({ ...prev, underline: value as boolean }));
  }, []);

  // Function to set text alignment
  const setAlignment = useCallback((alignment: string) => {
    document.execCommand("justify" + alignment);
    if (editorRef.current) {
      setReportContent(editorRef.current.innerHTML);
    }
    setFormatting((prev) => ({ ...prev, alignment }));
  }, []);

  // Function to insert a list
  const insertList = useCallback((type: "ordered" | "unordered") => {
    document.execCommand(
      type === "ordered" ? "insertOrderedList" : "insertUnorderedList"
    );
    if (editorRef.current) {
      setReportContent(editorRef.current.innerHTML);
    }
    setFormatting((prev) => ({ ...prev, listType: type }));
  }, []);

  // Function to handle content changes
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      setReportContent(editorRef.current.innerHTML);
    }
  }, []);

  // Function to add a link
  const addLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      document.execCommand("createLink", false, url);
      if (editorRef.current) {
        setReportContent(editorRef.current.innerHTML);
      }
    }
  }, []);

  // Function to handle attachment
  const handleAttachment = useCallback(() => {
    // Create a hidden file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf,.doc,.docx";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In a real app, you would upload the file and get a URL
        // For this example, we'll just insert a placeholder
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result && editorRef.current) {
            if (file.type.startsWith("image/")) {
              document.execCommand(
                "insertHTML",
                false,
                `<img src="${event.target.result}" alt="${file.name}" style="max-width: 100%;" />`
              );
            } else {
              document.execCommand(
                "insertHTML",
                false,
                `<a href="${event.target.result}" download="${file.name}">${file.name}</a>`
              );
            }
            setReportContent(editorRef.current.innerHTML);
          }
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  }, []);

  const handleSaveReport = async () => {
    if (!consultation) return;

    setIsSaving(true);
    try {
      await consultationsAPI.updateConsultation(consultation._id, {
        treatmentPlan: {
          ...consultation.treatmentPlan,
          immediate: reportContent
        }
      });

      toast({
        title: "Success",
        description: "Report saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save report",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Consultation not found</p>
      </div>
    );
  }

  const patient = consultation.patient;

  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        <div className="flex items-center justify-between">
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
          <Button
            variant="outline"
            size="sm"
            className="w-10 h-10 rounded-full bg-blue-500 text-white hover:bg-blue-50 p-0"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-50 overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-1">
            {/* Text Formatting */}
            <Button
              variant={formatting.bold ? "secondary" : "ghost"}
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100"
              onClick={() => applyFormat("bold", !formatting.bold)}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant={formatting.italic ? "secondary" : "ghost"}
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100"
              onClick={() => applyFormat("italic", !formatting.italic)}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant={formatting.underline ? "secondary" : "ghost"}
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100"
              onClick={() => applyFormat("underline", !formatting.underline)}
            >
              <Underline className="w-4 h-4" />
            </Button>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            {/* Headings */}
            <Button
              variant="ghost"
              size="sm"
              className="px-2 h-8 text-sm hover:bg-gray-100"
              onClick={() => document.execCommand("formatBlock", false, "<h1>")}
            >
              H1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="px-2 h-8 text-sm hover:bg-gray-100"
              onClick={() => document.execCommand("formatBlock", false, "<h2>")}
            >
              H2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="px-2 h-8 text-sm hover:bg-gray-100"
              onClick={() => document.execCommand("formatBlock", false, "<h3>")}
            >
              H3
            </Button>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            {/* Links and Attachments */}
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100"
              onClick={addLink}
            >
              <Link className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100"
              onClick={handleAttachment}
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            {/* Alignment */}
            <Button
              variant={formatting.alignment === "left" ? "secondary" : "ghost"}
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100"
              onClick={() => setAlignment("Left")}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={
                formatting.alignment === "center" ? "secondary" : "ghost"
              }
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100"
              onClick={() => setAlignment("Center")}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant={formatting.alignment === "right" ? "secondary" : "ghost"}
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100"
              onClick={() => setAlignment("Right")}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button
              variant={formatting.alignment === "full" ? "secondary" : "ghost"}
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100"
              onClick={() => setAlignment("Full")}
            >
              <AlignJustify className="w-4 h-4" />
            </Button>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            {/* Lists */}
            <Button
              variant={
                formatting.listType === "unordered" ? "secondary" : "ghost"
              }
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100"
              onClick={() => insertList("unordered")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={
                formatting.listType === "ordered" ? "secondary" : "ghost"
              }
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100"
              onClick={() => insertList("ordered")}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Maximize */}
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 hover:bg-gray-100"
              onClick={() => {
                const elem = document.documentElement;
                if (elem.requestFullscreen) {
                  elem.requestFullscreen();
                }
              }}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
          <div
            ref={editorRef}
            className="min-h-[400px] text-gray-700 leading-relaxed text-sm focus:outline-none"
            contentEditable
            suppressContentEditableWarning={true}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: reportContent }}
          />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          className="bg-white border-gray-200 hover:bg-gray-50 rounded-lg px-8 py-3"
          onClick={() => router.back()}
        >
          Back to edit
        </Button>
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg"
          onClick={handleSaveReport}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Report"}
        </Button>
      </div>
    </div>
  );
}
