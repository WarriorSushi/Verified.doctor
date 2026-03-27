import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { isBannedHandle } from "@/lib/banned-handles";
import { sendWelcomeEmail, sendTrialOfferEmail } from "@/lib/email";
import { sanitizeName, sanitizeBio, sanitizeText } from "@/lib/sanitize";
import { getProfileUpdateLimiter, getClientIp, checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";
import { createLogger } from "@/lib/logger";



const createProfileSchema = z.object({
  handle: z
    .string()
    .min(3, "Handle must be at least 3 characters")
    .max(30, "Handle must be at most 30 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Handle can only contain lowercase letters, numbers, and hyphens"
    )
    .refine((h) => !h.startsWith("-") && !h.endsWith("-"), {
      message: "Handle cannot start or end with a hyphen",
    })
    .refine((h) => !h.includes("--"), {
      message: "Handle cannot contain consecutive hyphens",
    }),
  fullName: z.string().min(2, "Full name is required").max(100),
  specialty: z.string().min(2, "Specialty is required"),
  clinicName: z.string().optional(),
  clinicLocation: z.string().optional(),
  yearsExperience: z.number().min(0).max(70).optional(),
  profilePhotoUrl: z.string().url().optional().or(z.literal("")),
  externalBookingUrl: z.string().url().optional().or(z.literal("")),
  inviteCode: z.string().optional(),
  // New enhanced fields
  bio: z.string().max(500).optional(),
  qualifications: z.string().max(200).optional(),
  languages: z.string().max(200).optional(),
  registrationNumber: z.string().max(100).optional(),
  consultationFee: z.string().max(50).optional(),
  services: z.string().max(500).optional(),
  profileLayout: z.enum(["classic", "hero", "timeline", "magazine", "grid", "minimal"]).optional(),
  profileTheme: z.enum(["blue", "ocean", "sage", "warm", "teal", "executive"]).optional(),
});

export async function POST(request: Request) {
  try {
    const { userId, user } = await getAuth();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit profile creation
    const ip = await getClientIp();
    const limiter = getProfileUpdateLimiter();
    const rateLimitResult = await checkRateLimit(limiter, `${userId}:${ip}`);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${formatRetryAfter(rateLimitResult.retryAfter || 60)}.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = createProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.issues[0]?.message || "Invalid data",
        },
        { status: 400 }
      );
    }

    const {
      handle,
      fullName: rawFullName,
      specialty: rawSpecialty,
      clinicName: rawClinicName,
      clinicLocation: rawClinicLocation,
      yearsExperience,
      profilePhotoUrl,
      externalBookingUrl,
      inviteCode,
      bio: rawBio,
      qualifications: rawQualifications,
      languages: rawLanguages,
      registrationNumber: rawRegistrationNumber,
      consultationFee: rawConsultationFee,
      services: rawServices,
      profileLayout,
      profileTheme,
    } = result.data;

    // Sanitize all user-submitted text fields
    const fullName = sanitizeName(rawFullName);
    const specialty = sanitizeText(rawSpecialty || "");
    const clinicName = rawClinicName ? sanitizeText(rawClinicName) : undefined;
    const clinicLocation = rawClinicLocation ? sanitizeText(rawClinicLocation) : undefined;
    const bio = rawBio ? sanitizeBio(rawBio) : undefined;
    const qualifications = rawQualifications ? sanitizeText(rawQualifications) : undefined;
    const languages = rawLanguages ? sanitizeText(rawLanguages) : undefined;
    const registrationNumber = rawRegistrationNumber ? sanitizeText(rawRegistrationNumber) : undefined;
    const consultationFee = rawConsultationFee ? sanitizeText(rawConsultationFee) : undefined;
    const services = rawServices ? sanitizeText(rawServices) : undefined;

    // Re-validate sanitized name has content
    if (fullName.length < 2) {
      return NextResponse.json(
        { error: "Full name is required (at least 2 characters)" },
        { status: 400 }
      );
    }

    // Check if handle is banned
    if (isBannedHandle(handle)) {
      return NextResponse.json(
        { error: "This handle is not available" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if handle is already taken
    const { data: existingHandle } = await supabase
      .from("profiles")
      .select("handle")
      .eq("handle", handle)
      .single();

    if (existingHandle) {
      return NextResponse.json(
        { error: "This handle is already taken" },
        { status: 400 }
      );
    }

    // Check if user already has a profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: "You already have a profile" },
        { status: 400 }
      );
    }

    // Create the profile
    // Note: Database has unique constraints on both 'handle' and 'user_id'
    // We catch constraint violations to handle race conditions
    const { data: profile, error } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        handle: handle.toLowerCase(),
        full_name: fullName,
        specialty,
        clinic_name: clinicName || null,
        clinic_location: clinicLocation || null,
        years_experience: yearsExperience || null,
        profile_photo_url: profilePhotoUrl || null,
        external_booking_url: externalBookingUrl || null,
        bio: bio || null,
        qualifications: qualifications || null,
        languages: languages || null,
        registration_number: registrationNumber || null,
        consultation_fee: consultationFee || null,
        services: services || null,
        profile_layout: profileLayout || "classic",
        profile_theme: profileTheme || "blue",
        is_verified: false,
        verification_status: "none",
        recommendation_count: 0,
        connection_count: 0,
        view_count: 0,
        // Trial system: All new users are eligible for the free trial
        trial_status: "eligible",
        trial_invites_required: 2,
        trial_invites_completed: 0,
        trial_offer_shown_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);

      // Handle unique constraint violations (race conditions)
      // Postgres error code 23505 = unique_violation
      if (error.code === "23505") {
        // Check which constraint was violated
        if (error.message?.includes("handle")) {
          return NextResponse.json(
            { error: "This handle was just claimed by someone else. Please try a different one." },
            { status: 409 }
          );
        }
        if (error.message?.includes("user_id")) {
          return NextResponse.json(
            { error: "You already have a profile" },
            { status: 409 }
          );
        }
        // Generic unique constraint violation
        return NextResponse.json(
          { error: "This handle is already taken" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    // Handle invite code - auto-connect with inviter
    let connectedWith = null;
    let connectionError: string | null = null;

    if (inviteCode) {
      try {
        // Find the invite
        const { data: invite, error: inviteQueryError } = await supabase
          .from("invites")
          .select(`
            id,
            inviter_profile_id,
            used,
            expires_at,
            inviter:profiles!invites_inviter_profile_id_fkey(
              id, full_name, handle
            )
          `)
          .eq("invite_code", inviteCode)
          .single();

        if (inviteQueryError) {
          console.warn("[profiles] Invite lookup failed:", inviteQueryError);
          connectionError = "Could not find invite";
        } else if (!invite) {
          connectionError = "Invite not found";
        } else if (invite.used) {
          connectionError = "This invite has already been used";
        } else if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
          connectionError = "This invite has expired";
        } else {
          // Check for existing connection (duplicate check)
          const { data: existingConnection } = await supabase
            .from("connections")
            .select("id")
            .or(`and(requester_id.eq.${invite.inviter_profile_id},receiver_id.eq.${profile.id}),and(requester_id.eq.${profile.id},receiver_id.eq.${invite.inviter_profile_id})`)
            .single();

          if (existingConnection) {
            connectionError = "Already connected with inviter";
            connectedWith = invite.inviter;
          } else {
            // Create connection between inviter and new user
            const { error: connError } = await supabase
              .from("connections")
              .insert({
                requester_id: invite.inviter_profile_id,
                receiver_id: profile.id,
                status: "accepted",
              });

            if (connError) {
              console.error("[profiles] Connection creation failed:", connError);
              connectionError = "Failed to create connection";
            } else {
              // Mark invite as used
              await supabase
                .from("invites")
                .update({
                  used: true,
                  used_by_profile_id: profile.id,
                })
                .eq("id", invite.id);

              // Increment connection counts for both (with error handling)
              try {
                await supabase.rpc("increment_connection_counts", {
                  profile1_uuid: invite.inviter_profile_id,
                  profile2_uuid: profile.id,
                });
              } catch (rpcError) {
                // Fallback: manually increment counts if RPC fails
                console.warn("[profiles] RPC increment failed, using fallback:", rpcError);

                // First get the inviter's current count
                const { data: inviterProfile } = await supabase
                  .from("profiles")
                  .select("connection_count")
                  .eq("id", invite.inviter_profile_id)
                  .single();

                await Promise.all([
                  supabase
                    .from("profiles")
                    .update({ connection_count: (profile.connection_count || 0) + 1 })
                    .eq("id", profile.id),
                  supabase
                    .from("profiles")
                    .update({ connection_count: (inviterProfile?.connection_count || 0) + 1 })
                    .eq("id", invite.inviter_profile_id),
                ]).catch((fallbackError) => {
                  console.error("[profiles] Fallback increment also failed:", fallbackError);
                });
              }

              connectedWith = invite.inviter;

              // Track trial invite for the inviter
              try {
                // Get inviter's trial status
                const { data: inviterTrialData } = await supabase
                  .from("profiles")
                  .select("trial_status, trial_invites_required, trial_invites_completed, full_name")
                  .eq("id", invite.inviter_profile_id)
                  .single();

                if (inviterTrialData && inviterTrialData.trial_status === "eligible") {
                  // Record the trial invite
                  await supabase.from("trial_invites").insert({
                    profile_id: invite.inviter_profile_id,
                    invite_code: inviteCode,
                    invitee_profile_id: profile.id,
                    completed_at: new Date().toISOString(),
                  });

                  // Increment trial invites completed
                  const newCompleted = (inviterTrialData.trial_invites_completed || 0) + 1;
                  const required = inviterTrialData.trial_invites_required || 2;

                  if (newCompleted >= required) {
                    // Activate the trial!
                    const now = new Date();
                    const expiresAt = new Date(now);
                    expiresAt.setDate(expiresAt.getDate() + 30);

                    await supabase
                      .from("profiles")
                      .update({
                        trial_status: "active",
                        trial_invites_completed: newCompleted,
                        trial_started_at: now.toISOString(),
                        trial_expires_at: expiresAt.toISOString(),
                      })
                      .eq("id", invite.inviter_profile_id);

                    // Note: Email notification would require looking up their
                    // email from Clerk. They'll see the trial is active when
                    // they next log in to their dashboard.
                  } else {
                    // Just increment the count
                    await supabase
                      .from("profiles")
                      .update({
                        trial_invites_completed: newCompleted,
                      })
                      .eq("id", invite.inviter_profile_id);
                  }
                }
              } catch (trialError) {
                // Don't fail profile creation if trial tracking fails
                console.error("[profiles] Trial tracking error:", trialError);
              }
            }
          }
        }
      } catch (inviteError) {
        console.error("[profiles] Invite processing error:", inviteError);
        connectionError = "Failed to process invite";
      }
    }

    // Send welcome email (async, don't block response)
    if (user.email) {
      sendWelcomeEmail(user.email, fullName, handle).catch((err) => {
        console.error("[email] Failed to send welcome email:", err);
      });

      // Send trial offer email (async, don't block response)
      // Delay slightly so welcome email arrives first
      setTimeout(() => {
        sendTrialOfferEmail(user.email!, fullName, handle).catch((err) => {
          console.error("[email] Failed to send trial offer email:", err);
        });
      }, 5000); // 5 second delay
    }

    return NextResponse.json({
      success: true,
      profile,
      connectedWith,
      connectionError,
      message: `Your profile is live at verified.doctor/${handle}`,
    });
  } catch (error) {
    console.error("Create profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
