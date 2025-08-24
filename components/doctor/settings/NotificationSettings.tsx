"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { notificationsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emailNotificationFreq, setEmailNotificationFreq] = useState("never");
  const [emailNewsUpdates, setEmailNewsUpdates] = useState({
    tipsAndTricks: true,
    offersAndPromotions: true,
    researchOpportunities: true,
    developerNewsletter: true,
    platformChangelog: true,
  });
  const [signInNotifications, setSignInNotifications] = useState("most-secure");
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    sms: true,
    push: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotificationPreferences();
  }, []);

  const fetchNotificationPreferences = async () => {
    try {
      const response = await notificationsAPI.getNotificationPreferences();
      const prefs = response.data.data.preferences;
      setNotificationPreferences(prefs);
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    }
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await notificationsAPI.updateNotificationPreferences(notificationPreferences);

      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update notification settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-pink-500">
        Notifications settings
      </h2>

      {/* Basic Notification Preferences */}
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-2">
            Notification Channels
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose how you want to receive notifications from DOKTOR.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Email Notifications</span>
              <p className="text-xs text-gray-500">Receive notifications via email</p>
            </div>
            <Checkbox
              checked={notificationPreferences.email}
              onCheckedChange={(checked) =>
                setNotificationPreferences(prev => ({ ...prev, email: checked as boolean }))
              }
              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
              <p className="text-xs text-gray-500">Receive notifications via SMS</p>
            </div>
            <Checkbox
              checked={notificationPreferences.sms}
              onCheckedChange={(checked) =>
                setNotificationPreferences(prev => ({ ...prev, sms: checked as boolean }))
              }
              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Push Notifications</span>
              <p className="text-xs text-gray-500">Receive push notifications in the app</p>
            </div>
            <Checkbox
              checked={notificationPreferences.push}
              onCheckedChange={(checked) =>
                setNotificationPreferences(prev => ({ ...prev, push: checked as boolean }))
              }
              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-2">
            Email Notifications
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            When you&apos;re busy or not online, DOKTOR can send you email
            notifications for any new direct messages or mentions of your name.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">
            Send me email notifications:
          </h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="email-notifications"
                name="emailNotifications"
                value="send"
                checked={emailNotificationFreq === "send"}
                onChange={(e) => setEmailNotificationFreq(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor="email-notifications"
                className="text-sm text-gray-700"
              >
                Send me email notifications
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="once-hour"
                name="emailNotifications"
                value="once-hour"
                checked={emailNotificationFreq === "once-hour"}
                onChange={(e) => setEmailNotificationFreq(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="once-hour" className="text-sm text-gray-700">
                Once an hour at most
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="never"
                name="emailNotifications"
                value="never"
                checked={emailNotificationFreq === "never"}
                onChange={(e) => setEmailNotificationFreq(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="never" className="text-sm text-gray-700">
                Never
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Email News & Updates */}
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-2">
            Email News & Updates
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            From time to time, we&apos;d like to send you emails with
            interesting news about DOKTOR and your workspace. You can choose
            which of these updates you&apos;d like to receive:
          </p>
        </div>

        <div className="space-y-4">
          {[
            { key: "tipsAndTricks", label: "Tips and Tricks" },
            { key: "offersAndPromotions", label: "Offers and Promotions" },
            { key: "researchOpportunities", label: "Research Opportunities" },
            {
              key: "developerNewsletter",
              label:
                "DOKTOR Developer Newsletter: Best practices for connecting your work to DOKTOR via our platform",
            },
            {
              key: "platformChangelog",
              label:
                "DOKTOR Platform Changelog: Stay in the know when we make updates to our APIs",
            },
          ].map((item) => (
            <div key={item.key} className="flex items-start space-x-3">
              <Checkbox
                checked={
                  emailNewsUpdates[item.key as keyof typeof emailNewsUpdates]
                }
                onCheckedChange={(checked) =>
                  setEmailNewsUpdates((prev) => ({
                    ...prev,
                    [item.key]: checked as boolean,
                  }))
                }
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 mt-1"
              />
              <label className="text-sm text-gray-700 leading-relaxed">
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Sign-in Notifications */}
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-2">
            Sign-in Notifications
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            These emails help keep your DOKTOR account secure. If you
            haven&apos;t already, you should also enable two-factor
            authentication.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="radio"
              id="most-secure"
              name="signInNotifications"
              value="most-secure"
              checked={signInNotifications === "most-secure"}
              onChange={(e) => setSignInNotifications(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
            />
            <div>
              <label
                htmlFor="most-secure"
                className="text-sm font-medium text-gray-900"
              >
                Most secure
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Receive an email anytime someone signs in to your DOKTOR account
                from an unrecognized device.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <input
              type="radio"
              id="standard"
              name="signInNotifications"
              value="standard"
              checked={signInNotifications === "standard"}
              onChange={(e) => setSignInNotifications(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
            />
            <div>
              <label
                htmlFor="standard"
                className="text-sm font-medium text-gray-900"
              >
                Standard
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Receive an email when someone signs in from a new location, with
                an unrecognized device.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <input
              type="radio"
              id="no-notifications"
              name="signInNotifications"
              value="no-notifications"
              checked={signInNotifications === "no-notifications"}
              onChange={(e) => setSignInNotifications(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
            />
            <div>
              <label
                htmlFor="no-notifications"
                className="text-sm font-medium text-gray-900"
              >
                Don&apos;t send me any sign-in notifications
              </label>
            </div>
          </div>
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