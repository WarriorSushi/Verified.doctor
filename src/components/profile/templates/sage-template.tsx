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
  Sparkles,
  ThumbsUp,
  Users,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Leaf,
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

// Helper to check section visibility - sections are OFF by default unless explicitly set to true
function isSectionVisible(visibility: unknown, key: string): boolean {
  if (!visibility || typeof visibility !== "object") return false;
  const v = visibility as Record<string, boolean>;
  return v[key] === true;
}

// Sage theme - calming green medical aesthetic
const theme = {
  primary: "#4A7C59",
  primaryLight: "#6B9B7A",
  primaryDark: "#2D5A3D",
  accent: "#A8D5BA",
  accentLight: "#D4EAD8",
  bg: "#F9FBF9",
  bgCard: "#FFFFFF",
  text: "#2D3B2D",
  textMuted: "#5C6B5C",
  textLight: "#8A9B8A",
  border: "#D4E5D7",
};

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
  // New profile builder fields
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

interface SageTemplateProps {
  profile: Profile;
  connectedDoctors: ConnectedDoctor[];
  invitedBy?: InvitedBy | null;
}

// Theme colors for section components
const themeColors = {
  primary: "#4A7C59",
  accent: "#A8D5BA",
};

export function SageTemplate({ profile, connectedDoctors, invitedBy }: SageTemplateProps) {
  const [showFullBio, setShowFullBio] = useState(false);
  const recommendationText = formatRecommendationCount(profile.recommendation_count || 0);
  const connectionText = formatConnectionCount(profile.connection_count || 0);
  const services = profile.services?.split(",").map((s) => s.trim()).filter(Boolean) || [];
  const firstName = extractFirstName(profile.full_name);
  const visibility = profile.section_visibility;

  // Truncate bio to ~150 chars
  const bioTruncated = profile.bio && profile.bio.length > 150
    ? profile.bio.slice(0, 150).trim() + "..."
    : profile.bio;
  const showBioToggle = profile.bio && profile.bio.length > 150;

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      {/* Analytics: Track profile view */}
      <ProfileViewTracker profileId={profile.id} />

      {/* Organic gradient shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: theme.accentLight }}
        />
        <div
          className="absolute top-1/2 -left-32 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: theme.accent }}
        />
      </div>

      {/* Navbar */}
      <nav
        className="relative z-20 px-4 sm:px-6 py-3 border-b backdrop-blur-sm"
        style={{
          backgroundColor: `${theme.bgCard}E6`,
          borderColor: theme.border
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-105">
              <Image
                src="/verified-doctor-logo.svg"
                alt="Verified.Doctor"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-sm sm:text-base font-semibold" style={{ color: theme.text }}>
              verified<span style={{ color: theme.primary }}>.doctor</span>
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs sm:text-sm font-medium transition-colors flex items-center gap-1"
            style={{ color: theme.primary }}
          >
            <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Claim yours
          </Link>
        </div>
      </nav>

      {/* Profile Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-28 sm:pb-32">
        {/* Hero Section - Compact Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          {/* Mobile: Centered | Desktop: Side by side */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="flex justify-center sm:justify-start">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                <div
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
                />
                {profile.profile_photo_url ? (
                  <Image
                    src={profile.profile_photo_url}
                    alt={profile.full_name}
                    fill
                    className="object-cover rounded-full border-3 shadow-lg relative z-10"
                    style={{ borderColor: theme.bgCard }}
                  />
                ) : (
                  <div
                    className="relative z-10 w-full h-full rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold border-3 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryLight})`,
                      borderColor: theme.bgCard
                    }}
                  >
                    {profile.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                {/* Leaf decoration */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center z-20"
                  style={{ backgroundColor: theme.accentLight }}
                >
                  <Leaf className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: theme.primary }} />
                </motion.div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {/* Name + Badge */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: theme.text }}>
                  {profile.full_name}
                </h1>
                {profile.is_verified && (
                  <div className="relative w-6 h-6 sm:w-8 sm:h-8" title="Verified Doctor">
                    <Image
                      src="/verified-doctor-logo.svg"
                      alt="Verified"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Verified Capsule */}
              {profile.is_verified && (
                <div className="flex justify-center sm:justify-start mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium"
                    style={{ backgroundColor: `${theme.primary}15`, border: `1px solid ${theme.primary}30`, color: theme.primary }}>
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Physician
                  </span>
                </div>
              )}

              {/* Specialty */}
              <p className="font-medium text-sm sm:text-base mb-2" style={{ color: theme.primary }}>
                {profile.specialty}
              </p>

              {/* Quick Stats - Inline */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm" style={{ color: theme.textMuted }}>
                {profile.clinic_location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" style={{ color: theme.textLight }} />
                    {profile.clinic_location}
                  </span>
                )}
                {profile.years_experience && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" style={{ color: theme.textLight }} />
                    {profile.years_experience}+ yrs
                  </span>
                )}
                {profile.consultation_fee && (
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: theme.textLight }} />
                    {profile.consultation_fee}
                  </span>
                )}
              </div>

              {/* Metrics - Compact */}
              {(recommendationText || connectionText) && (
                <div className="flex justify-center sm:justify-start gap-4 mt-3">
                  {recommendationText && (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${theme.primary}15` }}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                      <span className="text-xs font-semibold" style={{ color: theme.primary }}>
                        {profile.recommendation_count} {profile.recommendation_count === 1 ? "recommendation" : "recommendations"}
                      </span>
                    </div>
                  )}
                  {connectionText && (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: theme.accentLight }}
                    >
                      <Users className="w-3.5 h-3.5" style={{ color: theme.text }} />
                      <span className="text-xs font-semibold" style={{ color: theme.text }}>
                        {profile.connection_count} connected
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Invited By Badge */}
        {invitedBy && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="flex justify-center sm:justify-start mb-3"
          >
            <Link
              href={`/${invitedBy.handle}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm transition-colors"
              style={{
                backgroundColor: `${theme.primary}15`,
                border: `1px solid ${theme.primary}30`,
                color: theme.primary
              }}
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>
                Invited by <span className="font-medium">{invitedBy.full_name}</span>
                {invitedBy.specialty && <span style={{ color: `${theme.primary}90` }}> ({invitedBy.specialty})</span>}
              </span>
            </Link>
          </motion.div>
        )}

        {/* Qualifications Badge */}
        {profile.qualifications && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex justify-center sm:justify-start mb-4"
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm"
              style={{ backgroundColor: theme.accentLight, color: theme.primaryDark }}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              {profile.qualifications}
            </span>
          </motion.div>
        )}

        {/* Bio - Collapsible */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mb-6"
          >
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: theme.textMuted }}>
              {showFullBio ? profile.bio : bioTruncated}
            </p>
            {showBioToggle && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="mt-1 text-sm font-medium inline-flex items-center gap-1"
                style={{ color: theme.primary }}
              >
                {showFullBio ? (
                  <>Show less <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Read more <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            )}
          </motion.div>
        )}

        {/* Book Appointment - Prominent */}
        {profile.external_booking_url && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-6"
          >
            <Button
              className="w-full h-11 sm:h-12 rounded-xl font-medium text-white shadow-lg"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 8px 24px ${theme.primary}30`
              }}
              asChild
            >
              <a
                href={profile.external_booking_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
                <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
              </a>
            </Button>
          </motion.div>
        )}

        {/* Details Grid - 2 columns on tablet+ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-xl shadow-sm p-4 sm:p-5 mb-5"
          style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location */}
            {(profile.clinic_name || profile.clinic_location) && (
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.accentLight }}
                >
                  <MapPin className="w-4 h-4" style={{ color: theme.primary }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide" style={{ color: theme.textLight }}>
                    Location
                  </p>
                  <p className="text-sm font-medium truncate" style={{ color: theme.text }}>
                    {[profile.clinic_name, profile.clinic_location].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Languages */}
            {profile.languages && (
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.accentLight }}
                >
                  <Globe className="w-4 h-4" style={{ color: theme.primary }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide" style={{ color: theme.textLight }}>
                    Languages
                  </p>
                  <p className="text-sm font-medium" style={{ color: theme.text }}>{profile.languages}</p>
                </div>
              </div>
            )}

            {/* Consultation Fee */}
            {profile.consultation_fee && (
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.accentLight }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: theme.primary }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide" style={{ color: theme.textLight }}>
                    Consultation
                  </p>
                  <p className="text-sm font-medium" style={{ color: theme.text }}>{profile.consultation_fee}</p>
                </div>
              </div>
            )}

            {/* Registration */}
            {profile.registration_number && (
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.accentLight }}
                >
                  <CheckCircle2 className="w-4 h-4" style={{ color: theme.primary }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide" style={{ color: theme.textLight }}>
                    Registration
                  </p>
                  <p className="text-sm font-medium" style={{ color: theme.text }}>{profile.registration_number}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* NEW PROFILE SECTIONS */}
        <div className="space-y-5 sm:space-y-4 mb-6">
          {/* Video Introduction */}
          {isSectionVisible(visibility, "video") && profile.video_introduction_url && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <VideoIntroduction
                url={profile.video_introduction_url}
                doctorName={firstName}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {/* Availability & Telemedicine */}
          {(isSectionVisible(visibility, "availability") || isSectionVisible(visibility, "telemedicine")) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.32 }}
              className="space-y-3"
            >
              {isSectionVisible(visibility, "availability") && profile.is_available !== null && (
                <AvailabilityBadge
                  isAvailable={profile.is_available}
                  availabilityNote={profile.availability_note || undefined}
                  themeColors={themeColors}
                />
              )}
              {isSectionVisible(visibility, "telemedicine") && profile.offers_telemedicine && (
                <TelemedicineBadge
                  offersTelemedicine={profile.offers_telemedicine}
                  themeColors={themeColors}
                />
              )}
            </motion.div>
          )}

          {/* Education Timeline */}
          {isSectionVisible(visibility, "education") && Array.isArray(profile.education_timeline) && profile.education_timeline.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.34 }}
            >
              <EducationTimeline
                items={profile.education_timeline as Array<{institution: string; degree: string; year: string}>}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {/* Hospital Affiliations */}
          {isSectionVisible(visibility, "hospitals") && Array.isArray(profile.hospital_affiliations) && profile.hospital_affiliations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.36 }}
            >
              <HospitalAffiliations
                items={profile.hospital_affiliations as Array<{name: string; role: string; department?: string}>}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {/* Conditions & Procedures */}
          {(isSectionVisible(visibility, "conditions") || isSectionVisible(visibility, "procedures")) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.38 }}
            >
              <ConditionsProcedures
                conditions={isSectionVisible(visibility, "conditions") ? profile.conditions_treated || undefined : undefined}
                procedures={isSectionVisible(visibility, "procedures") ? profile.procedures_performed || undefined : undefined}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {/* Approach to Care */}
          {isSectionVisible(visibility, "approach") && profile.approach_to_care && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <ApproachToCare
                content={profile.approach_to_care}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {/* Case Studies */}
          {isSectionVisible(visibility, "cases") && Array.isArray(profile.case_studies) && profile.case_studies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.42 }}
            >
              <CaseStudies
                items={profile.case_studies as Array<{title: string; description: string; outcome?: string}>}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {/* First Visit Guide */}
          {isSectionVisible(visibility, "firstVisit") && profile.first_visit_guide && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.44 }}
            >
              <FirstVisitGuide
                content={profile.first_visit_guide}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {/* Professional Memberships */}
          {isSectionVisible(visibility, "memberships") && Array.isArray(profile.professional_memberships) && profile.professional_memberships.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.46 }}
            >
              <ProfessionalMemberships
                items={profile.professional_memberships as Array<{organization: string; year?: string}>}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {/* Media & Publications */}
          {isSectionVisible(visibility, "media") && Array.isArray(profile.media_publications) && profile.media_publications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.48 }}
            >
              <MediaPublications
                items={profile.media_publications as Array<{title: string; publication: string; link?: string; year?: string}>}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {/* Clinic Gallery */}
          {isSectionVisible(visibility, "gallery") && Array.isArray(profile.clinic_gallery) && profile.clinic_gallery.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <ClinicGallery
                images={profile.clinic_gallery as Array<{url: string; caption?: string}>}
                themeColors={themeColors}
              />
            </motion.div>
          )}
        </div>

        {/* Recommendation Section - Prominent placement */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.52 }}
          className="rounded-2xl p-5 sm:p-6 text-center mb-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.accentLight}, ${theme.accent}60)`,
            border: `1px solid ${theme.accent}`
          }}
        >
          {/* Animated pulse background */}
          <motion.div
            className="absolute inset-0"
            style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}40, transparent)` }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <div className="relative z-10">
            <p className="text-base sm:text-lg font-medium mb-4" style={{ color: theme.text }}>
              Show your appreciation for {profile.full_name} by clicking below
            </p>
            <RecommendButton profileId={profile.id} />
          </div>
        </motion.div>

        {/* Services */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="mb-6"
          >
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide mb-3" style={{ color: theme.textLight }}>
              Services
            </p>
            <div className="flex flex-wrap gap-2">
              {services.map((service, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-sm"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                    color: theme.text
                  }}
                >
                  {service}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Connected Doctors */}
        {connectedDoctors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mb-6"
          >
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide mb-3" style={{ color: theme.textLight }}>
              Professional Network
            </p>
            <div className="flex -space-x-2">
              {connectedDoctors.slice(0, 6).map((doctor) => (
                <Link
                  key={doctor.id}
                  href={`/${doctor.handle}`}
                  className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 shadow-sm hover:z-10 hover:scale-110 transition-transform"
                  style={{ borderColor: theme.bgCard }}
                  title={doctor.full_name}
                >
                  {doctor.profile_photo_url ? (
                    <Image
                      src={doctor.profile_photo_url}
                      alt={doctor.full_name}
                      fill
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: `linear-gradient(135deg, ${theme.primaryLight}, ${theme.accent})` }}
                    >
                      {doctor.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                  )}
                </Link>
              ))}
              {connectedDoctors.length > 6 && (
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 shadow-sm flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: theme.accentLight, borderColor: theme.bgCard, color: theme.primary }}
                >
                  +{connectedDoctors.length - 6}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* Sticky Action Buttons */}
      <ProfileActions profile={profile} />
    </div>
  );
}
