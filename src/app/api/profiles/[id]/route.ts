import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { sanitizeName, sanitizeBio, sanitizeText, sanitizeUrl, stripHtml } from "@/lib/sanitize";
import { getProfileUpdateLimiter, checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";
import { createLogger } from "@/lib/logger";
import { requireCsrf } from "@/lib/csrf";

const log = createLogger("api:profiles:id");

// Schema for education timeline items
const educationItemSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  year: z.string(),
});

// Schema for hospital affiliation items
const hospitalItemSchema = z.object({
  name: z.string(),
  role: z.string(),
  department: z.string().optional(),
});

// Schema for case study items
const caseStudyItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  outcome: z.string().optional(),
});

// Schema for gallery image items
const galleryImageSchema = z.object({
  url: z.string(),
  caption: z.string().optional(),
});

// Schema for professional membership items
const membershipItemSchema = z.object({
  organization: z.string(),
  year: z.string().optional(),
});

// Schema for media/publication items
const mediaItemSchema = z.object({
  title: z.string(),
  publication: z.string(),
  link: z.string().optional(),
  year: z.string().optional(),
});

// Schema for section visibility
const sectionVisibilitySchema = z.record(z.string(), z.boolean()).optional();

const updateProfileSchema = z.object({
  // Basic fields
  fullName: z.string().min(2).max(100).optional(),
  specialty: z.string().optional(),
  clinicName: z.string().nullable().optional(),
  clinicLocation: z.string().nullable().optional(),
  yearsExperience: z.number().min(0).max(70).nullable().optional(),
  profilePhotoUrl: z.string().url().nullable().optional(),
  externalBookingUrl: z.string().url().nullable().optional(),
  profileTemplate: z.enum(["classic", "ocean", "sage", "warm", "executive", "hero", "timeline"]).optional(),
  profileLayout: z.enum(["classic", "hero", "timeline", "magazine", "grid", "minimal"]).optional(),
  profileTheme: z.enum(["blue", "ocean", "sage", "warm", "teal", "executive"]).optional(),
  bio: z.string().max(2000).nullable().optional(),
  qualifications: z.string().max(1000).nullable().optional(),
  languages: z.string().max(500).nullable().optional(),
  consultationFee: z.string().max(100).nullable().optional(),
  services: z.string().max(1000).nullable().optional(),
  registrationNumber: z.string().max(100).nullable().optional(),

  // New profile builder fields
  videoIntroductionUrl: z.string().refine((val) => val === "" || val === null || z.string().url().safeParse(val).success, { message: "Invalid URL" }).nullable().optional(),
  approachToCare: z.string().max(2000).nullable().optional(),
  firstVisitGuide: z.string().max(2000).nullable().optional(),
  availabilityNote: z.string().max(500).nullable().optional(),
  conditionsTreated: z.string().max(2000).nullable().optional(),
  proceduresPerformed: z.string().max(2000).nullable().optional(),

  // Boolean fields
  isAvailable: z.boolean().optional(),
  offersTelemedicine: z.boolean().optional(),

  // JSONB array fields
  educationTimeline: z.array(educationItemSchema).optional(),
  hospitalAffiliations: z.array(hospitalItemSchema).optional(),
  caseStudies: z.array(caseStudyItemSchema).optional(),
  clinicGallery: z.array(galleryImageSchema).optional(),
  professionalMemberships: z.array(membershipItemSchema).optional(),
  mediaPublications: z.array(mediaItemSchema).optional(),

  // Section visibility
  sectionVisibility: sectionVisibilitySchema,
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const csrfError = await requireCsrf(request);
    if (csrfError) {
      return csrfError as NextResponse;
    }

    // Rate limit profile updates
    const limiter = getProfileUpdateLimiter();
    const rateLimitResult = await checkRateLimit(limiter, userId);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many updates. Please try again in ${formatRetryAfter(rateLimitResult.retryAfter || 60)}.` },
        { status: 429 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify ownership and get handle for cache revalidation
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, user_id, handle")
      .eq("id", id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build update object with field mapping
    const fieldMapping: Record<string, string> = {
      fullName: "full_name",
      specialty: "specialty",
      clinicName: "clinic_name",
      clinicLocation: "clinic_location",
      yearsExperience: "years_experience",
      profilePhotoUrl: "profile_photo_url",
      externalBookingUrl: "external_booking_url",
      profileTemplate: "profile_template",
      profileLayout: "profile_layout",
      profileTheme: "profile_theme",
      bio: "bio",
      qualifications: "qualifications",
      languages: "languages",
      consultationFee: "consultation_fee",
      services: "services",
      registrationNumber: "registration_number",
      videoIntroductionUrl: "video_introduction_url",
      approachToCare: "approach_to_care",
      firstVisitGuide: "first_visit_guide",
      availabilityNote: "availability_note",
      conditionsTreated: "conditions_treated",
      proceduresPerformed: "procedures_performed",
      isAvailable: "is_available",
      offersTelemedicine: "offers_telemedicine",
      educationTimeline: "education_timeline",
      hospitalAffiliations: "hospital_affiliations",
      caseStudies: "case_studies",
      clinicGallery: "clinic_gallery",
      professionalMemberships: "professional_memberships",
      mediaPublications: "media_publications",
      sectionVisibility: "section_visibility",
    };

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const textSanitizers: Partial<Record<keyof typeof result.data, (value: string) => string>> = {
      fullName: sanitizeName,
      specialty: sanitizeText,
      clinicName: sanitizeText,
      clinicLocation: sanitizeText,
      bio: sanitizeBio,
      qualifications: sanitizeText,
      languages: sanitizeText,
      consultationFee: sanitizeText,
      services: sanitizeBio,
      registrationNumber: sanitizeText,
      videoIntroductionUrl: sanitizeUrl,
      approachToCare: sanitizeBio,
      firstVisitGuide: sanitizeBio,
      availabilityNote: sanitizeText,
      conditionsTreated: sanitizeBio,
      proceduresPerformed: sanitizeBio,
    };

    // Map all provided fields to database columns with sanitization
    for (const [key, dbColumn] of Object.entries(fieldMapping)) {
      const typedKey = key as keyof typeof result.data;
      const value = result.data[typedKey];
      if (value !== undefined) {
        if (typeof value === "string") {
          const sanitizer = textSanitizers[typedKey];
          updates[dbColumn] = sanitizer ? sanitizer(value) : stripHtml(value);
        } else if (value === null) {
          updates[dbColumn] = null;
        } else if (Array.isArray(value)) {
          updates[dbColumn] = value.map((item) => {
            if (typeof item !== "object" || !item) return item;
            return Object.fromEntries(
              Object.entries(item).map(([itemKey, itemValue]) => [
                itemKey,
                typeof itemValue === "string"
                  ? (itemKey === "url" || itemKey === "link"
                      ? sanitizeUrl(itemValue)
                      : sanitizeText(itemValue, true))
                  : itemValue,
              ])
            );
          });
        } else if (typeof value === "object" && value !== null) {
          updates[dbColumn] = Object.fromEntries(
            Object.entries(value).map(([objKey, objValue]) => [
              objKey,
              typeof objValue === "string" ? sanitizeText(objValue) : objValue,
            ])
          );
        } else {
          updates[dbColumn] = value;
        }
      }
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      log.error("Failed to update profile", updateError, { profileId: id, userId });
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Revalidate the public profile page cache so changes appear immediately
    revalidatePath(`/${profile.handle}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error("Profile update error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { userId } = await getAuth();
    const supabase = await createClient();

    // Define public fields that anyone can access
    const publicFields = `
      id, handle, full_name, specialty, bio, qualifications,
      years_experience, clinic_name, clinic_location, languages,
      consultation_fee, services, profile_photo_url, external_booking_url,
      is_verified, recommendation_count, connection_count,
      profile_template, profile_layout, profile_theme,
      video_introduction_url, approach_to_care, first_visit_guide,
      availability_note, conditions_treated, procedures_performed,
      is_available, offers_telemedicine, education_timeline,
      hospital_affiliations, case_studies, clinic_gallery,
      professional_memberships, media_publications, section_visibility,
      achievement_badges
    `;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(publicFields)
      .eq("id", id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // If the requester is the owner, include additional private fields
    if (userId && profile.id) {
      const { data: ownerCheck } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("id", id)
        .single();

      if (ownerCheck?.user_id === userId) {
        // Return full profile for owner - refetch with all fields
        const { data: fullProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        return NextResponse.json({ profile: fullProfile, isOwner: true });
      }
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
