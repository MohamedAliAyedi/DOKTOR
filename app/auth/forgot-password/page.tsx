"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { Logo } from "@/components/auth/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/auth/verify-email");
    }, 1000);
  };

  return (
    <AuthLayout>
      <Logo />
      <AuthCard title="Reset Password">
        <p className="text-gray-600 text-center mb-6">
          Enter your email address and we&apos;ll send you a code to reset your
          password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-gray-200 focus:border-primary"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 mt-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "SENDING..." : "SEND RESET CODE"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/auth/signin"
            className="text-primary hover:underline text-sm"
          >
            Back to Sign In
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
