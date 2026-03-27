import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { sendVerificationApprovedEmail } from "@/lib/email";
import { logAdminAction, getRequestIp } from "@/lib/audit-log";
import { requireCsrf } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limit";

const actionSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError as NextResponse;

    const rl = await rateLimit("admin-verifications", 200, 60 * 60);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = actionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { action } = result.data;

    if (action === "approve") {
      // Get profile details for email
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, handle, user_id")
        .eq("id", id)
        .single();

      // Update profile to verified
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          is_verified: true,
          verification_status: "approved",
        })
        .eq("id", id);

      if (updateError) {
        console.error("Error approving verification:", updateError);
        return NextResponse.json(
          { error: "Failed to approve verification" },
          { status: 500 }
        );
      }

      // Send verification approved email
      if (profile?.user_id && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const adminClient = createAdminClient();
          const { data: { user } } = await adminClient.auth.admin.getUserById(profile.user_id);

          if (user?.email) {
            sendVerificationApprovedEmail(
              user.email,
              profile.full_name,
              profile.handle
            ).catch((err) => {
              console.error("[email] Failed to send verification approved email:", err);
            });
          }
        } catch (emailErr) {
          console.error("[email] Error fetching user email:", emailErr);
        }
      }

      // Audit log
      await logAdminAction({
        action: "verification_approved",
        targetId: id,
        targetType: "profile",
        details: {
          doctorName: profile?.full_name,
          handle: profile?.handle,
        },
        adminIp: getRequestIp(request),
      });

      return NextResponse.json({ success: true, status: "approved" });
    } else {
      // Reject - update status but don't verify
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          is_verified: false,
          verification_status: "rejected",
        })
        .eq("id", id);

      if (updateError) {
        console.error("Error rejecting verification:", updateError);
        return NextResponse.json(
          { error: "Failed to reject verification" },
          { status: 500 }
        );
      }

      // Optionally delete the verification documents
      await supabase
        .from("verification_documents")
        .delete()
        .eq("profile_id", id);

      // Audit log
      await logAdminAction({
        action: "verification_rejected",
        targetId: id,
        targetType: "profile",
        adminIp: getRequestIp(request),
      });

      return NextResponse.json({ success: true, status: "rejected" });
    }
  } catch (error) {
    console.error("Admin verification action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
