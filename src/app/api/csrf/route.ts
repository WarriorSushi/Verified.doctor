import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/csrf";

/**
 * GET /api/csrf - Get a fresh CSRF token.
 * The token is set in both the response body and a cookie.
 * Client should send it back in the X-CSRF-Token header for state-changing requests.
 */
export async function GET() {
  try {
    const token = await generateCsrfToken();
    return NextResponse.json({ token });
  } catch (error) {
    console.error("CSRF token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}
