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
  Star,
  Activity,
  Stethoscope,
  Eye,
  Heart,
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
import { VerifiedBadge } from "../verified-badge";
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
  subscription_status: string | null;
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

interface GridTemplateProps {
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
 * GRID TEMPLATE
 * Aesthetic: Modern SaaS dashboard / Bento box style
 * Information organized in grid of rounded cards with varying sizes
 * Subtle shadows, hover effects, data-visualization feel
 */
export function GridTemplate({ profile, connectedDoctors, invitedBy, theme }: GridTemplateProps) {
  const colors = theme.colors;
  const [showFullBio, setShowFullBio] = useState(false);
  const recommendationText = formatRecommendationCount(profile.recommendation_count || 0);
  const connectionText = formatConnectionCount(profile.connection_count || 0);
  const services = profile.services?.split(",").map((s) => s.trim()).filter(Boolean) || [];
  const firstName = extractFirstName(profile.full_name);
  const visibility = profile.section_visibility;
  const isPro = profile.subscription_status === "pro";

  const bioTruncated = profile.bio && profile.bio.length > 150
    ? profile.bio.slice(0, 150).trim() + "..."
    : profile.bio;
  const showBioToggle = profile.bio && profile.bio.length > 150;

  const themeColors = { primary: colors.primary, accent: colors.accent };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    })
  };

  // Shared card styles
  const cardStyle = {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    boxShadow: colors.isDark
      ? `0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px ${colors.cardBorder}`
      : `0 4px 24px rgba(0, 0, 0, 0.04), 0 0 0 1px ${colors.cardBorder}`,
  };

  const cardHover = {
    scale: 1.02,
    boxShadow: colors.isDark
      ? `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px ${colors.primary}40`
      : `0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px ${colors.primary}30`,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.backgroundAlt }}>
      <ProfileViewTracker profileId={profile.id} />

      {/* Floating Navbar */}
      <nav className="sticky top-4 z-50 mx-4 lg:mx-auto max-w-6xl">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-2xl border backdrop-blur-xl px-4 py-3 flex items-center justify-between"
          style={{
            backgroundColor: `${colors.card}CC`,
            borderColor: colors.cardBorder,
            boxShadow: `0 8px 32px ${colors.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <Link href="/" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <VerifiedBadge isVerified={true} isPro={isPro} size="sm" showTooltip={false} />
            <span className="text-sm font-semibold tracking-tight" style={{ color: colors.text }}>
              verified<span style={{ color: colors.primary }}>.doctor</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {profile.external_booking_url && (
              <Button
                size="sm"
                className="rounded-full text-xs font-medium h-8"
                style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}
                asChild
              >
                <a href={profile.external_booking_url} target="_blank" rel="noopener noreferrer">
                  Book Now
                </a>
              </Button>
            )}
            <Link href="/" className="text-xs font-medium transition-colors hover:opacity-70" style={{ color: colors.primary }}>
              Get yours
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* Main Grid Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 pb-32">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-3 lg:gap-4 auto-rows-[minmax(80px,auto)]">

          {/* Profile Card - Large (spans 4 cols, 3 rows) */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={0}
            whileHover={cardHover}
            className="col-span-2 sm:col-span-4 lg:col-span-4 row-span-3 rounded-3xl border p-5 lg:p-6 flex flex-col"
            style={cardStyle}
          >
            {/* Photo */}
            <div className="relative w-24 h-24 mb-4">
              {profile.profile_photo_url ? (
                <Image
                  src={profile.profile_photo_url}
                  alt={profile.full_name}
                  fill
                  priority
                  className="object-cover rounded-2xl"
                />
              ) : (
                <div
                  className="w-full h-full rounded-2xl flex items-center justify-center text-2xl font-bold"
                  style={{ backgroundColor: colors.backgroundAlt, color: colors.primary }}
                >
                  {profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 rounded-full border-2"
                  style={{ borderColor: colors.card, backgroundColor: colors.card }}>
                  <VerifiedBadge isVerified={profile.is_verified} isPro={isPro} size="sm" />
                </div>
              )}
            </div>

            {/* Name & Title */}
            <h1 className="text-xl font-bold mb-1" style={{ color: colors.text }}>
              {profile.full_name}
            </h1>
            <p className="text-sm font-medium mb-3" style={{ color: colors.primary }}>
              {profile.specialty}
            </p>

            {/* Location */}
            {profile.clinic_location && (
              <div className="flex items-center gap-1.5 text-sm mb-4" style={{ color: colors.textMuted }}>
                <MapPin className="w-3.5 h-3.5" />
                {profile.clinic_location}
              </div>
            )}

            {/* Invited By */}
            {invitedBy && (
              <Link
                href={`/${invitedBy.handle}`}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full mt-auto transition-opacity hover:opacity-80"
                style={{ backgroundColor: colors.backgroundAlt, color: colors.text }}
              >
                <Handshake className="w-3 h-3" style={{ color: colors.primary }} />
                via {invitedBy.full_name}
              </Link>
            )}
          </motion.div>

          {/* Stats Card - Recommendations */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            whileHover={cardHover}
            className="col-span-1 sm:col-span-2 lg:col-span-4 row-span-2 rounded-3xl border p-4 lg:p-5 flex flex-col justify-between"
            style={cardStyle}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${colors.primary}15` }}>
              <ThumbsUp className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ color: colors.text }}>
                {profile.recommendation_count || 0}
              </p>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Recommendations
              </p>
            </div>
          </motion.div>

          {/* Stats Card - Connections */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={2}
            whileHover={cardHover}
            className="col-span-1 sm:col-span-2 lg:col-span-4 row-span-2 rounded-3xl border p-4 lg:p-5 flex flex-col justify-between"
            style={cardStyle}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${colors.accent}30` }}>
              <Users className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ color: colors.text }}>
                {profile.connection_count || 0}
              </p>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Connections
              </p>
            </div>
          </motion.div>

          {/* Experience Card */}
          {profile.years_experience && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={3}
              whileHover={cardHover}
              className="col-span-2 sm:col-span-2 lg:col-span-4 row-span-1 rounded-3xl border p-4 lg:p-5 flex flex-col justify-between"
              style={cardStyle}
            >
              <Clock className="w-6 h-6" style={{ color: colors.primary }} />
              <div>
                <p className="text-3xl font-bold" style={{ color: colors.text }}>
                  {profile.years_experience}+
                </p>
                <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                  Years Experience
                </p>
              </div>
            </motion.div>
          )}

          {/* Book Appointment Card - Wide */}
          {profile.external_booking_url && (
            <motion.a
              href={profile.external_booking_url}
              target="_blank"
              rel="noopener noreferrer"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={4}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="col-span-2 sm:col-span-4 lg:col-span-4 row-span-1 rounded-3xl p-4 lg:p-6 flex items-center justify-between cursor-pointer group"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
                boxShadow: `0 8px 32px ${colors.primary}40`,
              }}
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: `${colors.textOnPrimary}80` }}>
                  Ready to visit?
                </p>
                <p className="text-lg font-bold" style={{ color: colors.textOnPrimary }}>
                  Book Appointment
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${colors.textOnPrimary}20` }}>
                <Calendar className="w-6 h-6" style={{ color: colors.textOnPrimary }} />
              </div>
            </motion.a>
          )}

          {/* Bio Card - Wide */}
          {profile.bio && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={5}
              whileHover={cardHover}
              className="col-span-2 sm:col-span-4 lg:col-span-8 row-span-2 rounded-3xl border p-5 lg:p-6"
              style={cardStyle}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: colors.textMuted }}>
                About
              </p>
              <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
                {showFullBio ? profile.bio : bioTruncated}
              </p>
              {showBioToggle && (
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="mt-2 text-xs font-medium flex items-center gap-1"
                  style={{ color: colors.primary }}
                >
                  {showFullBio ? <>Less <ChevronUp className="w-3 h-3" /></> : <>More <ChevronDown className="w-3 h-3" /></>}
                </button>
              )}
            </motion.div>
          )}

          {/* Qualifications Card */}
          {profile.qualifications && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={6}
              whileHover={cardHover}
              className="col-span-2 sm:col-span-2 lg:col-span-4 row-span-2 rounded-3xl border p-4 lg:p-5"
              style={cardStyle}
            >
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5" style={{ color: colors.primary }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  Qualifications
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: colors.text }}>
                {profile.qualifications}
              </p>
            </motion.div>
          )}

          {/* Languages Card */}
          {profile.languages && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={7}
              whileHover={cardHover}
              className="col-span-1 sm:col-span-2 lg:col-span-4 row-span-2 rounded-3xl border p-4 lg:p-5"
              style={cardStyle}
            >
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5" style={{ color: colors.primary }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  Languages
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: colors.text }}>
                {profile.languages}
              </p>
            </motion.div>
          )}

          {/* Consultation Fee Card */}
          {profile.consultation_fee && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={8}
              whileHover={cardHover}
              className="col-span-1 sm:col-span-2 lg:col-span-4 row-span-2 rounded-3xl border p-4 lg:p-5 flex flex-col justify-between"
              style={cardStyle}
            >
              <Activity className="w-5 h-5" style={{ color: colors.primary }} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>
                  Consultation
                </p>
                <p className="text-lg font-bold" style={{ color: colors.text }}>
                  {profile.consultation_fee}
                </p>
              </div>
            </motion.div>
          )}

          {/* Registration Card */}
          {profile.registration_number && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={9}
              whileHover={cardHover}
              className="col-span-2 sm:col-span-2 lg:col-span-4 row-span-2 rounded-3xl border p-4 lg:p-5"
              style={cardStyle}
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5" style={{ color: colors.primary }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  Registration
                </span>
              </div>
              <p className="text-sm font-mono font-medium" style={{ color: colors.text }}>
                {profile.registration_number}
              </p>
            </motion.div>
          )}

          {/* Services Card - Full Width */}
          {services.length > 0 && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={10}
              className="col-span-2 sm:col-span-4 lg:col-span-12 row-span-2 rounded-3xl border p-5 lg:p-6"
              style={cardStyle}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: colors.textMuted }}>
                Services Offered
              </p>
              <div className="flex flex-wrap gap-2">
                {services.map((service, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.03 }}
                    className="px-3 py-1.5 text-sm rounded-full border"
                    style={{
                      backgroundColor: colors.backgroundAlt,
                      borderColor: colors.cardBorder,
                      color: colors.text
                    }}
                  >
                    {service}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Profile Sections in Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {isSectionVisible(visibility, "video") && profile.video_introduction_url && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={11}
              className="rounded-3xl border p-6" style={cardStyle}>
              <VideoIntroduction url={profile.video_introduction_url} doctorName={firstName} themeColors={themeColors} />
            </motion.div>
          )}

          {(isSectionVisible(visibility, "availability") || isSectionVisible(visibility, "telemedicine")) && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={12}
              className="rounded-3xl border p-6 space-y-3" style={cardStyle}>
              {isSectionVisible(visibility, "availability") && profile.is_available !== null && (
                <AvailabilityBadge isAvailable={profile.is_available} availabilityNote={profile.availability_note || undefined} themeColors={themeColors} />
              )}
              {isSectionVisible(visibility, "telemedicine") && profile.offers_telemedicine && (
                <TelemedicineBadge offersTelemedicine={profile.offers_telemedicine} themeColors={themeColors} />
              )}
            </motion.div>
          )}

          {isSectionVisible(visibility, "education") && Array.isArray(profile.education_timeline) && profile.education_timeline.length > 0 && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={13}
              className="rounded-3xl border p-6" style={cardStyle}>
              <EducationTimeline items={profile.education_timeline as Array<{institution: string; degree: string; year: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "hospitals") && Array.isArray(profile.hospital_affiliations) && profile.hospital_affiliations.length > 0 && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={14}
              className="rounded-3xl border p-6" style={cardStyle}>
              <HospitalAffiliations items={profile.hospital_affiliations as Array<{name: string; role: string; department?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {(isSectionVisible(visibility, "conditions") || isSectionVisible(visibility, "procedures")) && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={15}
              className="rounded-3xl border p-6" style={cardStyle}>
              <ConditionsProcedures
                conditions={isSectionVisible(visibility, "conditions") ? profile.conditions_treated || undefined : undefined}
                procedures={isSectionVisible(visibility, "procedures") ? profile.procedures_performed || undefined : undefined}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {isSectionVisible(visibility, "approach") && profile.approach_to_care && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={16}
              className="rounded-3xl border p-6" style={cardStyle}>
              <ApproachToCare content={profile.approach_to_care} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "cases") && Array.isArray(profile.case_studies) && profile.case_studies.length > 0 && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={17}
              className="rounded-3xl border p-6" style={cardStyle}>
              <CaseStudies items={profile.case_studies as Array<{title: string; description: string; outcome?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "firstVisit") && profile.first_visit_guide && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={18}
              className="rounded-3xl border p-6" style={cardStyle}>
              <FirstVisitGuide content={profile.first_visit_guide} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "memberships") && Array.isArray(profile.professional_memberships) && profile.professional_memberships.length > 0 && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={19}
              className="rounded-3xl border p-6" style={cardStyle}>
              <ProfessionalMemberships items={profile.professional_memberships as Array<{organization: string; year?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "media") && Array.isArray(profile.media_publications) && profile.media_publications.length > 0 && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={20}
              className="rounded-3xl border p-6" style={cardStyle}>
              <MediaPublications items={profile.media_publications as Array<{title: string; publication: string; link?: string; year?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "gallery") && Array.isArray(profile.clinic_gallery) && profile.clinic_gallery.length > 0 && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={21}
              className="rounded-3xl border p-6 lg:col-span-2" style={cardStyle}>
              <ClinicGallery images={profile.clinic_gallery as Array<{url: string; caption?: string}>} themeColors={themeColors} />
            </motion.div>
          )}
        </div>

        {/* Recommend & Network Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {/* Recommend Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={22}
            className="rounded-3xl border p-8 text-center"
            style={cardStyle}
          >
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${colors.primary}10` }}>
              <Heart className="w-8 h-8" style={{ color: colors.primary }} />
            </div>
            <p className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
              Had a good experience?
            </p>
            <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
              Your recommendation helps others find great doctors
            </p>
            <RecommendButton profileId={profile.id} />
          </motion.div>

          {/* Connected Doctors Card */}
          {connectedDoctors.length > 0 && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={23}
              className="rounded-3xl border p-6"
              style={cardStyle}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: colors.textMuted }}>
                Professional Network
              </p>
              <div className="grid grid-cols-2 gap-3">
                {connectedDoctors.slice(0, 6).map((doctor, i) => (
                  <Link
                    key={doctor.id}
                    href={`/${doctor.handle}`}
                    className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-opacity-50"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {doctor.profile_photo_url ? (
                        <Image src={doctor.profile_photo_url} alt={doctor.full_name} fill className="object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-full rounded-xl flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: colors.backgroundAlt, color: colors.primary }}>
                          {doctor.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: colors.text }}>
                        {doctor.full_name}
                      </p>
                      <p className="text-xs truncate" style={{ color: colors.textMuted }}>
                        {doctor.specialty}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              {connectedDoctors.length > 6 && (
                <p className="text-xs text-center mt-4" style={{ color: colors.textMuted }}>
                  +{connectedDoctors.length - 6} more connections
                </p>
              )}
            </motion.div>
          )}
        </div>
      </main>

      <ProfileActions profile={profile} />
    </div>
  );
}
