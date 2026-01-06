"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleConfirmation = async () => {
      const supabase = createClient();

      // Check if we have a session (means confirmation was successful)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setStatus("error");
        setError(sessionError.message);
        return;
      }

      if (session) {
        // User is confirmed and logged in
        setStatus("success");

        // Check if user has a profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("handle")
          .eq("user_id", session.user.id)
          .single();

        // Get stored handle from localStorage
        const storedHandle = localStorage.getItem("claimed_handle");
        const storedInvite = localStorage.getItem("invite_code");

        // Redirect after short delay to show success message
        setTimeout(() => {
          if (!profile) {
            // New user - redirect to onboarding
            let onboardingUrl = "/onboarding";
            if (storedHandle) {
              onboardingUrl += `?handle=${storedHandle}`;
              if (storedInvite) {
                onboardingUrl += `&invite=${storedInvite}`;
              }
            } else if (storedInvite) {
              onboardingUrl += `?invite=${storedInvite}`;
            }
            router.replace(onboardingUrl);
          } else {
            router.replace("/dashboard");
          }
        }, 2000);
      } else {
        // No session - might be an error or user needs to sign in
        setStatus("error");
        setError("Could not verify your email. Please try signing in.");
      }
    };

    handleConfirmation();
  }, [router, searchParams]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 text-center"
    >
      {status === "loading" && (
        <>
          <div className="w-16 h-16 mx-auto mb-6 bg-sky-50 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Verifying your email...
          </h1>
          <p className="text-slate-600">
            Please wait while we confirm your account.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 mx-auto mb-6 bg-emerald-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Email Verified!
          </h1>
          <p className="text-slate-600 mb-4">
            Your account has been confirmed. Redirecting you now...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Redirecting...</span>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Verification Failed
          </h1>
          <p className="text-slate-600 mb-6">
            {error || "Something went wrong. Please try again."}
          </p>
          <Button
            onClick={() => router.push("/sign-in")}
            className="bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white"
          >
            Go to Sign In
          </Button>
        </>
      )}
    </motion.div>
  );
}

function ConfirmFallback() {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-6 bg-sky-50 rounded-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Verifying your email...
      </h1>
      <p className="text-slate-600">
        Please wait while we confirm your account.
      </p>
    </div>
  );
}

export function ConfirmHandler() {
  return (
    <Suspense fallback={<ConfirmFallback />}>
      <ConfirmContent />
    </Suspense>
  );
}
