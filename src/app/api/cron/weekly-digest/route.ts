import { NextResponse } from "next/server";
import { processWeeklyDigest } from "@/lib/email/weekly-digest";

/**
 * Weekly Digest Cron Job
 *
 * Called by Vercel Cron (or manually) once a week.
 * Sends weekly summary emails to all active doctors.
 *
 * Add to vercel.json:
 * {
 *   "crons": [
 *     { "path": "/api/cron/weekly-digest", "schedule": "0 9 * * 1" }
 *   ]
 * }
 *
 * Security: validates CRON_SECRET to prevent unauthorized access.
 */
export async function GET(request: Request) {
  // Validate cron secret (Vercel sets this automatically for cron jobs)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[weekly-digest] Starting weekly digest processing...");
    const result = await processWeeklyDigest();
    console.log(`[weekly-digest] Complete: ${result.sent} sent, ${result.skipped} skipped, ${result.errors} errors`);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[weekly-digest] Fatal error:", error);
    return NextResponse.json(
      { error: "Weekly digest processing failed" },
      { status: 500 }
    );
  }
}
