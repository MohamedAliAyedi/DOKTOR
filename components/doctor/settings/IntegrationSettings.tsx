"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

const integrationServices = [
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Integrate Projects Management",
    icon: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    color: "bg-blue-500",
    isEnabled: false,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Integrate Projects Discussions",
    icon: "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    color: "bg-purple-500",
    isEnabled: true,
  },
  {
    id: "google",
    name: "Google",
    description: "Plan properly your workflow",
    icon: "https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    color: "bg-red-500",
    isEnabled: true,
  },
];

export function IntegrationSettings() {
  const [integrations, setIntegrations] = useState(integrationServices);

  const handleToggleIntegration = (id: string, enabled: boolean) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? { ...integration, isEnabled: enabled }
          : integration
      )
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-pink-500">
        Integration settings
      </h2>

      <div className="space-y-6">
        <h3 className="text-base font-medium text-pink-500">
          Connected accounts
        </h3>

        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between py-4"
            >
              <div className="flex items-center space-x-4">
                {/* Service Icon */}
                <div
                  className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center`}
                >
                  {integration.id === "dropbox" && (
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7.71 3.5L12 7.44 16.29 3.5 20 7.44 12 12.5 4 7.44 7.71 3.5zM12 12.5l8-5.06L16.29 3.5 12 7.44 7.71 3.5 4 7.44l8 5.06z" />
                    </svg>
                  )}
                  {integration.id === "slack" && (
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523c0-1.393 1.135-2.528 2.52-2.528h2.52v2.528c0 1.388-1.127 2.523-2.52 2.523zm0 0" />
                    </svg>
                  )}
                  {integration.id === "google" && (
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    </svg>
                  )}
                </div>

                {/* Service Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {integration.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {integration.description}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <Switch
                checked={integration.isEnabled}
                onCheckedChange={(checked) =>
                  handleToggleIntegration(integration.id, checked)
                }
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
