import { notFound } from "next/navigation";
import { cache } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  ClassicTemplate,
  HeroTemplate,
  TimelineTemplate,
  MagazineTemplate,
  GridTemplate,
  MinimalTemplate,
} from "@/components/profile/templates";
import { getTheme } from "@/lib/theme-config";
import { formatDoctorTitle, extractFirstName } from "@/lib/utils";
import { PauseCircle } from "lucide-react";
import type { Metadata } from "next";

// Route segment config for caching - revalidate every 60 seconds
export const revalidate = 60;

const baseUrl = "https://verified.doctor";

// Extended profile type including new fields from migration
interface ExtendedProfile {
  id: string;
  handle: string;
  full_name: string;
  specialty: string | null;
  bio: string | null;
  qualifications: string | null;
  years_experience: number | null;
  registration_number: string | null;
  clinic_name: string | null;
  clinic_location: string | null;
  languages: string | null;
  consultation_fee: string | null;
  services: string | null;
  profile_photo_url: string | null;
  external_booking_url: string | null;
  is_verified: boolean;
  recommendation_count: number;
  connection_count: number;
  profile_template: string | null;
  profile_layout: string | null;
  profile_theme: string | null;
  is_frozen: boolean | null;
  // Profile builder fields
  video_introduction_url: string | null;
  approach_to_care: string | null;
  first_visit_guide: string | null;
  availability_note: string | null;
  conditions_treated: string | null;
  procedures_performed: string | null;
  is_available: boolean | null;
  offers_telemedicine: boolean | null;
  education_timeline: unknown;
  hospital_affiliations: unknown;
  case_studies: unknown;
  clinic_gallery: unknown;
  professional_memberships: unknown;
  media_publications: unknown;
  section_visibility: unknown;
}

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

// Cached profile fetch - deduplicates between page and metadata
const getProfileByHandle = cache(async (handle: string) => {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle.toLowerCase())
    .single();

  if (error || !profile) {
    return null;
  }

  return profile as unknown as ExtendedProfile;
});

