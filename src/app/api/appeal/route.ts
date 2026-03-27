import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { requireCsrf } from "@/lib/csrf";
import { getSupportLimiter, checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";
import { sanitizeMessage } from "@/lib/sanitize";

const appealSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});

export async function POST(request: Request) {
  try {
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError as NextResponse;

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, is_banned, full_name")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Only allow appeals from banned users
    if (!profile.is_banned) {
      return NextResponse.json(
        { error: "Appeals can only be submitted by suspended accounts" },
        { status: 400 }
      );
    }

    // Check for existing pending appeal
    const { data: existingAppeal } = await supabase
      .from("appeals")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("status", "pending")
      .single();

    if (existingAppeal) {
      return NextResponse.json(
        { error: "You already have a pending appeal. Please wait for a response." },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    const result = appealSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const message = sanitizeMessage(result.data.message);

    const limiter = getSupportLimiter();
    const rl = await checkRateLimit(limiter, user.id);
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many appeals. Try again in ${formatRetryAfter(rl.retryAfter || 60)}.` },
        { status: 429 }
      );
    }

    // Create the appeal
    const { error: insertError } = await supabase
      .from("appeals")
      .insert({
        profile_id: profile.id,
        message,
        status: "pending",
      });

    if (insertError) {
      console.error("Error creating appeal:", insertError);
      return NextResponse.json(
        { error: "Failed to submit appeal" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Appeal submitted successfully",
    });
  } catch (error) {
    console.error("Appeal submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
