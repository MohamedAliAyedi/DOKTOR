"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Stethoscope, Calendar } from "lucide-react";

export function XRayResultsContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-500 mb-1">
            X-Ray Results
          </h1>
          <p className="text-gray-600">
            Mokhtar Amine Ghannouchi{" "}
            <span className="text-gray-400">#P-00016</span>
          </p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-full p-0">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </Button>
      </div>

      {/* X-Ray Details */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
        <div className="flex items-center space-x-4 mb-6">
          <h2 className="text-lg font-semibold text-pink-500">
            Shoulder X-ray (AP View)
          </h2>
          <span className="text-sm text-gray-500">25/07/2025</span>
        </div>

        {/* X-Ray Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 rounded-2xl overflow-hidden aspect-square">
            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-gray-800 to-black flex items-center justify-center">
              <div className="text-center text-blue-200">
                <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <p className="text-sm">X-Ray Image 1</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-2xl overflow-hidden aspect-square">
            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-gray-800 to-black flex items-center justify-center">
              <div className="text-center text-blue-200">
                <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <p className="text-sm">X-Ray Image 2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold text-pink-500">Diagnosis</h3>
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

        {/* Planning Section */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-500" />
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
