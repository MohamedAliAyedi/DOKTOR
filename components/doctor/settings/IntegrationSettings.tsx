"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const integrationServices = [
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Integrate Projects Management",
    color: "bg-blue-500",
    isEnabled: false,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Integrate Projects Discussions",
    color: "bg-purple-500",
    isEnabled: true,
  },
  {
    id: "google",
    name: "Google",
    description: "Plan properly your workflow",
    color: "bg-red-500",
    isEnabled: true,
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Sync appointments with Google Calendar",
    color: "bg-green-500",
    isEnabled: false,
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Enable video consultations via Zoom",
    color: "bg-blue-600",
    isEnabled: false,
  },
];

export function IntegrationSettings() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState(integrationServices);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.preferences?.integrations) {
      const userIntegrations = user.preferences.integrations;
      setIntegrations(prev => prev.map(integration => ({
        ...integration,
        isEnabled: userIntegrations[integration.id] || integration.isEnabled
      })));
    }
  }, [user]);

  const handleToggleIntegration = (id: string, enabled: boolean) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? { ...integration, isEnabled: enabled }
          : integration
      )
    );
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const integrationSettings = integrations.reduce((acc, integration) => {
        acc[integration.id] = integration.isEnabled;
        return acc;
      }, {} as Record<string, boolean>);

      await updateProfile({
        preferences: {
          ...user?.preferences,
          integrations: integrationSettings
        }
      });

      toast({
        title: "Success",
        description: "Integration settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update integration settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                  {integration.id === "calendar" && (
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                  )}
                  {integration.id === "zoom" && (
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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

      {/* Save Button */}
      <div className="flex justify-center">
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-16 py-3 h-12 rounded-full font-medium"
          onClick={handleSaveChanges}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}