"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Globe,
  Calendar,
  ExternalLink,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Handshake,
  Minus,
} from "lucide-react";
import { ProfileActions } from "../profile-actions";
import { RecommendButton } from "../recommend-button";
import { ProfileViewTracker } from "../profile-view-tracker";
import { formatRecommendationCount, formatConnectionCount } from "@/lib/format-metrics";
import { extractFirstName } from "@/lib/utils";
import {
  VideoIntroduction,
  EducationTimeline,
  HospitalAffiliations,
  ConditionsProcedures,
  ApproachToCare,
  CaseStudies,
  FirstVisitGuide,
  AvailabilityBadge,
  TelemedicineBadge,
  ProfessionalMemberships,
  MediaPublications,
  ClinicGallery,
} from "../sections";
import type { ThemeConfig } from "@/lib/theme-config";

interface Profile {
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

interface ConnectedDoctor {
  id: string;
  full_name: string;
  specialty: string | null;
  handle: string;
  profile_photo_url: string | null;
}

interface InvitedBy {
  id: string;
  full_name: string;
  specialty: string | null;
  handle: string;
}

interface MinimalTemplateProps {
  profile: Profile;
  connectedDoctors: ConnectedDoctor[];
  invitedBy?: InvitedBy | null;
  theme: ThemeConfig;
}

function isSectionVisible(visibility: unknown, key: string): boolean {
  if (!visibility || typeof visibility !== "object") return false;
  const v = visibility as Record<string, boolean>;
  return v[key] === true;
}

/**
 * MINIMAL TEMPLATE
 * Aesthetic: Swiss/Bauhaus ultra-minimal design
 * Maximum whitespace, minimal UI, no cards or borders
 * Typography-focused with strong hierarchy
 * Single accent color usage, content flows naturally
 */
export function MinimalTemplate({ profile, connectedDoctors, invitedBy, theme }: MinimalTemplateProps) {
  const colors = theme.colors;
  const [showFullBio, setShowFullBio] = useState(false);
  const recommendationText = formatRecommendationCount(profile.recommendation_count || 0);
  const connectionText = formatConnectionCount(profile.connection_count || 0);
  const services = profile.services?.split(",").map((s) => s.trim()).filter(Boolean) || [];
  const firstName = extractFirstName(profile.full_name);
  const visibility = profile.section_visibility;

  const bioTruncated = profile.bio && profile.bio.length > 300
    ? profile.bio.slice(0, 300).trim() + "..."
    : profile.bio;
  const showBioToggle = profile.bio && profile.bio.length > 300;

  const themeColors = { primary: colors.primary, accent: colors.accent };

  // Ultra-smooth animation
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
  };

  const slideUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <ProfileViewTracker profileId={profile.id} />

      {/* Ultra-Minimal Header - Just Logo and Link */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="opacity-60 hover:opacity-100 transition-opacity">
            <div className="relative w-5 h-5">
              <Image src="/verified-doctor-logo.svg" alt="Verified.Doctor" fill className="object-contain" />
            </div>
          </Link>
          <Link
            href="/"
            className="text-xs font-medium tracking-wide uppercase opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: colors.text }}
          >
            Create Profile
          </Link>
        </div>
      </header>

      {/* Main Content - Extreme Whitespace */}
      <main className="px-6 lg:px-12 xl:px-24 pt-32 pb-40">
        <div className="max-w-4xl mx-auto">

          {/* Hero Section - Name & Photo Side by Side */}
          <motion.section {...slideUp} className="mb-24 lg:mb-32">
            <div className="flex flex-col-reverse lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16">
              {/* Name Block */}
              <div className="flex-1">
                {/* Verified Tag */}
                {profile.is_verified && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="relative w-4 h-4">
                      <Image src="/verified-doctor-logo.svg" alt="Verified" fill className="object-contain" />
                    </div>
                    <span className="text-xs font-medium tracking-wider uppercase" style={{ color: colors.primary }}>
                      Verified
                    </span>
                  </div>
                )}

                {/* Name - Massive Typography */}
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-[0.9] mb-6"
                  style={{ color: colors.text }}
                >
                  {profile.full_name}
                </h1>

