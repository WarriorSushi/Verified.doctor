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
  Award,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileActions } from "../profile-actions";
import { RecommendButton } from "../recommend-button";
import { ProfileViewTracker } from "../profile-view-tracker";
import { formatRecommendationCount, formatConnectionCount } from "@/lib/format-metrics";
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

interface HeroTemplateProps {
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
 * HERO TEMPLATE
 * Aesthetic: Bold, dramatic, full-bleed header design
 * Large hero banner with gradient overlay, profile photo overlapping boundary
 * Floating stat cards, impactful typography
 */
export function HeroTemplate({ profile, connectedDoctors, invitedBy, theme }: HeroTemplateProps) {
  const colors = theme.colors;
  const [showFullBio, setShowFullBio] = useState(false);
  const recommendationText = formatRecommendationCount(profile.recommendation_count || 0);
  const connectionText = formatConnectionCount(profile.connection_count || 0);
  const services = profile.services?.split(",").map((s) => s.trim()).filter(Boolean) || [];
  const firstName = profile.full_name.split(" ")[0];
  const visibility = profile.section_visibility;

  const bioTruncated = profile.bio && profile.bio.length > 180
    ? profile.bio.slice(0, 180).trim() + "..."
    : profile.bio;
  const showBioToggle = profile.bio && profile.bio.length > 180;

  const themeColors = { primary: colors.primary, accent: colors.accent };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <ProfileViewTracker profileId={profile.id} />

      {/* Hero Section - Full Bleed */}
      <div className="relative">
        {/* Hero Background with Gradient */}
        <div
          className="h-[52vh] sm:h-[48vh] relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 50%, ${colors.accent}40 100%)`
          }}
        >
          {/* Animated Gradient Orbs */}
          <motion.div
            className="absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: colors.accent }}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 left-10 w-48 h-48 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: colors.textOnPrimary }}
            animate={{
              scale: [1, 0.8, 1],
              x: [0, -20, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="hero-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke={colors.textOnPrimary} strokeWidth="0.3" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#hero-grid)" />
            </svg>
          </div>

          {/* Wave Bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" className="w-full h-16 sm:h-20" preserveAspectRatio="none">
              <path
                fill={colors.background}
                d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
              />
            </svg>
          </div>

          {/* Navbar - Transparent */}
          <nav className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative w-7 h-7 brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity">
                  <Image src="/verified-doctor-logo.svg" alt="Verified.Doctor" fill className="object-contain" />
                </div>
                <span className="text-sm font-semibold text-white/90">
                  verified<span style={{ color: colors.accent }}>.doctor</span>
                </span>
              </Link>
              <Link
                href="/"
                className="text-xs font-medium text-white/70 hover:text-white transition-colors px-4 py-2 rounded-full"
                style={{ backgroundColor: `${colors.textOnPrimary}15` }}
              >
                Get yours →
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="absolute inset-0 flex items-center justify-center pt-12">
            <div className="text-center text-white px-4 max-w-xl">
              {/* Verified Badge */}
              {profile.is_verified && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
                  style={{ backgroundColor: `${colors.textOnPrimary}20` }}
                >
                  <Award className="w-4 h-4" style={{ color: colors.accent }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.accent }}>
                    Verified Physician
                  </span>
                </motion.div>
              )}

              {/* Name */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3"
              >
                {profile.full_name}
              </motion.h1>

              {/* Specialty */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg sm:text-xl font-medium opacity-90 mb-4"
                style={{ color: colors.accent }}
              >
                {profile.specialty}
              </motion.p>

              {/* Quick Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-4 sm:gap-6 text-sm text-white/75"
              >
                {profile.clinic_location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {profile.clinic_location}
                  </span>
                )}
                {profile.years_experience && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {profile.years_experience}+ Years
                  </span>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Profile Photo - Overlapping */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute left-1/2 -translate-x-1/2 -bottom-16 z-20"
        >
          <div
            className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-2xl"
            style={{
              border: `4px solid ${colors.background}`,
              boxShadow: `0 20px 40px ${colors.primary}30`
            }}
          >
            {profile.profile_photo_url ? (
              <Image
                src={profile.profile_photo_url}
                alt={profile.full_name}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-3xl font-bold"
                style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}
              >
                {profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-32">
        {/* Floating Stats Cards */}
        {(recommendationText || connectionText || profile.consultation_fee) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            {recommendationText && (
              <div
                className="p-4 rounded-2xl text-center shadow-lg"
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.cardBorder}`,
                  boxShadow: `0 10px 30px ${colors.primary}10`
                }}
              >
                <ThumbsUp className="w-5 h-5 mx-auto mb-2" style={{ color: colors.primary }} />
                <p className="text-2xl font-bold" style={{ color: colors.text }}>
                  {profile.recommendation_count}
                </p>
                <p className="text-xs" style={{ color: colors.textMuted }}>Recommendations</p>
              </div>
            )}
            {connectionText && (
              <div
                className="p-4 rounded-2xl text-center shadow-lg"
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.cardBorder}`,
                  boxShadow: `0 10px 30px ${colors.primary}10`
                }}
              >
                <Users className="w-5 h-5 mx-auto mb-2" style={{ color: colors.primary }} />
                <p className="text-2xl font-bold" style={{ color: colors.text }}>
                  {profile.connection_count}
                </p>
                <p className="text-xs" style={{ color: colors.textMuted }}>Connections</p>
              </div>
            )}
            {profile.consultation_fee && (
              <div
                className="p-4 rounded-2xl text-center shadow-lg"
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.cardBorder}`,
                  boxShadow: `0 10px 30px ${colors.primary}10`
                }}
              >
                <Sparkles className="w-5 h-5 mx-auto mb-2" style={{ color: colors.primary }} />
                <p className="text-lg font-bold" style={{ color: colors.text }}>
                  {profile.consultation_fee}
                </p>
                <p className="text-xs" style={{ color: colors.textMuted }}>Consultation</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Book Appointment - Primary CTA */}
        {profile.external_booking_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-8"
          >
            <Button
              className="w-full h-14 rounded-2xl font-semibold text-lg shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
                color: colors.textOnPrimary,
                boxShadow: `0 10px 40px ${colors.primary}40`
              }}
              asChild
            >
              <a href={profile.external_booking_url} target="_blank" rel="noopener noreferrer">
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
                <ExternalLink className="w-4 h-4 ml-2 opacity-60" />
              </a>
            </Button>
          </motion.div>
        )}

        {/* Invited By */}
        {invitedBy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center mb-8"
          >
            <Link
              href={`/${invitedBy.handle}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}25 100%)`,
                color: colors.primary
              }}
            >
              <Handshake className="w-4 h-4" />
              Invited by <span className="font-semibold">{invitedBy.full_name}</span>
            </Link>
          </motion.div>
        )}

        {/* Bio */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="text-center mb-10"
          >
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: colors.text }}>
              {showFullBio ? profile.bio : bioTruncated}
            </p>
            {showBioToggle && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="mt-3 text-sm font-medium inline-flex items-center gap-1"
                style={{ color: colors.primary }}
              >
                {showFullBio ? <>Less <ChevronUp className="w-4 h-4" /></> : <>More <ChevronDown className="w-4 h-4" /></>}
              </button>
            )}
          </motion.div>
        )}

        {/* Credentials Row */}
        {(profile.qualifications || profile.languages) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {profile.qualifications && (
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: colors.backgroundAlt, color: colors.text }}
              >
                <GraduationCap className="w-4 h-4" style={{ color: colors.primary }} />
                {profile.qualifications}
              </span>
            )}
            {profile.languages && (
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: colors.backgroundAlt, color: colors.text }}
              >
                <Globe className="w-4 h-4" style={{ color: colors.primary }} />
                {profile.languages}
              </span>
            )}
            {profile.registration_number && (
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: colors.backgroundAlt, color: colors.text }}
              >
                <CheckCircle2 className="w-4 h-4" style={{ color: colors.primary }} />
                {profile.registration_number}
              </span>
            )}
          </motion.div>
        )}

        {/* Profile Sections */}
        <div className="space-y-6">
          {isSectionVisible(visibility, "video") && profile.video_introduction_url && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
              <VideoIntroduction url={profile.video_introduction_url} doctorName={firstName} themeColors={themeColors} />
            </motion.div>
          )}

          {(isSectionVisible(visibility, "availability") || isSectionVisible(visibility, "telemedicine")) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.77 }} className="flex flex-wrap gap-3">
              {isSectionVisible(visibility, "availability") && profile.is_available !== null && (
                <AvailabilityBadge isAvailable={profile.is_available} availabilityNote={profile.availability_note || undefined} themeColors={themeColors} />
              )}
              {isSectionVisible(visibility, "telemedicine") && profile.offers_telemedicine && (
                <TelemedicineBadge offersTelemedicine={profile.offers_telemedicine} themeColors={themeColors} />
              )}
            </motion.div>
          )}

          {isSectionVisible(visibility, "education") && Array.isArray(profile.education_timeline) && profile.education_timeline.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.79 }}>
              <EducationTimeline items={profile.education_timeline as Array<{institution: string; degree: string; year: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "hospitals") && Array.isArray(profile.hospital_affiliations) && profile.hospital_affiliations.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.81 }}>
              <HospitalAffiliations items={profile.hospital_affiliations as Array<{name: string; role: string; department?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {(isSectionVisible(visibility, "conditions") || isSectionVisible(visibility, "procedures")) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.83 }}>
              <ConditionsProcedures
                conditions={isSectionVisible(visibility, "conditions") ? profile.conditions_treated || undefined : undefined}
                procedures={isSectionVisible(visibility, "procedures") ? profile.procedures_performed || undefined : undefined}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {isSectionVisible(visibility, "approach") && profile.approach_to_care && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
              <ApproachToCare content={profile.approach_to_care} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "cases") && Array.isArray(profile.case_studies) && profile.case_studies.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.87 }}>
              <CaseStudies items={profile.case_studies as Array<{title: string; description: string; outcome?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "firstVisit") && profile.first_visit_guide && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.89 }}>
              <FirstVisitGuide content={profile.first_visit_guide} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "memberships") && Array.isArray(profile.professional_memberships) && profile.professional_memberships.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.91 }}>
              <ProfessionalMemberships items={profile.professional_memberships as Array<{organization: string; year?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "media") && Array.isArray(profile.media_publications) && profile.media_publications.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.93 }}>
              <MediaPublications items={profile.media_publications as Array<{title: string; publication: string; link?: string; year?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "gallery") && Array.isArray(profile.clinic_gallery) && profile.clinic_gallery.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}>
              <ClinicGallery images={profile.clinic_gallery as Array<{url: string; caption?: string}>} themeColors={themeColors} />
            </motion.div>
          )}
        </div>

        {/* Services */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.97 }}
            className="mt-10"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.textMuted }}>
              Services
            </h3>
            <div className="flex flex-wrap gap-2">
              {services.map((service, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.accent}20 100%)`,
                    color: colors.text,
                    border: `1px solid ${colors.cardBorder}`
                  }}
                >
                  {service}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommend Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 p-8 rounded-3xl text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
          }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: `${colors.accent}30` }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full translate-y-1/2 -translate-x-1/2" style={{ backgroundColor: `${colors.textOnPrimary}20` }} />

          <div className="relative z-10">
            <ThumbsUp className="w-10 h-10 mx-auto mb-4" style={{ color: colors.accent }} />
            <p className="text-lg font-medium text-white mb-4">
              Had a great experience with {firstName}?
            </p>
            <RecommendButton profileId={profile.id} />
          </div>
        </motion.div>

        {/* Connected Doctors */}
        {connectedDoctors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05 }}
            className="mt-10"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.textMuted }}>
              Professional Network
            </h3>
            <div className="flex -space-x-3">
              {connectedDoctors.slice(0, 8).map((doctor) => (
                <Link
                  key={doctor.id}
                  href={`/${doctor.handle}`}
                  className="relative w-12 h-12 rounded-full hover:z-10 hover:scale-110 transition-transform shadow-lg"
                  style={{ border: `3px solid ${colors.background}` }}
                  title={doctor.full_name}
                >
                  {doctor.profile_photo_url ? (
                    <Image src={doctor.profile_photo_url} alt={doctor.full_name} fill className="object-cover rounded-full" />
                  ) : (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}
                    >
                      {doctor.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                  )}
                </Link>
              ))}
              {connectedDoctors.length > 8 && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold shadow-lg"
                  style={{
                    backgroundColor: colors.backgroundAlt,
                    border: `3px solid ${colors.background}`,
                    color: colors.textMuted
                  }}
                >
                  +{connectedDoctors.length - 8}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      <ProfileActions profile={profile} />
    </div>
  );
}
