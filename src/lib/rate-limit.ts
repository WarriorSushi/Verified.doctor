import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { env } from "@/lib/env";

// Create Redis client - will be null if env vars not configured
let redis: Redis | null = null;
let redisWarningShown = false;

// Whether to block requests when Redis is unavailable (default: true in production)
const STRICT_MODE = process.env.RATE_LIMIT_STRICT_MODE !== "false" && process.env.NODE_ENV === "production";

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (!redisWarningShown) {
      if (STRICT_MODE) {
        console.error("[rate-limit] CRITICAL: Upstash Redis not configured in production. Requests will be blocked.");
      } else {
        console.warn("[rate-limit] Upstash Redis not configured. Rate limiting disabled in development.");
      }
      redisWarningShown = true;
    }
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

// Type for rate limit result
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Rate limiters for different use cases
// Note: These are created lazily to avoid errors when Redis is not configured

// Recommendation: 1 per IP per profile per 24 hours
export function getRecommendationLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(1, "24h"),
    prefix: "ratelimit:recommendation",
    analytics: true,
  });
}

// Messages: 5 per IP per hour
export function getMessageLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(5, "1h"),
    prefix: "ratelimit:message",
    analytics: true,
  });
}

// General API: 100 per IP per minute
export function getApiLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(100, "1m"),
    prefix: "ratelimit:api",
    analytics: true,
  });
}

// Admin login: 5 attempts per IP per 15 minutes
export function getAdminLoginLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(5, "15m"),
    prefix: "ratelimit:admin-login",
    analytics: true,
  });
}

// Analytics tracking: 10 events per IP per minute
export function getAnalyticsTrackLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(10, "1m"),
    prefix: "ratelimit:analytics-track",
    analytics: true,
  });
}

// Analytics deduplication: check if same IP+profile+event was seen within 5 minutes
// Returns true if this is a duplicate (should skip), false if it's new
export async function isAnalyticsDuplicate(
  ip: string,
  profileId: string,
  eventType: string
): Promise<boolean> {
  const redisClient = getRedis();
  if (!redisClient) return false; // can't dedup without Redis

  const key = `dedup:analytics:${ip}:${profileId}:${eventType}`;
  try {
    // SET NX with 5-minute TTL — returns null if key already exists
    const result = await redisClient.set(key, "1", { nx: true, ex: 300 });
    return result === null; // null means key existed → duplicate
  } catch (error) {
    console.error("[analytics-dedup] Redis error:", error);
    return false; // fail open for dedup
  }
}

// Handle check: 30 per IP per minute (prevent enumeration)
export function getHandleCheckLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(30, "1m"),
    prefix: "ratelimit:handle-check",
    analytics: true,
  });
}

// Profile updates: 20 per user per hour
export function getProfileUpdateLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(20, "1h"),
    prefix: "ratelimit:profile-update",
    analytics: true,
  });
}

// Connection requests: 30 per user per hour
export function getConnectionLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(30, "1h"),
    prefix: "ratelimit:connection",
    analytics: true,
  });
}

// Support/Appeal submissions: 3 per user per hour
export function getSupportLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(3, "1h"),
    prefix: "ratelimit:support",
    analytics: true,
  });
}

// Upload: 10 per user per hour
export function getUploadLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(10, "1h"),
    prefix: "ratelimit:upload",
    analytics: true,
  });
}

// AI features (enhance/suggest): 20 per user per hour
export function getAiLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(20, "1h"),
    prefix: "ratelimit:ai",
    analytics: true,
  });
}

// Notification actions: 50 per user per hour
export function getNotificationLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(50, "1h"),
    prefix: "ratelimit:notification",
    analytics: true,
  });
}

// Auth logout: 10 per user per hour (prevent abuse)
export function getLogoutLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(10, "1h"),
    prefix: "ratelimit:logout",
    analytics: true,
  });
}

// Invite creation: 10 per user per hour
export function getInviteLimiter(): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(10, "1h"),
    prefix: "ratelimit:invite",
    analytics: true,
  });
}

// Helper to get client IP from request headers
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headersList.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

// Helper function to check rate limit with configurable fallback
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
  options?: { allowOnError?: boolean }
): Promise<RateLimitResult> {
  const allowOnError = options?.allowOnError ?? !STRICT_MODE;

  // If limiter is not available (Redis not configured)
  if (!limiter) {
    if (STRICT_MODE) {
      // In strict mode (production), block requests when Redis unavailable
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: Date.now() + 60000,
        retryAfter: 60,
      };
    }
    // In development, allow requests
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }

  try {
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
    };
  } catch (error) {
    console.error("[rate-limit] Error checking rate limit:", error);
    if (allowOnError) {
      // Graceful degradation - allow request on error
      return {
        success: true,
        limit: 0,
        remaining: 0,
        reset: 0,
      };
    }
    // Strict mode - block on error
    return {
      success: false,
      limit: 0,
      remaining: 0,
      reset: Date.now() + 60000,
      retryAfter: 60,
    };
  }
}

// Format retry after time for user-friendly message
export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}

// Simple rate limit function for generic use cases
// Returns success: true if under limit, false if rate limited
export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number,
  options?: { allowOnError?: boolean }
): Promise<RateLimitResult> {
  const redisClient = getRedis();
  const allowOnError = options?.allowOnError ?? !STRICT_MODE;

  if (!redisClient) {
    if (STRICT_MODE) {
      // In strict mode (production), block requests when Redis unavailable
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: Date.now() + windowSeconds * 1000,
        retryAfter: windowSeconds,
      };
    }
    // In development, allow all requests
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests,
      reset: Date.now() + windowSeconds * 1000,
    };
  }

  try {
    const limiter = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds}s`),
      prefix: `ratelimit:generic`,
      analytics: false,
    });

    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
    };
  } catch (error) {
    console.error("[rate-limit] Error:", error);
    if (allowOnError) {
      // Graceful degradation - allow request on error
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests,
        reset: Date.now() + windowSeconds * 1000,
      };
    }
    // Strict mode - block on error
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: Date.now() + windowSeconds * 1000,
      retryAfter: windowSeconds,
    };
  }
}
