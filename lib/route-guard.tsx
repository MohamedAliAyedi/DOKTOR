"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth-context";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && user) {
      // Role-based route protection
      const roleRoutes = {
        doctor: ["/doctor", "/chat", "/notifications"],
        patient: ["/patient"],
        secretary: ["/secretary"],
        admin: ["/admin"],
      };

      const userAllowedRoutes = roleRoutes[user.role] || [];
      const isAllowedRoute = userAllowedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (!isAllowedRoute && !pathname.startsWith("/auth")) {
        // Redirect to appropriate dashboard
        switch (user.role) {
          case "doctor":
            router.push("/doctor");
            break;
          case "patient":
            router.push("/patient");
            break;
          case "secretary":
            router.push("/secretary");
            break;
          case "admin":
            router.push("/admin");
            break;
          default:
            router.push("/auth/signin");
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
