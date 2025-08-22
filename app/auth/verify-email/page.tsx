"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { Logo } from "@/components/auth/Logo";
import { OTPInput } from "@/components/auth/OTPInput";
import { VerificationTimer } from "@/components/auth/VerificationTimer";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { verifyOTP, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const email = user?.email || "Ahmed23@gmail.com";

  const handleOTPComplete = (otp: string) => {
    setOtp(otp);
  };

  const handleVerify = async () => {
    setIsLoading(true);
    
    try {
      await verifyOTP(otp, 'email');
      
      toast({
        title: "Success",
        description: "Email verified successfully",
      });
      
      // Redirect based on user role
      if (user?.role === 'doctor') {
        router.push("/doctor");
      } else if (user?.role === 'patient') {
        router.push("/patient");
      } else if (user?.role === 'secretary') {
        router.push("/secretary");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    // This will be handled by VerificationTimer component
  };

  return (
    <AuthLayout>
      <Logo />
      <AuthCard>
        <div className="text-center">
          {/* Email Icon */}
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center relative">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">1</span>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Étape de vérification Par Email
          </h2>

          <p className="text-sm text-gray-600 mb-2">
            Le code OTP a été envoyé à
          </p>
          <p className="font-semibold text-primary mb-6">{email}</p>

          <OTPInput length={4} onComplete={handleOTPComplete} />

          <p className="text-sm text-gray-600 mt-4">
            Vous n&apos;avez pas reçu le code ?{" "}
            <button
              onClick={handleResendOTP}
              className="text-primary font-semibold hover:underline"
            >
              Resend OTP
            </button>
          </p>

          <Button
            onClick={handleVerify}
            className="w-full h-12 mt-8 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "VERIFYING..." : "VÉRIFIER"}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">+216 22 987 653</p>
            <button className="text-sm text-primary hover:underline mt-1">
              Changer
            </button>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
