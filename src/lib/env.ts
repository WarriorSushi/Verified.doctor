import { z } from "zod";

/**
 * Environment variable validation.
 * Validates all required env vars at import time and fails fast with clear errors.
 * 
 * Usage: import { env } from "@/lib/env";
 */

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().optional().default("https://verified.doctor"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Admin auth
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email").optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),
  ADMIN_JWT_SECRET: z.string().min(32, "ADMIN_JWT_SECRET must be at least 32 characters").optional(),
  ADMIN_USER_IDS: z.string().optional(),
  ADMIN_CONTACT_EMAIL: z.string().email().optional(),
  ADMIN_SUPPORT_EMAIL: z.string().email().optional(),

  // Upstash Redis (rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // Rate limiting
  RATE_LIMIT_STRICT_MODE: z.string().optional(),

  // OpenRouter (AI features)
  OPENROUTER_API_KEY: z.string().min(1).optional(),

  // Email (Resend or similar)
  RESEND_API_KEY: z.string().min(1).optional(),
});

// Validate at import time — fail fast in production
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.issues.map(
      (issue) => `  ✗ ${issue.path.join(".")}: ${issue.message}`
    );

    const message = [
      "",
      "╔══════════════════════════════════════════════════╗",
      "║  ❌ Invalid environment variables detected       ║",
      "╚══════════════════════════════════════════════════╝",
      "",
      ...errors,
      "",
      "Fix the above issues in your .env.local or production environment.",
      "",
    ].join("\n");

    // In production, fail hard. In dev, warn but continue.
    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    } else {
      console.warn(message);
    }
  }

  return parsed.data ?? (process.env as unknown as z.infer<typeof envSchema>);
}

export const env = validateEnv();

// Production-specific validations
export function validateProductionEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (process.env.NODE_ENV !== "production") {
    return { valid: true, errors: [] };
  }

  // In production, these become required
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY is required in production");
  }
  if (!process.env.ADMIN_JWT_SECRET) {
    errors.push("ADMIN_JWT_SECRET is required in production");
  }
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    errors.push("ADMIN_EMAIL and ADMIN_PASSWORD are required in production");
  }
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    errors.push("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for rate limiting in production");
  }
  if (process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD.startsWith("$2")) {
    errors.push("ADMIN_PASSWORD must be a bcrypt hash in production");
  }
  if (process.env.ADMIN_JWT_SECRET && process.env.ADMIN_JWT_SECRET.length < 32) {
    errors.push("ADMIN_JWT_SECRET must be at least 32 characters");
  }

  return { valid: errors.length === 0, errors };
}
