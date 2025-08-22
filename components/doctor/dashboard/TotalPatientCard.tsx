"use client";

import { Button } from "@/components/ui/button";

export function TotalPatientCard() {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg flex-1">
      <div className="relative z-10">
        <p className="text-blue-100 text-sm mb-2">Total Patient</p>
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-4xl font-bold">150</span>
          <span className="text-blue-200 text-sm">/ days</span>
        </div>
        <div className="space-y-1 text-sm">
          <p className="text-blue-100">25 patient cancelled</p>
          <p className="text-blue-100">50 patient rescheduled</p>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Revenue This Week</p>
              <p className="text-xl font-bold">$ 10,589.10</p>
            </div>
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary text-white shadow-md rounded-lg"
            >
              Details
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full"></div>
      <div className="absolute bottom-4 right-8 w-12 h-12 bg-white/10 rounded-full"></div>
    </div>
  );
}
