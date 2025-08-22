'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { Logo } from '@/components/auth/Logo';
import { OTPInput } from '@/components/auth/OTPInput';
import { VerificationTimer } from '@/components/auth/VerificationTimer';
import { Button } from '@/components/ui/button';

export default function VerifyPhonePage() {
  const router = useRouter();
  const { verifyOTP } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const phoneNumber = '+216 22 987 653'; // This would come from previous step

  const handleOTPComplete = (otp: string) => {
    setOtp(otp);
  };

  const handleVerify = async () => {
    setIsLoading(true);
    
    try {
      await verifyOTP(otp, 'phone');
      
      toast({
        title: "Success",
        description: "Phone verified successfully",
      });
      
      router.push('/auth/verify-email');
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
          {/* Phone Icon */}
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">1</span>
                </div>
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Étape de vérification Par téléphone
          </h2>
          
          <p className="text-sm text-gray-600 mb-2">
            Le code OTP a été envoyé à
          </p>
          <p className="font-semibold text-primary mb-6">
            {phoneNumber}
          </p>

          <OTPInput length={4} onComplete={handleOTPComplete} />
          
          <VerificationTimer initialTime={30} onResend={handleResendOTP} />

          <Button 
            onClick={handleVerify}
            className="w-full h-12 mt-8 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? 'VERIFYING...' : 'VÉRIFIER'}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Ahmed23@gmail.com</p>
            <button className="text-sm text-primary hover:underline mt-1">
              Changer
            </button>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}