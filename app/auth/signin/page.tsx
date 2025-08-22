import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { Logo } from "@/components/auth/Logo";
import { SignInForm } from "@/components/auth/SignInForm";
import { SocialLogin } from "@/components/auth/SocialLogin";
import Link from "next/link";

export default function SignInPage() {
  return (
    <AuthLayout>
      <Logo />
      <AuthCard title="Se connecter">
        <SignInForm />
        <SocialLogin />
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-primary font-semibold hover:underline"
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
