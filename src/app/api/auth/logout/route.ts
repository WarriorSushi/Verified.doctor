import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireCsrf } from "@/lib/csrf";
import { getLogoutLimiter, checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError as NextResponse;

    const ip = await getClientIp();
    const limiter = getLogoutLimiter();
    const rl = await checkRateLimit(limiter, ip);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
