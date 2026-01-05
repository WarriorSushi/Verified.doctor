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
  ChevronDown,
  ChevronUp,
  Handshake,
  BookOpen,
  Award,
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

interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    backgroundAlt: string;
    primary: string;
    primaryHover: string;
    accent: string;
    text: string;
    textMuted: string;
    textOnPrimary: string;
    card: string;
    cardBorder: string;
    gradientFrom?: string;
    gradientTo?: string;
    isDark?: boolean;
  };
}

interface TimelineTemplateProps {
  profile: Profile;
  connectedDoctors: ConnectedDoctor[];
  invitedBy?: InvitedBy | null;
  theme: ThemeConfig;
}

// Helper to check section visibility
function isSectionVisible(visibility: unknown, key: string): boolean {
  if (!visibility || typeof visibility !== "object") return false;
  const v = visibility as Record<string, boolean>;
  return v[key] === true;
}

// Timeline milestone component
function TimelineMilestone({
  year,
  title,
  subtitle,
  index
}: {
  year: string;
  title: string;
  subtitle?: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      className="relative pl-8 pb-8 last:pb-0"
    >
      {/* Vertical line */}
      <div className="absolute left-[11px] top-3 bottom-0 w-px bg-gradient-to-b from-[#c2410c] to-[#c2410c]/20" />

      {/* Dot with pulse */}
      <div className="absolute left-0 top-1">
        <div className="relative">
          <motion.div
            className="absolute inset-0 w-6 h-6 bg-[#c2410c]/20 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
          />
          <div className="relative w-6 h-6 bg-[#faf7f2] border-2 border-[#c2410c] rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-[#c2410c] rounded-full" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <span className="inline-block px-2 py-0.5 bg-[#c2410c]/10 text-[#c2410c] text-xs font-semibold rounded mb-2 font-mono">
          {year}
        </span>
        <h4 className="text-stone-800 font-semibold" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
          {title}
        </h4>
        {subtitle && (
          <p className="text-stone-500 text-sm mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

export function TimelineTemplate({ profile, connectedDoctors, invitedBy, theme }: TimelineTemplateProps) {
  const colors = theme.colors;
  const themeColors = { primary: colors.primary, accent: colors.accent };
  const [showFullBio, setShowFullBio] = useState(false);
  const recommendationText = formatRecommendationCount(profile.recommendation_count || 0);
  const connectionText = formatConnectionCount(profile.connection_count || 0);
  const services = profile.services?.split(",").map((s) => s.trim()).filter(Boolean) || [];
  const firstName = extractFirstName(profile.full_name);
  const visibility = profile.section_visibility;

  const bioTruncated = profile.bio && profile.bio.length > 150
    ? profile.bio.slice(0, 150).trim() + "..."
    : profile.bio;
  const showBioToggle = profile.bio && profile.bio.length > 150;

  // Build timeline items from education
  const educationItems = Array.isArray(profile.education_timeline)
    ? (profile.education_timeline as Array<{institution: string; degree: string; year: string}>)
    : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf7f2" }}>
      {/* Analytics */}
      <ProfileViewTracker profileId={profile.id} />

      {/* Subtle grain texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-[#c2410c] via-[#fbbf24] to-[#c2410c]" />

      {/* Navbar - Editorial style */}
      <nav className="relative z-20 px-4 sm:px-6 py-4 border-b border-stone-200/60 bg-[#faf7f2]/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-105">
              <Image
                src="/verified-doctor-logo.svg"
                alt="Verified.Doctor"
                fill
                className="object-contain"
              />
            </div>
            <span
              className="text-sm sm:text-base font-semibold text-stone-700"
              style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}
            >
              verified<span className="text-[#c2410c]">.doctor</span>
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs sm:text-sm font-medium text-[#c2410c] hover:text-[#9a3412] transition-colors"
          >
            Claim yours →
          </Link>
        </div>
      </nav>

      {/* Profile Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-28 sm:pb-32">
        {/* Editorial Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          {/* Category label */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <span className="inline-block px-3 py-1 bg-[#c2410c]/10 border border-[#c2410c]/30 rounded-full text-xs font-semibold tracking-widest uppercase text-[#c2410c]">
              {profile.specialty || "Medical Professional"}
            </span>
          </motion.div>

          {/* Avatar with decorative ring */}
          <motion.div
            className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {/* Decorative ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#c2410c]/40 animate-[spin_30s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border border-stone-300" />

            {profile.profile_photo_url ? (
              <Image
                src={profile.profile_photo_url}
                alt={profile.full_name}
                fill
                priority
                sizes="(max-width: 640px) 112px, 144px"
                className="object-cover rounded-full p-2"
              />
            ) : (
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center text-[#faf7f2] text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                {profile.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}

            {/* Verified badge */}
            {profile.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-[#faf7f2] rounded-full p-1 shadow-lg">
                <Image
                  src="/verified-doctor-logo.svg"
                  alt="Verified"
                  fill
                  className="object-contain p-1"
                />
              </div>
            )}
          </motion.div>

          {/* Name - Large editorial serif */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-800 mb-3 tracking-tight"
            style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {profile.full_name}
          </motion.h1>

          {/* Verified capsule */}
          {profile.is_verified && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mb-4"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Physician
              </span>
            </motion.div>
          )}

          {/* Decorative divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#c2410c]/40" />
            <Award className="w-4 h-4 text-[#c2410c]" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#c2410c]/40" />
          </motion.div>

          {/* Qualifications */}
          {profile.qualifications && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-stone-600 text-sm sm:text-base font-medium mb-4"
            >
              {profile.qualifications}
            </motion.p>
          )}

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-stone-500"
          >
            {profile.clinic_location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#c2410c]" />
                {profile.clinic_location}
              </span>
            )}
            {profile.years_experience && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#c2410c]" />
                {profile.years_experience}+ years
              </span>
            )}
            {profile.languages && (
              <span className="inline-flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#c2410c]" />
                {profile.languages}
              </span>
            )}
          </motion.div>

          {/* Metrics */}
          {(recommendationText || connectionText) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-center gap-4 mt-5"
            >
              {recommendationText && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg shadow-sm">
                  <ThumbsUp className="w-4 h-4 text-[#c2410c]" />
                  <span className="text-sm font-semibold text-stone-700">
                    {profile.recommendation_count} {profile.recommendation_count === 1 ? "recommendation" : "recommendations"}
                  </span>
                </div>
              )}
              {connectionText && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg shadow-sm">
                  <Users className="w-4 h-4 text-stone-500" />
                  <span className="text-sm font-semibold text-stone-700">
                    {profile.connection_count} connected
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </motion.header>

        {/* Invited By */}
        {invitedBy && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex justify-center mb-6"
          >
            <Link
              href={`/${invitedBy.handle}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-600 hover:border-[#c2410c]/50 hover:shadow-sm transition-all"
            >
              <Handshake className="w-4 h-4 text-[#c2410c]" />
              <span>
                Invited by <span className="font-medium text-stone-800">{invitedBy.full_name}</span>
              </span>
            </Link>
          </motion.div>
        )}

        {/* Bio - Editorial pull quote style */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 px-6 py-5 border-l-4 border-[#c2410c] bg-white rounded-r-lg shadow-sm"
          >
            <BookOpen className="w-5 h-5 text-[#c2410c] mb-3" />
            <p
              className="text-stone-600 text-base sm:text-lg leading-relaxed italic"
              style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}
            >
              {showFullBio ? profile.bio : bioTruncated}
            </p>
            {showBioToggle && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="mt-3 text-[#c2410c] text-sm font-medium inline-flex items-center gap-1 hover:text-[#9a3412]"
              >
                {showFullBio ? (
                  <>Show less <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Continue reading <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            )}
          </motion.div>
        )}

        {/* Book Appointment */}
        {profile.external_booking_url && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mb-10"
          >
            <Button
              className="w-full bg-[#c2410c] hover:bg-[#9a3412] text-white h-12 rounded-lg font-semibold shadow-lg shadow-[#c2410c]/20 border-2 border-[#c2410c]"
              asChild
            >
              <a
                href={profile.external_booking_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Consultation
                <ExternalLink className="w-4 h-4 ml-2 opacity-60" />
              </a>
            </Button>
          </motion.div>
        )}

        {/* Career Timeline Section */}
        {educationItems.length > 0 && isSectionVisible(visibility, "education") && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
              <h3
                className="text-lg font-semibold text-stone-700 tracking-wide"
                style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}
              >
                Career Journey
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
            </div>

            <div className="ml-2">
              {educationItems.map((item, index) => (
                <TimelineMilestone
                  key={index}
                  year={item.year}
                  title={item.degree}
                  subtitle={item.institution}
                  index={index}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Profile Sections */}
        <div className="space-y-6 mb-10">
          {/* Video Introduction */}
          {isSectionVisible(visibility, "video") && profile.video_introduction_url && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
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
              transition={{ duration: 0.4, delay: 0.37 }}
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

          {/* Hospital Affiliations */}
          {isSectionVisible(visibility, "hospitals") && Array.isArray(profile.hospital_affiliations) && profile.hospital_affiliations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.39 }}
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
              transition={{ duration: 0.4, delay: 0.41 }}
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
              transition={{ duration: 0.4, delay: 0.43 }}
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
              transition={{ duration: 0.4, delay: 0.45 }}
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
              transition={{ duration: 0.4, delay: 0.47 }}
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
              transition={{ duration: 0.4, delay: 0.49 }}
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
              transition={{ duration: 0.4, delay: 0.51 }}
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
              transition={{ duration: 0.4, delay: 0.53 }}
            >
              <ClinicGallery
                images={profile.clinic_gallery as Array<{url: string; caption?: string}>}
                themeColors={themeColors}
              />
            </motion.div>
          )}
        </div>

        {/* Recommendation Section - Editorial card style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 text-center mb-8 relative overflow-hidden shadow-sm"
        >
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#c2410c]/30 rounded-tl-xl" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#c2410c]/30 rounded-br-xl" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="w-12 h-12 mx-auto mb-4 bg-[#c2410c]/10 rounded-full flex items-center justify-center"
          >
            <ThumbsUp className="w-6 h-6 text-[#c2410c]" />
          </motion.div>

          <p
            className="text-stone-700 text-lg sm:text-xl font-medium mb-5"
            style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}
          >
            Recommend {firstName}
          </p>
          <p className="text-stone-500 text-sm mb-5 max-w-md mx-auto">
            Had a positive experience? Your recommendation helps others find quality care.
          </p>
          <RecommendButton profileId={profile.id} />
        </motion.div>

        {/* Services */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Services</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {services.map((service, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-white border border-stone-200 rounded-full text-sm text-stone-600 font-medium shadow-sm hover:border-[#c2410c]/30 transition-colors"
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
            transition={{ duration: 0.4, delay: 0.65 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Network</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
            </div>
            <div className="flex justify-center -space-x-3">
              {connectedDoctors.slice(0, 7).map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                >
                  <Link
                    href={`/${doctor.handle}`}
                    className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full border-3 border-[#faf7f2] shadow-md hover:z-10 hover:scale-110 transition-transform block"
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
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-stone-600 text-xs font-bold">
                        {doctor.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
              {connectedDoctors.length > 7 && (
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border-3 border-[#faf7f2] shadow-md flex items-center justify-center text-sm font-semibold text-[#c2410c]">
                  +{connectedDoctors.length - 7}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Details Card */}
        {(profile.clinic_name || profile.consultation_fee || profile.registration_number) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.clinic_name && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#c2410c]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#c2410c]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Practice</p>
                    <p className="text-sm text-stone-700 font-medium">{profile.clinic_name}</p>
                  </div>
                </div>
              )}

              {profile.consultation_fee && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#c2410c]/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[#c2410c]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Consultation</p>
                    <p className="text-sm text-stone-700 font-medium">{profile.consultation_fee}</p>
                  </div>
                </div>
              )}

              {profile.registration_number && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#c2410c]/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-[#c2410c]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Registration</p>
                    <p className="text-sm text-stone-700 font-medium font-mono">{profile.registration_number}</p>
                  </div>
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
