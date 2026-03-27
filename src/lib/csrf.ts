import { randomBytes, createHmac } from "crypto";
import { cookies } from "next/headers";

/**
 * CSRF protection for state-changing operations.
 * 
 * Uses a double-submit cookie pattern:
 * 1. A CSRF token is stored in an HttpOnly cookie
 * 2. The same token must be sent in the X-CSRF-Token header
 * 3. The server validates they match
 * 
 * This works because:
 * - An attacker can't read the cookie value (HttpOnly + SameSite)
 * - An attacker can't set the header from a cross-origin request
 * - The cookie is automatically sent, but the header must be explicitly set
 */

const CSRF_COOKIE_NAME = "__csrf";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_SECRET = process.env.ADMIN_JWT_SECRET || process.env.CSRF_SECRET || "dev-csrf-secret-change-in-production";
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 4; // 4 hours

/**
 * Generate a CSRF token and set it as a cookie.
 * Returns the token to be included in API calls.
 */
export async function generateCsrfToken(): Promise<string> {
  const tokenBytes = randomBytes(32);
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = `${tokenBytes.toString("hex")}.${timestamp}`;
  
  // HMAC the payload with the secret for integrity
  const signature = createHmac("sha256", CSRF_SECRET)
    .update(payload)
    .digest("hex");
  
  const token = `${payload}.${signature}`;

  // Set the token in a cookie
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: TOKEN_EXPIRY_SECONDS,
  });

  return token;
}

/**
 * Validate a CSRF token from the request header against the cookie.
 * Returns true if valid, false otherwise.
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  try {
    // Get token from header
    const headerToken = request.headers.get(CSRF_HEADER_NAME);
    if (!headerToken) {
      return false;
    }

    // Get token from cookie
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
    if (!cookieToken) {
      return false;
    }

    // Tokens must match (double-submit pattern)
    if (headerToken !== cookieToken) {
      return false;
    }

    // Validate token structure and signature
    const parts = headerToken.split(".");
    if (parts.length !== 3) {
      return false;
    }

    const [tokenHex, timestampStr, signature] = parts;
    
    // Verify signature
    const payload = `${tokenHex}.${timestampStr}`;
    const expectedSignature = createHmac("sha256", CSRF_SECRET)
      .update(payload)
      .digest("hex");

    // Timing-safe comparison
    if (signature.length !== expectedSignature.length) {
      return false;
    }
    
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    // Use constant-time comparison via crypto.timingSafeEqual
    const { timingSafeEqual } = await import("crypto");
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) {
      return false;
    }

    // Check expiry
    const timestamp = parseInt(timestampStr, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - timestamp > TOKEN_EXPIRY_SECONDS) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Middleware-style CSRF check.
 * Returns null if valid, or a NextResponse with 403 if invalid.
 * 
 * Usage in API routes:
 *   const csrfError = await requireCsrf(request);
 *   if (csrfError) return csrfError;
 */
export async function requireCsrf(request: Request): Promise<Response | null> {
  const isValid = await validateCsrfToken(request);
  
  if (!isValid) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing CSRF token" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return null;
}

/**
 * API route to get a fresh CSRF token.
 * Call GET /api/csrf to get a token for subsequent state-changing requests.
 */
export { CSRF_HEADER_NAME, CSRF_COOKIE_NAME };
