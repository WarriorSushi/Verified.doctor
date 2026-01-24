import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dodo, PRODUCTS, isDodoConfigured } from "@/lib/dodo/client";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";

const checkoutSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
});

export async function POST(request: NextRequest) {
  try {
    // Check if Dodo is configured
    if (!isDodoConfigured()) {
      return NextResponse.json(
        {
          error: "Payment system not configured",
          message: "Please set up Dodo Payments credentials",
        },
        { status: 503 }
      );
    }

    // Authenticate user
    const { userId, user } = await getAuth();
    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { plan } = checkoutSchema.parse(body);

    // Get user email from auth
    const email = user.email;

    // Get profile from database
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, subscription_status")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Check if already subscribed
    if (profile.subscription_status === "pro") {
      return NextResponse.json(
        { error: "Already subscribed to Pro" },
        { status: 400 }
      );
    }

    // Select product based on plan
    const productId = plan === "yearly" ? PRODUCTS.PRO_YEARLY : PRODUCTS.PRO_MONTHLY;

    // Create checkout session with Dodo
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: email || "",
        name: profile.full_name,
      },
      metadata: {
        profile_id: profile.id,
        user_id: userId,
        plan: plan,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://verified.doctor"}/dashboard?upgraded=true`,
    });

    return NextResponse.json({
      checkoutUrl: session.checkout_url,
      sessionId: session.session_id,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
