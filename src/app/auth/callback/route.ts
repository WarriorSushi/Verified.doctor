import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect = requestUrl.searchParams.get("redirect");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has a profile
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("handle")
          .eq("user_id", user.id)
          .single();

        // If no profile, redirect to onboarding
        if (!profile) {
          // Check for stored handle in redirect param or localStorage via client
          const storedHandle = requestUrl.searchParams.get("handle");
          const onboardingUrl = storedHandle
            ? `/onboarding?handle=${storedHandle}`
            : "/onboarding";
          return NextResponse.redirect(new URL(onboardingUrl, requestUrl.origin));
        }

        // If custom redirect specified, validate it's a safe relative path
        if (redirect) {
          // Only allow relative paths (starting with /) and no protocol schemes
          const isRelative = redirect.startsWith("/") && !redirect.startsWith("//") && !redirect.includes(":");
          if (isRelative) {
            return NextResponse.redirect(new URL(redirect, requestUrl.origin));
          }
          // Ignore unsafe redirects, fall through to dashboard
        }

        // Default to dashboard
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
      }
    }
  }

  // Fallback to home on error
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
