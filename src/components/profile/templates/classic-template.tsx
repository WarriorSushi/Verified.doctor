"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  GraduationCap,
  Clock,
  Globe,
  ThumbsUp,
  Users,
  Calendar,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ClassicTemplateProps {
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
 * CLASSIC TEMPLATE
 * Aesthetic: Apple-style ultra-minimal, generous whitespace
 * Pure white background, clean horizontal sections, refined typography
 * No decorative elements - content speaks for itself
 */
export function ClassicTemplate({ profile, connectedDoctors, invitedBy, theme }: ClassicTemplateProps) {
  const colors = theme.colors;
  const [showFullBio, setShowFullBio] = useState(false);
  const recommendationText = formatRecommendationCount(profile.recommendation_count || 0);
  const connectionText = formatConnectionCount(profile.connection_count || 0);
  const services = profile.services?.split(",").map((s) => s.trim()).filter(Boolean) || [];
  const firstName = extractFirstName(profile.full_name);
  const visibility = profile.section_visibility;

  const bioTruncated = profile.bio && profile.bio.length > 200
    ? profile.bio.slice(0, 200).trim() + "..."
    : profile.bio;
  const showBioToggle = profile.bio && profile.bio.length > 200;

  const themeColors = { primary: colors.primary, accent: colors.accent };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <ProfileViewTracker profileId={profile.id} />

      {/* Minimal Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{
        backgroundColor: `${colors.background}E6`,
        borderColor: colors.cardBorder
      }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <div className="relative w-6 h-6">
              <Image src="/verified-doctor-logo.svg" alt="Verified.Doctor" fill className="object-contain" />
            </div>
            <span className="text-sm font-medium tracking-tight" style={{ color: colors.text }}>
              verified<span style={{ color: colors.primary }}>.doctor</span>
            </span>
          </Link>
          <Link href="/" className="text-xs font-medium transition-colors hover:opacity-70" style={{ color: colors.primary }}>
            Get yours →
          </Link>
        </div>
      </nav>

      {/* Main Content - Single Column, Maximum Whitespace */}
      <main className="max-w-2xl mx-auto px-6 py-12 pb-32">

        {/* Profile Header - Centered, Clean */}
        <motion.section {...fadeUp} className="text-center mb-16">
          {/* Photo */}
          <div className="relative w-28 h-28 mx-auto mb-6">
            {profile.profile_photo_url ? (
              <Image
                src={profile.profile_photo_url}
                alt={profile.full_name}
                fill
                priority
                className="object-cover rounded-full"
                style={{ boxShadow: `0 4px 24px ${colors.primary}15` }}
              />
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-2xl font-semibold"
                style={{ backgroundColor: colors.backgroundAlt, color: colors.primary }}
              >
                {profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + Verified */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: colors.text }}>
              {profile.full_name}
            </h1>
            {profile.is_verified && (
              <div className="relative w-5 h-5" title="Verified Doctor">
                <Image src="/verified-doctor-logo.svg" alt="Verified" fill className="object-contain" />
              </div>
            )}
          </div>

          {/* Specialty */}
          <p className="text-base font-medium mb-4" style={{ color: colors.primary }}>
            {profile.specialty}
          </p>

          {/* Quick Info Row */}
          <div className="flex items-center justify-center gap-6 text-sm" style={{ color: colors.textMuted }}>
            {profile.clinic_location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {profile.clinic_location}
              </span>
            )}
            {profile.years_experience && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {profile.years_experience}+ years
              </span>
            )}
          </div>
        </motion.section>

        {/* Divider */}
        <div className="h-px mb-12" style={{ backgroundColor: colors.cardBorder }} />

        {/* Stats Row */}
        {(recommendationText || connectionText) && (
          <motion.section {...fadeUp} transition={{ delay: 0.1 }} className="flex justify-center gap-8 mb-12">
            {recommendationText && (
              <div className="text-center">
                <p className="text-2xl font-semibold" style={{ color: colors.text }}>
                  {profile.recommendation_count}
                </p>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  Recommendations
                </p>
              </div>
            )}
            {connectionText && (
              <div className="text-center">
                <p className="text-2xl font-semibold" style={{ color: colors.text }}>
                  {profile.connection_count}
                </p>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  Connections
                </p>
              </div>
            )}
          </motion.section>
        )}

        {/* Invited By */}
        {invitedBy && (
          <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="flex justify-center mb-8">
            <Link
              href={`/${invitedBy.handle}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors"
              style={{ backgroundColor: colors.backgroundAlt, color: colors.text }}
            >
              <Handshake className="w-4 h-4" style={{ color: colors.primary }} />
              Invited by <span className="font-medium">{invitedBy.full_name}</span>
            </Link>
          </motion.div>
        )}

        {/* Book Appointment - Primary CTA */}
        {profile.external_booking_url && (
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mb-12">
            <Button
              className="w-full h-12 rounded-full font-medium text-base"
              style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}
              asChild
            >
              <a href={profile.external_booking_url} target="_blank" rel="noopener noreferrer">
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
                <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-60" />
              </a>
            </Button>
          </motion.div>
        )}

        {/* Divider */}
        <div className="h-px mb-12" style={{ backgroundColor: colors.cardBorder }} />

        {/* Bio Section */}
        {profile.bio && (
          <motion.section {...fadeUp} transition={{ delay: 0.25 }} className="mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: colors.textMuted }}>
              About
            </h2>
            <p className="text-base leading-relaxed" style={{ color: colors.text }}>
              {showFullBio ? profile.bio : bioTruncated}
            </p>
            {showBioToggle && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="mt-3 text-sm font-medium flex items-center gap-1"
                style={{ color: colors.primary }}
              >
                {showFullBio ? <>Less <ChevronUp className="w-4 h-4" /></> : <>More <ChevronDown className="w-4 h-4" /></>}
              </button>
            )}
          </motion.section>
        )}

        {/* Credentials */}
        {(profile.qualifications || profile.languages || profile.consultation_fee || profile.registration_number) && (
          <motion.section {...fadeUp} transition={{ delay: 0.3 }} className="mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: colors.textMuted }}>
              Credentials
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {profile.qualifications && (
                <div
                  className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: `${colors.primary}08` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${colors.primary}15` }}
                  >
                    <GraduationCap className="w-4 h-4" style={{ color: colors.primary }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: colors.textMuted }}>Qualifications</p>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{profile.qualifications}</p>
                  </div>
                </div>
              )}
              {profile.languages && (
                <div
                  className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: `${colors.primary}08` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${colors.primary}15` }}
                  >
                    <Globe className="w-4 h-4" style={{ color: colors.primary }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: colors.textMuted }}>Languages</p>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{profile.languages}</p>
                  </div>
                </div>
              )}
              {profile.consultation_fee && (
                <div
                  className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: `${colors.primary}08` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${colors.primary}15` }}
                  >
                    <ThumbsUp className="w-4 h-4" style={{ color: colors.primary }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: colors.textMuted }}>Consultation</p>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{profile.consultation_fee}</p>
                  </div>
                </div>
              )}
              {profile.registration_number && (
                <div
                  className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: `${colors.primary}08` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${colors.primary}15` }}
                  >
                    <CheckCircle2 className="w-4 h-4" style={{ color: colors.primary }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: colors.textMuted }}>Registration</p>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{profile.registration_number}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Profile Sections */}
        <div className="space-y-8">
          {isSectionVisible(visibility, "video") && profile.video_introduction_url && (
            <motion.div {...fadeUp} transition={{ delay: 0.35 }}>
              <VideoIntroduction url={profile.video_introduction_url} doctorName={firstName} themeColors={themeColors} />
            </motion.div>
          )}

          {(isSectionVisible(visibility, "availability") || isSectionVisible(visibility, "telemedicine")) && (
            <motion.div {...fadeUp} transition={{ delay: 0.37 }} className="space-y-3">
              {isSectionVisible(visibility, "availability") && profile.is_available !== null && (
                <AvailabilityBadge isAvailable={profile.is_available} availabilityNote={profile.availability_note || undefined} themeColors={themeColors} />
              )}
              {isSectionVisible(visibility, "telemedicine") && profile.offers_telemedicine && (
                <TelemedicineBadge offersTelemedicine={profile.offers_telemedicine} themeColors={themeColors} />
              )}
            </motion.div>
          )}

          {isSectionVisible(visibility, "education") && Array.isArray(profile.education_timeline) && profile.education_timeline.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.39 }}>
              <EducationTimeline items={profile.education_timeline as Array<{institution: string; degree: string; year: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "hospitals") && Array.isArray(profile.hospital_affiliations) && profile.hospital_affiliations.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.41 }}>
              <HospitalAffiliations items={profile.hospital_affiliations as Array<{name: string; role: string; department?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {(isSectionVisible(visibility, "conditions") || isSectionVisible(visibility, "procedures")) && (
            <motion.div {...fadeUp} transition={{ delay: 0.43 }}>
              <ConditionsProcedures
                conditions={isSectionVisible(visibility, "conditions") ? profile.conditions_treated || undefined : undefined}
                procedures={isSectionVisible(visibility, "procedures") ? profile.procedures_performed || undefined : undefined}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {isSectionVisible(visibility, "approach") && profile.approach_to_care && (
            <motion.div {...fadeUp} transition={{ delay: 0.45 }}>
              <ApproachToCare content={profile.approach_to_care} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "cases") && Array.isArray(profile.case_studies) && profile.case_studies.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.47 }}>
              <CaseStudies items={profile.case_studies as Array<{title: string; description: string; outcome?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "firstVisit") && profile.first_visit_guide && (
            <motion.div {...fadeUp} transition={{ delay: 0.49 }}>
              <FirstVisitGuide content={profile.first_visit_guide} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "memberships") && Array.isArray(profile.professional_memberships) && profile.professional_memberships.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.51 }}>
              <ProfessionalMemberships items={profile.professional_memberships as Array<{organization: string; year?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "media") && Array.isArray(profile.media_publications) && profile.media_publications.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.53 }}>
              <MediaPublications items={profile.media_publications as Array<{title: string; publication: string; link?: string; year?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "gallery") && Array.isArray(profile.clinic_gallery) && profile.clinic_gallery.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.55 }}>
              <ClinicGallery images={profile.clinic_gallery as Array<{url: string; caption?: string}>} themeColors={themeColors} />
            </motion.div>
          )}
        </div>

        {/* Services */}
        {services.length > 0 && (
          <motion.section {...fadeUp} transition={{ delay: 0.57 }} className="mt-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: colors.textMuted }}>
              Services
            </h2>
            <div className="flex flex-wrap gap-2">
              {services.map((service, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 text-sm rounded-full"
                  style={{ backgroundColor: colors.backgroundAlt, color: colors.text }}
                >
                  {service}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Recommend Section */}
        <motion.section {...fadeUp} transition={{ delay: 0.6 }} className="mt-16">
          <div
            className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-center"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.accent}15 100%)`,
              border: `1px solid ${colors.primary}15`
            }}
          >
            {/* Decorative elements */}
            <div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
              style={{ background: `radial-gradient(circle, ${colors.primary}40 0%, transparent 70%)` }}
            />
            <div
              className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-15"
              style={{ background: `radial-gradient(circle, ${colors.accent}60 0%, transparent 70%)` }}
            />

            <div className="relative z-10">
              <div
                className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: colors.primary }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: colors.text }}
              >
                Had a good experience?
              </h3>
              <p
                className="text-sm mb-5 max-w-xs mx-auto"
                style={{ color: colors.textMuted }}
              >
                Your recommendation helps other patients find quality care with {firstName}
              </p>
              <RecommendButton profileId={profile.id} />
            </div>
          </div>
        </motion.section>

        {/* Connected Doctors */}
        {connectedDoctors.length > 0 && (
          <motion.section {...fadeUp} transition={{ delay: 0.65 }} className="mt-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: colors.textMuted }}>
              Professional Network
            </h2>
            <div className="flex -space-x-2">
              {connectedDoctors.slice(0, 8).map((doctor) => (
                <Link
                  key={doctor.id}
                  href={`/${doctor.handle}`}
                  className="relative w-10 h-10 rounded-full border-2 hover:z-10 hover:scale-110 transition-transform"
                  style={{ borderColor: colors.background }}
                  title={doctor.full_name}
                >
                  {doctor.profile_photo_url ? (
                    <Image src={doctor.profile_photo_url} alt={doctor.full_name} fill className="object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{ backgroundColor: colors.backgroundAlt, color: colors.primary }}>
                      {doctor.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                  )}
                </Link>
              ))}
              {connectedDoctors.length > 8 && (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium border-2"
                  style={{ backgroundColor: colors.backgroundAlt, borderColor: colors.background, color: colors.textMuted }}>
                  +{connectedDoctors.length - 8}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </main>

      <ProfileActions profile={profile} themeColors={themeColors} />
    </div>
  );
}
