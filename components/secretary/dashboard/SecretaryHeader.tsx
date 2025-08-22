"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { notificationsAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export function SecretaryHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationsAPI.getUnreadCount();
        setUnreadCount(response.data.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
  }, []);

  const handleNotificationClick = () => {
    router.push(`/secretary/notifications`);
  };

  return (
    <header className="bg-white/50 backdrop-blur-sm px-6 py-4 shadow-sm rounded-xl border-2 border-gray-50 m-3">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search keywords"
            className="pl-10 bg-white border border-primary focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-full h-10"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notification */}
          <Button
            variant="ghost"
            size="sm"
            className="relative bg-white rounded-3xl"
            onClick={handleNotificationClick}
          >
            <Bell className="w-5 h-5 text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar || "https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face"} />
              <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-gray-500 text-xs uppercase">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-xs text-gray-500 hover:text-red-500 ml-2"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}