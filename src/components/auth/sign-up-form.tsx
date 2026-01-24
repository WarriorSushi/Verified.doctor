"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Check, Mail, RefreshCw } from "lucide-react";
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

function SignUpFormContent() {
  const searchParams = useSearchParams();
  const claimedHandle = searchParams.get("handle");
  const inviteCode = searchParams.get("invite");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Sign up with Supabase Auth
      const { data, error: signUpError } = await clientAuth.signUp(
        email,
        password,
        { full_name: name }
      );

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!data.user) {
        throw new Error("Failed to create account");
      }

      // Store handle in localStorage for retrieval after email confirmation
      if (claimedHandle) {
        localStorage.setItem("claimed_handle", claimedHandle);
      }
      if (inviteCode) {
        localStorage.setItem("invite_code", inviteCode);
      }

      // Show confirmation message instead of redirecting
      setShowConfirmation(true);
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific Supabase auth errors
        if (err.message.includes("already registered")) {
          setError("An account with this email already exists. Please sign in.");
        } else if (err.message.includes("password")) {
          setError("Password must be at least 6 characters long.");
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

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendSuccess(false);
    try {
      const { error } = await clientAuth.resendConfirmationEmail(email);
      if (error) throw error;
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch {
      setError("Failed to resend email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError("");

    // Store handle and invite code for after OAuth
    if (claimedHandle) {
      localStorage.setItem("claimed_handle", claimedHandle);
    }
    if (inviteCode) {
      localStorage.setItem("invite_code", inviteCode);
    }

    try {
      const { error } = await clientAuth.signInWithGoogle();
      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  };

  // Show email confirmation screen
  if (showConfirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-6 bg-emerald-50 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Check your email
        </h1>

        <p className="text-slate-600 mb-6">
          We sent a confirmation link to<br />
          <span className="font-semibold text-slate-800">{email}</span>
        </p>

        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-sky-800">
            Click the link in your email to verify your account.
            The link will redirect you back here to complete your profile setup.
          </p>
        </div>

        {claimedHandle && (
          <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              verified.doctor/{claimedHandle} is reserved for you
            </span>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Didn&apos;t receive the email?
          </p>
          <Button
            variant="outline"
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full"
          >
            {isResending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : resendSuccess ? (
              <Check className="w-4 h-4 text-emerald-600 mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {resendSuccess ? "Email sent!" : "Resend confirmation email"}
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Wrong email?{" "}
            <button
              onClick={() => {
                setShowConfirmation(false);
                setEmail("");
                setPassword("");
              }}
              className="font-medium text-[#0099F7] hover:text-[#0080CC]"
            >
              Try again
            </button>
          </p>
        </div>
      </motion.div>
    );
  }

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
          Create your account
        </h1>
        {claimedHandle && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              verified.doctor/{claimedHandle} is reserved for you
            </span>
          </div>
        )}
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
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Dr. John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12"
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-12"
          />
          <p className="text-xs text-slate-500">Must be at least 6 characters</p>
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
              Create Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Cross-navigation */}
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <a
          href={claimedHandle ? `/sign-in?handle=${claimedHandle}` : "/sign-in"}
          className="font-semibold text-[#0099F7] hover:text-[#0080CC]"
        >
          Sign in
        </a>
      </p>
    </motion.div>
  );
}

function SignUpFormFallback() {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Create your account
        </h1>
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-slate-100 rounded-md animate-pulse" />
        <div className="h-12 bg-slate-100 rounded-md animate-pulse" />
        <div className="h-12 bg-slate-100 rounded-md animate-pulse" />
        <div className="h-12 bg-slate-100 rounded-md animate-pulse" />
      </div>
    </div>
  );
}

export function SignUpForm() {
  return (
    <Suspense fallback={<SignUpFormFallback />}>
      <SignUpFormContent />
    </Suspense>
  );
}
