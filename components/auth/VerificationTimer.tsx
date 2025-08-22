'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

interface VerificationTimerProps {
  initialTime: number;
  onResend: () => void;
}

export function VerificationTimer({ initialTime, onResend }: VerificationTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [canResend, setCanResend] = useState(false);
  const { resendOTP } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = () => {
    const resendOTPAsync = async () => {
      try {
        await resendOTP('phone'); // or 'email' based on context
        toast({
          title: "Success",
          description: "OTP sent successfully",
        });
        onResend();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    
    resendOTPAsync();
    setTimeLeft(initialTime);
    setCanResend(false);
  };

  return (
    <div className="text-center mt-4">
      {!canResend ? (
        <div className="text-gray-500 text-sm flex items-center justify-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          {formatTime(timeLeft)}
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          Vous n'avez pas reçu le code ?{' '}
          <button
            onClick={handleResend}
            className="text-primary font-semibold hover:underline"
          >
            Resend OTP
          </button>
        </p>
      )}
    </div>
  );
}