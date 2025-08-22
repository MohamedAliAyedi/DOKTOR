"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Stethoscope } from "lucide-react";

const bloodReports = [
  {
    id: 1,
    title: "Complete Blood Test Report",
    date: "21/05/2025",
    image: "/api/placeholder/300/400",
    type: "complete",
  },
  {
    id: 2,
    title: "Blood Analysis Sheet",
    date: "21/05/2025",
    image: "/api/placeholder/300/400",
    type: "analysis",
  },
  {
    id: 3,
    title: "Laboratory Results - Blood Panel",
    date: "21/05/2025",
    image: "/api/placeholder/300/400",
    type: "laboratory",
  },
];

const reportData = [
  {
    category: "CBC Reports",
    date: "Jul 11-3-2024",
    tests: [
      { name: "HB", value: "12", status: "normal", color: "bg-green-500" },
      { name: "RBC", value: "4.5", status: "normal", color: "bg-blue-500" },
      { name: "WBC", value: "8.2", status: "normal", color: "bg-green-500" },
      { name: "Lymphocytes", value: "25", status: "high", color: "bg-red-500" },
      {
        name: "Platelet",
        value: "250",
        status: "normal",
        color: "bg-blue-500",
      },
      { name: "Pct Cell", value: "42", status: "high", color: "bg-red-500" },
    ],
  },
  {
    category: "ABGs Reports",
    date: "Jul 11-3-2024",
    tests: [
      { name: "Venp", value: "7.4", status: "high", color: "bg-red-500" },
      { name: "Urea", value: "35", status: "normal", color: "bg-green-500" },
      { name: "Creatinine", value: "1.2", status: "high", color: "bg-red-500" },
      {
        name: "Pct Cell",
        value: "42",
        status: "normal",
        color: "bg-green-500",
      },
      { name: "Calcium", value: "9.8", status: "normal", color: "bg-blue-500" },
      { name: "Potassium", value: "4.2", status: "high", color: "bg-red-500" },
    ],
  },
  {
    category: "Blood Cis Reports",
    date: "Jul 11-3-2024",
    tests: [
      { name: "Venp", value: "7.4", status: "high", color: "bg-red-500" },
      { name: "Calcium", value: "9.8", status: "normal", color: "bg-blue-500" },
      { name: "Urea", value: "35", status: "normal", color: "bg-green-500" },
      { name: "Creatinine", value: "1.2", status: "high", color: "bg-red-500" },
      {
        name: "Pct Cell",
        value: "42",
        status: "normal",
        color: "bg-green-500",
      },
      { name: "Potassium", value: "4.2", status: "high", color: "bg-red-500" },
    ],
  },
];

const statusIndicators = [
  { label: "Normal", color: "bg-green-500" },
  { label: "Increase", color: "bg-red-500" },
  { label: "Decrease", color: "bg-blue-500" },
];

export function BloodResultsContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face" />
            <AvatarFallback className="bg-blue-500 text-white">
              👤
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-pink-500">
              Blood Test Results
            </h1>
            <p className="text-gray-600">
              Mokhtar Amine Ghannouchi{" "}
              <span className="text-gray-400">#P-00016</span>
            </p>
          </div>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full p-0">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </Button>
      </div>

      {/* Main Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        {/* Results Preview Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Results Preview
            </h2>
            <p className="text-sm text-gray-500">25/07/2025</p>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download file</span>
          </Button>
        </div>

        {/* Blood Report Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {bloodReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Blood Test Document</p>
                </div>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-medium text-blue-600 text-sm mb-1">
                  {report.title}
                </h3>
                <p className="text-xs text-gray-500">{report.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Report Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold text-pink-500">Report</h3>
          </div>

          {/* Status Legend */}
          <div className="flex items-center space-x-6 mb-6">
            {statusIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 ${indicator.color} rounded-full`}
                ></div>
                <span className="text-sm text-gray-700">{indicator.label}</span>
              </div>
            ))}
          </div>

          {/* Report Data */}
          <div className="space-y-4">
            {reportData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    {category.category}
                  </h4>
                  <span className="text-sm text-gray-500">{category.date}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.tests.map((test, testIndex) => (
                    <div
                      key={testIndex}
                      className="flex items-center space-x-2"
                    >
                      <span className="text-sm text-gray-700">{test.name}</span>
                      <Badge
                        className={`${test.color} hover:${test.color} text-white px-2 py-1 rounded text-xs`}
                      >
                        {test.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Planning Section */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-pink-500">Planning</h3>
          </div>
          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-gray-700 leading-relaxed">
              The Shoulder X-ray in the Anteroposterior (AP) view reveals normal
              alignment of the glenohumeral joint with no evidence of acute
              fracture or dislocation. The humeral head is well-positioned
              within the glenoid fossa. There is mild joint space narrowing and
              the presence of subchondral sclerosis and osteophyte formation,
              which are indicative of early glenohumeral osteoarthritis. No
              signs of lytic or sclerotic bone lesions are observed. The
              acromioclavicular (AC) joint appears intact, with no significant
              widening or displacement. Overall, the findings suggest
              degenerative changes consistent with mild osteoarthritis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
