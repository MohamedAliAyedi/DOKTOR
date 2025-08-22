import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { Logo } from "@/components/auth/Logo";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SocialLogin } from "@/components/auth/SocialLogin";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <Logo />
      <AuthCard title="S'inscrire">
        <SignUpForm />
        <SocialLogin />
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already registered?{" "}
            <Link
              href="/auth/signin"
              className="text-primary font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