// Generate JSON-LD structured data for a doctor profile
function generateDoctorJsonLd(profile: ExtendedProfile) {
  const profileUrl = `${baseUrl}/${profile.handle}`;

  // Parse education timeline for credentials
  const educationTimeline = Array.isArray(profile.education_timeline)
    ? profile.education_timeline
    : [];

  // Parse hospital affiliations
  const hospitalAffiliations = Array.isArray(profile.hospital_affiliations)
    ? profile.hospital_affiliations
    : [];

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": profileUrl,
    name: profile.full_name,
    url: profileUrl,
    description: profile.bio || `${profile.specialty || "Medical Professional"} ${profile.clinic_location ? `practicing in ${profile.clinic_location}` : ""}`,
  };

  // Add profile image
  if (profile.profile_photo_url) {
    jsonLd.image = {
      "@type": "ImageObject",
      url: profile.profile_photo_url,
    };
  }

  // Add medical specialty
  if (profile.specialty) {
    jsonLd.medicalSpecialty = profile.specialty;
    jsonLd.jobTitle = profile.specialty;
  }

  // Add qualifications/credentials
  if (profile.qualifications) {
    jsonLd.hasCredential = {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Medical Qualification",
      name: profile.qualifications,
    };
  }

  // Add registration number
  if (profile.registration_number) {
    jsonLd.identifier = {
      "@type": "PropertyValue",
      name: "Medical Registration Number",
      value: profile.registration_number,
    };
  }

  // Add workplace/clinic
  if (profile.clinic_name || profile.clinic_location) {
    jsonLd.workLocation = {
      "@type": "MedicalClinic",
      name: profile.clinic_name || "Medical Practice",
      address: profile.clinic_location ? {
        "@type": "PostalAddress",
        addressLocality: profile.clinic_location,
      } : undefined,
    };
  }

  // Add hospital affiliations
  if (hospitalAffiliations.length > 0) {
    jsonLd.hospitalAffiliation = hospitalAffiliations.map((h: { name?: string; role?: string }) => ({
      "@type": "Hospital",
      name: h.name || "Hospital",
    }));
  }

  // Add languages spoken
  if (profile.languages) {
    jsonLd.knowsLanguage = profile.languages.split(",").map((lang: string) => lang.trim());
  }

  // Add services offered
  if (profile.services) {
    jsonLd.availableService = profile.services.split(",").map((service: string) => ({
      "@type": "MedicalProcedure",
      name: service.trim(),
    }));
  }

  // Add conditions treated
  if (profile.conditions_treated) {
    jsonLd.expertiseLevel = profile.conditions_treated;
  }

  // Add telemedicine availability
  if (profile.offers_telemedicine) {
    jsonLd.isAcceptingNewPatients = profile.is_available !== false;
    jsonLd.availableService = [
      ...(jsonLd.availableService as Array<unknown> || []),
      {
        "@type": "MedicalProcedure",
        name: "Telemedicine Consultation",
      },
    ];
  }

  // Add years of experience
  if (profile.years_experience) {
    jsonLd.yearsInOperation = profile.years_experience;
  }

  // Add consultation fee
  if (profile.consultation_fee) {
    jsonLd.priceRange = profile.consultation_fee;
  }

  // Add booking URL
  if (profile.external_booking_url) {
    jsonLd.potentialAction = {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: profile.external_booking_url,
      },
      result: {
        "@type": "Reservation",
        name: "Medical Appointment",
      },
    };
  }

  // Add verified status
  if (profile.is_verified) {
    jsonLd.award = "Verified Doctor";
  }

  // Add aggregate rating based on recommendations
  if (profile.recommendation_count > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: "5",
      ratingCount: profile.recommendation_count.toString(),
      bestRating: "5",
      worstRating: "1",
    };
  }

  // Add education timeline
  if (educationTimeline.length > 0) {
    jsonLd.alumniOf = educationTimeline.map((edu: { institution?: string; degree?: string; year?: string }) => ({
      "@type": "EducationalOrganization",
      name: edu.institution || "Medical Institution",
    }));
  }

  return jsonLd;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;
  const supabase = await createClient();

  // Fetch profile (cached)
  const extendedProfile = await getProfileByHandle(handle);

  if (!extendedProfile) {
    notFound();
  }

  // If profile is frozen, show unavailable page
  if (extendedProfile.is_frozen) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/verified-doctor-logo.svg"
                  alt="Verified.Doctor"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-semibold text-slate-800 tracking-tight">
                verified<span className="text-[#0099F7]">.doctor</span>
              </span>
            </Link>
          </div>
        </header>

        {/* Frozen Profile Message */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <PauseCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Profile Unavailable
            </h1>
            <p className="text-slate-600 mb-6">
              This doctor&apos;s profile is currently offline. They may have temporarily paused their listing.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#0099F7] text-white font-medium hover:bg-[#0080CC] transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Increment view count (fire and forget, with error logging)
  supabase.rpc("increment_view_count", { profile_uuid: extendedProfile.id })
    .then(() => {}, (err) => console.error("Failed to increment view count:", err));

  // Fetch connections and invites in parallel for better performance
  const [connectionsResult, inviteResult] = await Promise.all([
    // Fetch connected doctors - use separate queries to avoid SQL injection via .or()
    Promise.all([
      supabase
        .from("connections")
        .select(`
          requester_id,
          receiver_id,
          requester:profiles!connections_requester_id_fkey(
            id, full_name, specialty, handle, profile_photo_url
          ),
          receiver:profiles!connections_receiver_id_fkey(
            id, full_name, specialty, handle, profile_photo_url
          )
        `)
        .eq("requester_id", extendedProfile.id)
        .eq("status", "accepted"),
      supabase
        .from("connections")
        .select(`
          requester_id,
          receiver_id,
          requester:profiles!connections_requester_id_fkey(
            id, full_name, specialty, handle, profile_photo_url
          ),
          receiver:profiles!connections_receiver_id_fkey(
            id, full_name, specialty, handle, profile_photo_url
          )
        `)
        .eq("receiver_id", extendedProfile.id)
        .eq("status", "accepted"),
    ]).then(([r1, r2]) => ({
      data: [...(r1.data || []), ...(r2.data || [])],
    })),

    // Fetch inviter info (if this profile was created via invite)
    supabase
      .from("invites")
      .select(`
        inviter:profiles!invites_inviter_profile_id_fkey(
          id, full_name, specialty, handle
        )
      `)
      .eq("used_by_profile_id", extendedProfile.id)
      .single(),
  ]);

  const connections = connectionsResult.data;
  const inviteData = inviteResult.data;

  const invitedBy = inviteData?.inviter as {
    id: string;
    full_name: string;
    specialty: string | null;
    handle: string;
  } | null;

  // Extract connected doctors (exclude self)
  const connectedDoctors = (connections || []).map((conn) => {
    if (conn.requester_id === extendedProfile.id) {
      return conn.receiver;
    }
    return conn.requester;
  }).filter(Boolean) as Array<{
    id: string;
    full_name: string;
    specialty: string | null;
    handle: string;
    profile_photo_url: string | null;
  }>;

  // Generate JSON-LD structured data
  const jsonLd = generateDoctorJsonLd(extendedProfile);

  // Get layout and theme - use new system if available, fallback to old template field
  const layout = extendedProfile.profile_layout || "classic";
  const themeId = extendedProfile.profile_theme || "blue";
  const theme = getTheme(themeId);

  const TemplateWithJsonLd = ({ children }: { children: React.ReactNode }) => (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );

  // Route to the correct layout template, passing the theme
  switch (layout) {
    case "hero":
      return (
        <TemplateWithJsonLd>
          <HeroTemplate profile={extendedProfile} connectedDoctors={connectedDoctors} invitedBy={invitedBy} theme={theme} />
        </TemplateWithJsonLd>
      );
    case "timeline":
      return (
        <TemplateWithJsonLd>
          <TimelineTemplate profile={extendedProfile} connectedDoctors={connectedDoctors} invitedBy={invitedBy} theme={theme} />
        </TemplateWithJsonLd>
      );
    case "magazine":
      return (
        <TemplateWithJsonLd>
          <MagazineTemplate profile={extendedProfile} connectedDoctors={connectedDoctors} invitedBy={invitedBy} theme={theme} />
        </TemplateWithJsonLd>
      );
    case "grid":
      return (
        <TemplateWithJsonLd>
          <GridTemplate profile={extendedProfile} connectedDoctors={connectedDoctors} invitedBy={invitedBy} theme={theme} />
        </TemplateWithJsonLd>
      );
    case "minimal":
      return (
        <TemplateWithJsonLd>
          <MinimalTemplate profile={extendedProfile} connectedDoctors={connectedDoctors} invitedBy={invitedBy} theme={theme} />
        </TemplateWithJsonLd>
      );
    case "classic":
    default:
      return (
        <TemplateWithJsonLd>
          <ClassicTemplate profile={extendedProfile} connectedDoctors={connectedDoctors} invitedBy={invitedBy} theme={theme} />
        </TemplateWithJsonLd>
      );
  }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { handle } = await params;

  // Use cached profile fetch - deduplicates with page component
  const profile = await getProfileByHandle(handle);

  if (!profile) {
    return {
      title: "Profile Not Found",
      description: "This doctor profile could not be found on Verified.Doctor",
    };
  }

  const profileUrl = `${baseUrl}/${profile.handle}`;
  const title = formatDoctorTitle(profile.full_name, profile.is_verified, profile.specialty);

  const description = profile.bio
    ? profile.bio.slice(0, 160)
    : `${profile.is_verified ? "Verified " : ""}${profile.specialty || "Medical Professional"}${profile.clinic_location ? ` practicing in ${profile.clinic_location}` : ""}. ${profile.years_experience ? `${profile.years_experience} years of experience. ` : ""}Book an appointment or send an inquiry.`;

  const keywords = [
    profile.full_name,
    profile.specialty,
    profile.clinic_location,
    "verified doctor",
    "medical professional",
    profile.clinic_name,
    ...(profile.services?.split(",").map(s => s.trim()) || []),
    ...(profile.conditions_treated?.split(",").map(c => c.trim()) || []),
  ].filter(Boolean) as string[];

  return {
    title,
    description,
    keywords,
    authors: [{ name: profile.full_name }],
    openGraph: {
      title,
      description,
      type: "profile",
      url: profileUrl,
      siteName: "Verified.Doctor",
      images: profile.profile_photo_url ? [
        {
          url: profile.profile_photo_url,
          width: 400,
          height: 400,
          alt: `${profile.full_name} - Profile Photo`,
        },
      ] : undefined,
      firstName: extractFirstName(profile.full_name),
      lastName: profile.full_name.split(" ").slice(profile.full_name.toLowerCase().startsWith("dr") ? 2 : 1).join(" "),
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: profile.profile_photo_url ? [profile.profile_photo_url] : undefined,
    },
    alternates: {
      canonical: profileUrl,
    },
    robots: {
      index: !profile.is_frozen,
      follow: true,
    },
    other: {
      "profile:type": "medical_professional",
      ...(profile.is_verified && { "profile:verified": "true" }),
    },
  };
}
