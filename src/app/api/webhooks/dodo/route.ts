import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { createClient } from "@supabase/supabase-js";

// Use service role client for webhooks (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("DODO_PAYMENTS_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const rawBody = await request.text();

  // Get webhook headers
  const headers = {
    "webhook-id": request.headers.get("webhook-id") || "",
    "webhook-signature": request.headers.get("webhook-signature") || "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") || "",
  };

  // Verify webhook signature
  try {
    const webhook = new Webhook(webhookSecret);
    await webhook.verify(rawBody, headers);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  // Parse the event
  const event = JSON.parse(rawBody);
  console.log("Dodo webhook received:", event.type, event.data?.subscription_id);

  try {
    // Idempotency check: skip if we've already processed this event
    if (event.id) {
      const { data: existingEvent } = await supabase
        .from("subscription_events")
        .select("id")
        .eq("dodo_event_id", event.id)
        .single();

      if (existingEvent) {
        console.log(`Skipping duplicate webhook event: ${event.id}`);
        return NextResponse.json({ received: true, duplicate: true });
      }
    }

    // Log event first (unique constraint prevents duplicates if race condition occurs)
    const profileId = event.data?.metadata?.profile_id;
    if (profileId && event.id) {
      const { error: insertError } = await supabase.from("subscription_events").insert({
        profile_id: profileId,
        event_type: event.type,
        dodo_subscription_id: event.data?.subscription_id,
        dodo_event_id: event.id,
        amount: event.data?.amount,
        currency: event.data?.currency,
        metadata: event.data,
      });

      // If insert fails due to duplicate, skip processing
      if (insertError?.code === "23505") {
        console.log(`Duplicate webhook event caught by constraint: ${event.id}`);
        return NextResponse.json({ received: true, duplicate: true });
      }
    }

    // Process the event
    switch (event.type) {
      case "subscription.created":
      case "subscription.active":
      case "subscription.renewed":
        await handleSubscriptionActive(event);
        break;

      case "subscription.cancelled":
        await handleSubscriptionCancelled(event);
        break;

      case "subscription.expired":
        await handleSubscriptionExpired(event);
        break;

      case "subscription.on_hold":
        await handleSubscriptionOnHold(event);
        break;

      case "subscription.plan_changed":
        await handlePlanChanged(event);
        break;

      default:
        console.log("Unhandled webhook event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionActive(event: any) {
  const profileId = event.data?.metadata?.profile_id;
  if (!profileId) {
    console.error("No profile_id in webhook metadata");
    return;
  }

  const plan = event.data?.metadata?.plan ||
    (event.data?.product_id?.includes("yearly") ? "yearly" : "monthly");

  await supabase
    .from("profiles")
    .update({
      subscription_status: "pro",
      subscription_id: event.data?.subscription_id,
      subscription_plan: plan,
      subscription_started_at: new Date().toISOString(),
      subscription_expires_at: event.data?.next_billing_date || null,
      subscription_cancelled_at: null,
    })
    .eq("id", profileId);

  console.log(`Profile ${profileId} upgraded to Pro (${plan})`);
}

async function handleSubscriptionCancelled(event: any) {
  const profileId = event.data?.metadata?.profile_id;
  if (!profileId) return;

  await supabase
    .from("profiles")
    .update({
      subscription_status: "cancelled",
      subscription_cancelled_at: new Date().toISOString(),
      // Keep expires_at - user has access until then
    })
    .eq("id", profileId);

  console.log(`Profile ${profileId} subscription cancelled`);
}

async function handleSubscriptionExpired(event: any) {
  const profileId = event.data?.metadata?.profile_id;
  if (!profileId) return;

  await supabase
    .from("profiles")
    .update({
      subscription_status: "free",
      subscription_id: null,
      subscription_plan: null,
      subscription_expires_at: null,
    })
    .eq("id", profileId);

  console.log(`Profile ${profileId} subscription expired, reverted to free`);
}

async function handleSubscriptionOnHold(event: any) {
  const profileId = event.data?.metadata?.profile_id;
  if (!profileId) return;

  // Log for monitoring - could send email to user
  console.log(`Profile ${profileId} subscription on hold (payment failed)`);

  // Optionally update status to show payment issue
  // For now, we'll keep them as Pro until it expires
}

async function handlePlanChanged(event: any) {
  const profileId = event.data?.metadata?.profile_id;
  if (!profileId) return;

  const plan = event.data?.product_id?.includes("yearly") ? "yearly" : "monthly";

  await supabase
    .from("profiles")
    .update({
      subscription_plan: plan,
      subscription_expires_at: event.data?.next_billing_date || null,
    })
    .eq("id", profileId);

  console.log(`Profile ${profileId} plan changed to ${plan}`);
}
