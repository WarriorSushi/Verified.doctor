"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as clientAuth from "@/lib/auth/client";

// Google "G" logo SVG component
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function SignInFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const claimedHandle = searchParams.get("handle");
  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Sign in with Supabase Auth
      const { data, error: signInError } = await clientAuth.signIn(
        email,
        password
      );

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (!data.user) {
        throw new Error("Failed to sign in");
      }

      // Determine redirect destination
      if (redirectTo) {
        router.push(redirectTo);
      } else if (claimedHandle) {
        router.push(`/onboarding?handle=${claimedHandle}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific Supabase auth errors
        if (err.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (err.message.includes("Email not confirmed")) {
          setError("Please verify your email before signing in.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError("");

    // Store handle for after OAuth if present
    if (claimedHandle) {
      localStorage.setItem("claimed_handle", claimedHandle);
    }

    try {
      const { error } = await clientAuth.signInWithGoogle(redirectTo || undefined);
      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Welcome back
        </h1>
        <p className="text-slate-600">
          Sign in to your Verified.Doctor account
        </p>
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="w-full h-12 flex items-center justify-center gap-3 bg-white border-2 border-slate-200 rounded-xl font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:scale-[0.98] active:shadow-sm active:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
        ) : (
          <>
            <GoogleLogo className="w-5 h-5" />
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-slate-500">or continue with email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="doctor@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-[#0099F7] hover:text-[#0080CC]"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white font-semibold"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Cross-navigation */}
      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href={claimedHandle ? `/sign-up?handle=${claimedHandle}` : "/sign-up"}
          className="font-semibold text-[#0099F7] hover:text-[#0080CC]"
        >
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}

function SignInFormFallback() {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Welcome back
        </h1>
        <p className="text-slate-600">
          Sign in to your Verified.Doctor account
        </p>
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-slate-100 rounded-md animate-pulse" />
        <div className="h-12 bg-slate-100 rounded-md animate-pulse" />
        <div className="h-12 bg-slate-100 rounded-md animate-pulse" />
      </div>
    </div>
  );
}

export function SignInForm() {
  return (
    <Suspense fallback={<SignInFormFallback />}>
      <SignInFormContent />
    </Suspense>
  );
}
