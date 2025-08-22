"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        console.log("User:", user.role);
        // Redirect based on user role
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
      } else {
        router.push("/auth/signin");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
}
