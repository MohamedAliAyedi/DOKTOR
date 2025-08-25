"use client";

import { useState, useEffect } from "react";
import { notificationsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function NotificationsContent() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    
    // Listen for new notifications
    const handleNewNotification = (event: any) => {
      const { notification } = event.detail;
      setNotifications(prev => [notification, ...prev]);
    };

    window.addEventListener('new_notification', handleNewNotification);
    return () => window.removeEventListener('new_notification', handleNewNotification);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getNotifications();
      setNotifications(response.data.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const groupNotificationsByDate = (notifications: any[]) => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    const grouped = {
      today: [] as any[],
      older: [] as any[]
    };
    
    notifications.forEach(notif => {
      const notifDate = new Date(notif.createdAt).toDateString();
      if (notifDate === todayStr) {
        grouped.today.push(notif);
      } else {
        grouped.older.push(notif);
      }
    });
    
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary">Notifications</h1>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-50 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            className="text-blue-500 border-blue-500 hover:bg-blue-50"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications Container */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-50 overflow-hidden">
        {/* Today Section */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today</h2>
          {groupedNotifications.today.length === 0 ? (
            <p className="text-gray-500 text-sm">No notifications today</p>
          ) : (
            <div className="space-y-4">
              {groupedNotifications.today.map((notification) => (
              <div
                key={notification._id}
                className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
              >
                {/* Notification Icon/Avatar */}
                <div className="flex-shrink-0">
                  {notification.sender ? (
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={notification.sender.avatar} />
                      <AvatarFallback>{notification.sender.firstName?.[0]}{notification.sender.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Bell className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {notification.isRead ? (
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <span className="text-sm font-medium text-blue-600">
                          {notification.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
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
              ))}
            </div>
          )}
        </div>

        {/* Older Notifications Section */}
        {groupedNotifications.older.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Earlier
            </h2>
            <div className="space-y-4">
              {groupedNotifications.older.map((notification) => (
              <div
                key={notification._id}
                className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
              >
                {/* Notification Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-600">
                          {notification.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}