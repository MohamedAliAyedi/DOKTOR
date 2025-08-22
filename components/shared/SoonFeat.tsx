"use client";

import React from "react";
import { Clock, AlertCircle } from "lucide-react";

const FeatureStatusCard = ({
  title = "New Feature",
  description = "This feature is currently in development and will be available soon.",
  estimatedTime = "Q 2026",
}) => {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 bg-amber-100 p-2 rounded-full">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-amber-800 text-sm">
              This feature is not yet available
            </p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">{description}</p>

        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium">Estimated availability:</span>
          <span className="ml-2">{estimatedTime}</span>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-amber-500 h-2.5 rounded-full"
              style={{ width: "35%" }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>In progress</span>
            <span>35%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureStatusCard;
