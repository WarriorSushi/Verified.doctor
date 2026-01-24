"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Mail, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        throw new Error(resetError.message);
      }

      setEmailSent(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch {
      // Silently fail on resend
    } finally {
      setIsResending(false);
    }
  };

  if (emailSent) {
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
          We sent a password reset link to<br />
          <span className="font-semibold text-slate-800">{email}</span>
        </p>

        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-sky-800">
            Click the link in your email to set a new password.
            The link will expire in 1 hour.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Didn&apos;t receive the email?
          </p>
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={isResending}
            className="w-full"
          >
            {isResending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Resend reset email
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <Link
            href="/sign-in"
            className="inline-flex items-center text-sm font-medium text-[#0099F7] hover:text-[#0080CC]"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to sign in
          </Link>
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
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Reset your password
        </h1>
        <p className="text-slate-600">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

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
              <Check className="w-5 h-5 mr-2" />
              Send Reset Link
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center text-sm font-medium text-[#0099F7] hover:text-[#0080CC]"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to sign in
        </Link>
      </div>
    </motion.div>
  );
}
