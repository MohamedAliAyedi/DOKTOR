'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from './api';
import { socketService } from './socket';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'patient' | 'doctor' | 'secretary' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<void>;
  verifyOTP: (otp: string, type: 'email' | 'phone') => Promise<void>;
  resendOTP: (type: 'email' | 'phone') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await authAPI.getMe();
          const userData = response.data.data.user;
          setUser(userData);
          setToken(storedToken);
          
          // Connect to socket
          socketService.connect(storedToken);
        } catch (error) {
          console.error('Failed to get user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken, refreshToken, data } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setToken(newToken);
      setUser(data.user);
      
      // Connect to socket
      socketService.connect(newToken);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authAPI.register(data);
      const { token: newToken, refreshToken, data: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setToken(newToken);
      setUser(userData.user);
      
      // Connect to socket
      socketService.connect(newToken);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setToken(null);
    
    // Disconnect socket
    socketService.disconnect();
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data.data.user || response.data.user);
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const verifyOTP = async (otp: string, type: 'email' | 'phone') => {
    try {
      await authAPI.verifyOTP({ otp, type, email: user?.email });
      
      // Refresh user data
      const response = await authAPI.getMe();
      setUser(response.data.data.user || response.data.user);
    } catch (error: any) {
      console.error('OTP verification error:', error);
      throw new Error(error.response?.data?.message || 'OTP verification failed');
    }
  };

  const resendOTP = async (type: 'email' | 'phone') => {
    try {
      await authAPI.resendOTP({ type, email: user?.email });
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      throw new Error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    verifyOTP,
    resendOTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}