                {/* Specialty - Accent Color */}
                <p
                  className="text-lg lg:text-xl font-medium tracking-wide"
                  style={{ color: colors.primary }}
                >
                  {profile.specialty}
                </p>

                {/* Location & Experience */}
                <div className="flex flex-wrap items-center gap-6 mt-6 text-sm" style={{ color: colors.textMuted }}>
                  {profile.clinic_location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {profile.clinic_location}
                    </span>
                  )}
                  {profile.years_experience && (
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {profile.years_experience} years
                    </span>
                  )}
                </div>
              </div>

              {/* Photo */}
              <motion.div
                {...fadeIn}
                transition={{ delay: 0.2, duration: 1 }}
                className="relative w-32 h-32 lg:w-48 lg:h-48 flex-shrink-0"
              >
                {profile.profile_photo_url ? (
                  <Image
                    src={profile.profile_photo_url}
                    alt={profile.full_name}
                    fill
                    priority
                    className="object-cover"
                    style={{ borderRadius: '2px' }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-3xl lg:text-4xl font-light"
                    style={{
                      backgroundColor: colors.backgroundAlt,
                      color: colors.primary,
                      borderRadius: '2px'
                    }}
                  >
                    {profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.section>

          {/* Stats - Horizontal Line Style */}
          {(recommendationText || connectionText) && (
            <motion.section
              {...fadeIn}
              transition={{ delay: 0.3 }}
              className="mb-24 lg:mb-32"
            >
              <div className="flex items-center gap-12 lg:gap-16">
                {recommendationText && (
                  <div>
                    <p className="text-4xl lg:text-5xl font-light" style={{ color: colors.text }}>
                      {profile.recommendation_count}
                    </p>
                    <p className="text-xs font-medium tracking-wider uppercase mt-2" style={{ color: colors.textMuted }}>
                      Recommendations
                    </p>
                  </div>
                )}
                {connectionText && (
                  <div>
                    <p className="text-4xl lg:text-5xl font-light" style={{ color: colors.text }}>
                      {profile.connection_count}
                    </p>
                    <p className="text-xs font-medium tracking-wider uppercase mt-2" style={{ color: colors.textMuted }}>
                      Connections
                    </p>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* Invited By - Simple Text */}
          {invitedBy && (
            <motion.div {...fadeIn} transition={{ delay: 0.35 }} className="mb-16">
              <Link
                href={`/${invitedBy.handle}`}
                className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
                style={{ color: colors.textMuted }}
              >
                <Handshake className="w-4 h-4" style={{ color: colors.primary }} />
                Invited by {invitedBy.full_name}
              </Link>
            </motion.div>
          )}

          {/* Book Appointment - Minimal Link Style */}
          {profile.external_booking_url && (
            <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="mb-24 lg:mb-32">
              <a
                href={profile.external_booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 text-lg font-medium transition-opacity hover:opacity-70"
                style={{ color: colors.primary }}
              >
                <Calendar className="w-5 h-5" />
                Book Appointment
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </motion.div>
          )}

          {/* Horizontal Rule */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.45 }}
            className="h-px mb-24 lg:mb-32"
            style={{ backgroundColor: colors.cardBorder }}
          />

          {/* Bio - Full Width, Large Text */}
          {profile.bio && (
            <motion.section {...slideUp} transition={{ delay: 0.5 }} className="mb-24 lg:mb-32">
              <p
                className="text-xl lg:text-2xl font-light leading-relaxed"
                style={{ color: colors.text }}
              >
                {showFullBio ? profile.bio : bioTruncated}
              </p>
              {showBioToggle && (
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="mt-4 text-sm font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ color: colors.primary }}
                >
                  {showFullBio ? <>Read less <ChevronUp className="w-4 h-4" /></> : <>Continue reading <ChevronDown className="w-4 h-4" /></>}
                </button>
              )}
            </motion.section>
          )}

          {/* Credentials - Simple List Style */}
          {(profile.qualifications || profile.languages || profile.consultation_fee || profile.registration_number) && (
            <motion.section {...slideUp} transition={{ delay: 0.55 }} className="mb-24 lg:mb-32">
              <h2
                className="text-xs font-medium tracking-wider uppercase mb-8"
                style={{ color: colors.textMuted }}
              >
                Credentials
              </h2>
              <div className="space-y-6">
                {profile.qualifications && (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
                    <span className="text-xs font-medium tracking-wider uppercase w-32 flex-shrink-0" style={{ color: colors.textMuted }}>
                      Qualifications
                    </span>
                    <span className="text-base" style={{ color: colors.text }}>{profile.qualifications}</span>
                  </div>
                )}
                {profile.languages && (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
                    <span className="text-xs font-medium tracking-wider uppercase w-32 flex-shrink-0" style={{ color: colors.textMuted }}>
                      Languages
                    </span>
                    <span className="text-base" style={{ color: colors.text }}>{profile.languages}</span>
                  </div>
                )}
                {profile.consultation_fee && (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
                    <span className="text-xs font-medium tracking-wider uppercase w-32 flex-shrink-0" style={{ color: colors.textMuted }}>
                      Consultation
                    </span>
                    <span className="text-base" style={{ color: colors.text }}>{profile.consultation_fee}</span>
                  </div>
                )}
                {profile.registration_number && (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
                    <span className="text-xs font-medium tracking-wider uppercase w-32 flex-shrink-0" style={{ color: colors.textMuted }}>
                      Registration
                    </span>
                    <span className="text-base font-mono" style={{ color: colors.text }}>{profile.registration_number}</span>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* Profile Sections - Clean Spacing */}
          <div className="space-y-24 lg:space-y-32">
            {isSectionVisible(visibility, "video") && profile.video_introduction_url && (
              <motion.div {...slideUp} transition={{ delay: 0.6 }}>
                <VideoIntroduction url={profile.video_introduction_url} doctorName={firstName} themeColors={themeColors} />
              </motion.div>
            )}

            {(isSectionVisible(visibility, "availability") || isSectionVisible(visibility, "telemedicine")) && (
              <motion.div {...slideUp} transition={{ delay: 0.62 }} className="space-y-4">
                {isSectionVisible(visibility, "availability") && profile.is_available !== null && (
                  <AvailabilityBadge isAvailable={profile.is_available} availabilityNote={profile.availability_note || undefined} themeColors={themeColors} />
                )}
                {isSectionVisible(visibility, "telemedicine") && profile.offers_telemedicine && (
                  <TelemedicineBadge offersTelemedicine={profile.offers_telemedicine} themeColors={themeColors} />
                )}
              </motion.div>
            )}

            {isSectionVisible(visibility, "education") && Array.isArray(profile.education_timeline) && profile.education_timeline.length > 0 && (
              <motion.div {...slideUp} transition={{ delay: 0.64 }}>
                <EducationTimeline items={profile.education_timeline as Array<{institution: string; degree: string; year: string}>} themeColors={themeColors} />
              </motion.div>
            )}

            {isSectionVisible(visibility, "hospitals") && Array.isArray(profile.hospital_affiliations) && profile.hospital_affiliations.length > 0 && (
              <motion.div {...slideUp} transition={{ delay: 0.66 }}>
                <HospitalAffiliations items={profile.hospital_affiliations as Array<{name: string; role: string; department?: string}>} themeColors={themeColors} />
              </motion.div>
            )}

            {(isSectionVisible(visibility, "conditions") || isSectionVisible(visibility, "procedures")) && (
              <motion.div {...slideUp} transition={{ delay: 0.68 }}>
                <ConditionsProcedures
                  conditions={isSectionVisible(visibility, "conditions") ? profile.conditions_treated || undefined : undefined}
                  procedures={isSectionVisible(visibility, "procedures") ? profile.procedures_performed || undefined : undefined}
                  themeColors={themeColors}
                />
              </motion.div>
            )}

            {isSectionVisible(visibility, "approach") && profile.approach_to_care && (
              <motion.div {...slideUp} transition={{ delay: 0.7 }}>
                <ApproachToCare content={profile.approach_to_care} themeColors={themeColors} />
              </motion.div>
            )}

            {isSectionVisible(visibility, "cases") && Array.isArray(profile.case_studies) && profile.case_studies.length > 0 && (
              <motion.div {...slideUp} transition={{ delay: 0.72 }}>
                <CaseStudies items={profile.case_studies as Array<{title: string; description: string; outcome?: string}>} themeColors={themeColors} />
              </motion.div>
            )}

            {isSectionVisible(visibility, "firstVisit") && profile.first_visit_guide && (
              <motion.div {...slideUp} transition={{ delay: 0.74 }}>
                <FirstVisitGuide content={profile.first_visit_guide} themeColors={themeColors} />
              </motion.div>
            )}

            {isSectionVisible(visibility, "memberships") && Array.isArray(profile.professional_memberships) && profile.professional_memberships.length > 0 && (
              <motion.div {...slideUp} transition={{ delay: 0.76 }}>
                <ProfessionalMemberships items={profile.professional_memberships as Array<{organization: string; year?: string}>} themeColors={themeColors} />
              </motion.div>
            )}

            {isSectionVisible(visibility, "media") && Array.isArray(profile.media_publications) && profile.media_publications.length > 0 && (
              <motion.div {...slideUp} transition={{ delay: 0.78 }}>
                <MediaPublications items={profile.media_publications as Array<{title: string; publication: string; link?: string; year?: string}>} themeColors={themeColors} />
              </motion.div>
            )}

            {isSectionVisible(visibility, "gallery") && Array.isArray(profile.clinic_gallery) && profile.clinic_gallery.length > 0 && (
              <motion.div {...slideUp} transition={{ delay: 0.8 }}>
                <ClinicGallery images={profile.clinic_gallery as Array<{url: string; caption?: string}>} themeColors={themeColors} />
              </motion.div>
            )}
          </div>

          {/* Services - Inline Text List */}
          {services.length > 0 && (
            <motion.section {...slideUp} transition={{ delay: 0.82 }} className="mt-24 lg:mt-32">
              <h2
                className="text-xs font-medium tracking-wider uppercase mb-6"
                style={{ color: colors.textMuted }}
              >
                Services
              </h2>
              <p className="text-base leading-loose" style={{ color: colors.text }}>
                {services.map((service, i) => (
                  <span key={i}>
                    {service}
                    {i < services.length - 1 && (
                      <span className="mx-3 opacity-30">
                        <Minus className="w-3 h-3 inline" />
                      </span>
                    )}
                  </span>
                ))}
              </p>
            </motion.section>
          )}

          {/* Horizontal Rule */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.84 }}
            className="h-px my-24 lg:my-32"
            style={{ backgroundColor: colors.cardBorder }}
          />

          {/* Recommend Section - Minimal */}
          <motion.section {...slideUp} transition={{ delay: 0.86 }} className="mb-24 lg:mb-32">
            <p className="text-lg lg:text-xl font-light mb-6" style={{ color: colors.text }}>
              Had a positive experience with {firstName}?
            </p>
            <RecommendButton profileId={profile.id} />
          </motion.section>

          {/* Connected Doctors - Horizontal List */}
          {connectedDoctors.length > 0 && (
            <motion.section {...slideUp} transition={{ delay: 0.88 }}>
              <h2
                className="text-xs font-medium tracking-wider uppercase mb-8"
                style={{ color: colors.textMuted }}
              >
                Professional Network
              </h2>
              <div className="flex flex-wrap gap-4">
                {connectedDoctors.slice(0, 8).map((doctor) => (
                  <Link
                    key={doctor.id}
                    href={`/${doctor.handle}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {doctor.profile_photo_url ? (
                        <Image
                          src={doctor.profile_photo_url}
                          alt={doctor.full_name}
                          fill
                          className="object-cover"
                          style={{ borderRadius: '2px' }}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-xs font-medium"
                          style={{
                            backgroundColor: colors.backgroundAlt,
                            color: colors.primary,
                            borderRadius: '2px'
                          }}
                        >
                          {doctor.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p
                        className="text-sm font-medium transition-opacity group-hover:opacity-70"
                        style={{ color: colors.text }}
                      >
                        {doctor.full_name}
                      </p>
                      <p className="text-xs" style={{ color: colors.textMuted }}>
                        {doctor.specialty}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              {connectedDoctors.length > 8 && (
                <p className="text-sm mt-6" style={{ color: colors.textMuted }}>
                  +{connectedDoctors.length - 8} more
                </p>
              )}
            </motion.section>
          )}
        </div>
      </main>

      <ProfileActions profile={profile} />
    </div>
  );
}
