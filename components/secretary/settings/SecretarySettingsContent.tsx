"use client";

import { useState } from "react";
import { GeneralSettings } from "@/components/doctor/settings/GeneralSettings";
import { ProfileSettings } from "@/components/doctor/settings/ProfileSettings";
import { PasswordSettings } from "@/components/doctor/settings/PasswordSettings";
import { NotificationSettings } from "@/components/doctor/settings/NotificationSettings";
import { CommunicationSettings } from "@/components/doctor/settings/CommunicationSettings";
import { IntegrationSettings } from "@/components/doctor/settings/IntegrationSettings";

const settingsTabs = [
  { id: "general", label: "General", active: false },
  { id: "profile", label: "Profile", active: false },
  { id: "password", label: "Password", active: false },
  { id: "notification", label: "Notification", active: false },
  { id: "communication", label: "Communication", active: false },
  { id: "integration", label: "Integration", active: false },
];

export function SecretarySettingsContent() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-pink-500">Settings</h1>
      </div>

      {/* Settings Container */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-50 overflow-hidden">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-8 overflow-x-auto">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-8">
          {/* Render Active Tab Content */}
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "password" && <PasswordSettings />}
          {activeTab === "notification" && <NotificationSettings />}
          {activeTab === "communication" && <CommunicationSettings />}
          {activeTab === "integration" && <IntegrationSettings />}
        </div>
      </div>
    </div>
  );
}