"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export function SignUpForm() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      await register({
        firstName: formData.name.split(' ')[0],
        lastName: formData.name.split(' ').slice(1).join(' ') || formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
        role: 'patient' // Default role
      });
      
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      
      router.push("/auth/verify-phone");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleInputChange}
          className="h-12 border-gray-200 focus:border-primary"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          className="h-12 border-gray-200 focus:border-primary"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Number
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={handleInputChange}
          className="h-12 border-gray-200 focus:border-primary"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            className="h-12 border-gray-200 focus:border-primary pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-gray-700"
        >
          Confirm password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="h-12 border-gray-200 focus:border-primary pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          className="w-2/3 h-12 mt-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-3xl"
          disabled={isLoading}
        >
          {isLoading ? "SIGNING UP..." : "SIGN UP"}
        </Button>
      </div>
    </form>
  );
}
