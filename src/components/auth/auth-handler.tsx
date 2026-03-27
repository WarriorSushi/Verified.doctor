"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Global auth handler component that:
 * 1. Handles OAuth code exchange when redirected with ?code= parameter
 * 2. Handles email confirmation redirects
 * 3. Redirects authenticated users appropriately
 */
export function AuthHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Handle OAuth errors
      if (error) {
        console.error("Auth error:", error, errorDescription);
        router.replace(`/sign-in?error=${encodeURIComponent(errorDescription || error)}`);
        return;
      }

      // Handle OAuth code exchange
      if (code && !isProcessing) {
        setIsProcessing(true);

        try {
          const supabase = createClient();
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error("Code exchange error:", exchangeError);
            router.replace("/sign-in?error=Authentication failed");
            return;
          }

          if (data.user) {
            // Check if user has a profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("handle")
              .eq("user_id", data.user.id)
              .single();

            // Get stored handle from localStorage (set during sign-up flow)
            const storedHandle = localStorage.getItem("claimed_handle");
            const storedInvite = localStorage.getItem("invite_code");

            // Clear stored values
            localStorage.removeItem("claimed_handle");
            localStorage.removeItem("invite_code");

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
              // Existing user - redirect to dashboard
              router.replace("/dashboard");
            }
          }
        } catch (err) {
          console.error("Auth callback error:", err);
          router.replace("/sign-in?error=Something went wrong");
        }
      }
    };

    handleAuthCallback();
  }, [searchParams, router, isProcessing, pathname]);

  // Show full-screen loading overlay during OAuth code exchange
  if (isProcessing || searchParams.get("code")) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0099F7]" />
          <p className="text-sm text-slate-500 font-medium">Signing you in...</p>
        </div>
      </div>
    );
  }

  return null;
}
