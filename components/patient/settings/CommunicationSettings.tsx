"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export function CommunicationSettings() {
  const [emailSettings, setEmailSettings] = useState({
    notifications: true,
    newsletterSubscriptions: true,
    patientCommunication: true,
  });
  const [smsSettings, setSmsSettings] = useState({
    appointmentAlerts: true,
    announcements: true,
    promotionalOffers: true,
  });
  const [videoCallSettings, setVideoCallSettings] = useState({
    patient: true,
    secretary: true,
    otherDoctor: true,
  });

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-pink-500">
        Communication settings
      </h2>

      {/* Email Section */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-gray-900">Email</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Notifications</span>
            <Switch
              checked={emailSettings.notifications}
              onCheckedChange={(checked) =>
                setEmailSettings((prev) => ({
                  ...prev,
                  notifications: checked,
                }))
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Newsletter Subscriptions
            </span>
            <Switch
              checked={emailSettings.newsletterSubscriptions}
              onCheckedChange={(checked) =>
                setEmailSettings((prev) => ({
                  ...prev,
                  newsletterSubscriptions: checked,
                }))
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Patient Communication</span>
            <Switch
              checked={emailSettings.patientCommunication}
              onCheckedChange={(checked) =>
                setEmailSettings((prev) => ({
                  ...prev,
                  patientCommunication: checked,
                }))
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>
      </div>

      {/* SMS Section */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-gray-900">SMS</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Appointment Alerts</span>
            <Switch
              checked={smsSettings.appointmentAlerts}
              onCheckedChange={(checked) =>
                setSmsSettings((prev) => ({
                  ...prev,
                  appointmentAlerts: checked,
                }))
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Announcements</span>
            <Switch
              checked={smsSettings.announcements}
              onCheckedChange={(checked) =>
                setSmsSettings((prev) => ({
                  ...prev,
                  announcements: checked,
                }))
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Promotional Offers</span>
            <Switch
              checked={smsSettings.promotionalOffers}
              onCheckedChange={(checked) =>
                setSmsSettings((prev) => ({
                  ...prev,
                  promotionalOffers: checked,
                }))
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Video Call Settings */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-gray-900">
          Video Call Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Patient</span>
            <Switch
              checked={videoCallSettings.patient}
              onCheckedChange={(checked) =>
                setVideoCallSettings((prev) => ({
                  ...prev,
                  patient: checked,
                }))
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Secretary</span>
            <Switch
              checked={videoCallSettings.secretary}
              onCheckedChange={(checked) =>
                setVideoCallSettings((prev) => ({
                  ...prev,
                  secretary: checked,
                }))
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Other Doctor</span>
            <Switch
              checked={videoCallSettings.otherDoctor}
              onCheckedChange={(checked) =>
                setVideoCallSettings((prev) => ({
                  ...prev,
                  otherDoctor: checked,
                }))
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
