import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  getAnalyticsTrackLimiter,
  checkRateLimit,
  isAnalyticsDuplicate,
} from "@/lib/rate-limit";

const trackEventSchema = z.object({
  profileId: z.string().uuid(),
  eventType: z.enum([
    "profile_view",
    "click_save_contact",
    "click_book_appointment",
    "click_send_inquiry",
    "click_recommend",
    "click_share",
    "inquiry_sent",
    "recommendation_given",
  ]),
  viewerProfileId: z.string().uuid().optional(),
  isVerifiedViewer: z.boolean().optional(),
  sessionId: z.string().optional(),
  visitorId: z.string().optional(),
  deviceType: z.enum(["mobile", "tablet", "desktop"]).optional(),
  referrer: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = trackEventSchema.parse(body);

    // Get IP address from headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const visitorIp = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

    // Rate limit: 10 events per IP per minute
    const limiter = getAnalyticsTrackLimiter();
    const rateLimitResult = await checkRateLimit(limiter, visitorIp, {
      allowOnError: true,
    });
    if (!rateLimitResult.success) {
      // Silently drop — don't reveal rate limiting to analytics callers
      return NextResponse.json({ success: true });
    }

    // Deduplication: same IP + profile + event type within 5 minutes → skip
    const isDuplicate = await isAnalyticsDuplicate(
      visitorIp,
      validatedData.profileId,
      validatedData.eventType
    );
    if (isDuplicate) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createClient();

    // Get user agent
    const userAgent = request.headers.get("user-agent") || "";

    // Detect device type from user agent if not provided
    let deviceType = validatedData.deviceType;
    if (!deviceType) {
      const ua = userAgent.toLowerCase();
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        deviceType = "tablet";
      } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
        deviceType = "mobile";
      } else {
        deviceType = "desktop";
      }
    }

    // Generate visitor fingerprint from headers if not provided
    let visitorId = validatedData.visitorId;
    if (!visitorId) {
      const acceptLang = request.headers.get("accept-language") || "";
      const acceptEnc = request.headers.get("accept-encoding") || "";
      const fingerprintStr = `${userAgent}|${acceptLang}|${acceptEnc}`;
      let hash = 0;
      for (let i = 0; i < fingerprintStr.length; i++) {
        const char = fingerprintStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      visitorId = Math.abs(hash).toString(16);
    }

    // Insert the analytics event
    const { error } = await supabase.from("analytics_events").insert({
      profile_id: validatedData.profileId,
      event_type: validatedData.eventType,
      visitor_id: visitorId,
      visitor_ip: visitorIp,
      viewer_profile_id: validatedData.viewerProfileId || null,
      is_verified_viewer: validatedData.isVerifiedViewer || false,
      referrer: validatedData.referrer || null,
      user_agent: userAgent,
      device_type: deviceType,
      session_id: validatedData.sessionId || null,
    });

    if (error) {
      console.error("Failed to track analytics event:", error);
      // Don't return error to client - analytics should fail silently
      return NextResponse.json({ success: true });
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    // Always return success to avoid breaking the client
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }
}
