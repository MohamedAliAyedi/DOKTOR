"use client";

import { useState, useEffect } from "react";
import { prescriptionsAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export function MedicationReminders() {
  const [medications, setMedications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentMedications();
  }, []);

  const fetchCurrentMedications = async () => {
    try {
      const response = await prescriptionsAPI.getPrescriptions({ 
        status: 'active' 
      });
      
      const activeMedications = response.data.data.prescriptions
        .flatMap((prescription: any) => 
          prescription.medications
            .filter((med: any) => med.isActive)
            .map((med: any) => ({
              id: med._id || prescription._id + med.name,
              name: med.name,
              time: `${med.duration.startDate} - ${med.duration.endDate}`,
              timing: Object.entries(med.timing || {})
                .filter(([key, value]) => value)
                .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())),
              completed: false, // You might want to track this separately
              dosage: `${med.dosage.amount}${med.dosage.unit}`,
              frequency: med.frequency
            }))
        );
      
      setMedications(activeMedications);
    } catch (error) {
      console.error('Failed to fetch medications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkCompleted = async (medicationId: string) => {
    try {
      // Record medication adherence
      await prescriptionsAPI.recordAdherence(medicationId, {
        medicationName: medications.find(m => m.id === medicationId)?.name,
        taken: true
      });
      
      setMedications(prev => 
        prev.map(med => 
          med.id === medicationId 
            ? { ...med, completed: true }
            : med
        )
      );
    } catch (error) {
      console.error('Failed to record medication adherence:', error);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
      <h3 className="text-lg font-semibold text-secondary mb-6">
        Daily medicaments reminder
      </h3>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : medications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No active medications
        </div>
      ) : (
        <div className="space-y-4">
          {medications.map((medication) => (
            <div
              key={medication.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                medication.completed
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    {medication.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {medication.dosage} - {medication.frequency}
                  </p>
                </div>
                <button
                  onClick={() => handleMarkCompleted(medication.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    medication.completed
                      ? "bg-green-500"
                      : "border-2 border-gray-300 hover:border-green-500"
                  }`}
                >
                  {medication.completed && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {medication.timing.map((timing, index) => (
                  <Badge
                    key={index}
                    className={`text-xs px-2 py-1 rounded-full ${
                      timing === "N/A"
                        ? "bg-gray-200 text-gray-500 hover:bg-gray-200"
                        : "bg-blue-500 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {timing}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}