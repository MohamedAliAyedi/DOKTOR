"use client";

import { useState, useEffect } from "react";
import { notificationsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight } from "lucide-react";

export function NotificationsSection() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentNotifications();
  }, []);

  const fetchRecentNotifications = async () => {
    try {
      const response = await notificationsAPI.getNotifications({ 
        limit: 4,
      });
      setNotifications(response.data.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new-message':
        return { icon: 'message', iconBg: 'bg-green-500' };
      case 'appointment-reminder':
      case 'appointment-confirmation':
        return { icon: 'appointment', iconBg: 'bg-pink-500' };
      case 'lab-results-ready':
        return { icon: 'analysis', iconBg: 'bg-green-500' };
      default:
        return { icon: 'message', iconBg: 'bg-blue-500' };
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary">Notifications</h3>
        <Button
          variant="ghost"
          className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1"
        >
          <span>See all Notifications</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No new notifications
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const { icon, iconBg } = getNotificationIcon(notification.type);
            return (
          <div
            key={notification._id}
            className="flex items-start space-x-4 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Icon */}
            <div
              className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              {icon === "message" && (
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
              {icon === "appointment" && (
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              )}
              {icon === "analysis" && (
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                <span className="text-xs text-gray-500 ml-4 flex-shrink-0">
                  {new Date(notification.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
          );
          })}
        </div>
      )}
    </div>
  );
}