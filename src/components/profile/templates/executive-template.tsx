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
  Crown,
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

interface ExecutiveTemplateProps {
  profile: Profile;
  connectedDoctors: ConnectedDoctor[];
  invitedBy?: InvitedBy | null;
}

// Helper to check section visibility
function isSectionVisible(visibility: unknown, key: string): boolean {
  if (!visibility || typeof visibility !== "object") return false;
  const v = visibility as Record<string, boolean>;
  return v[key] === true;
}

// Executive theme colors - Luxury dark with gold
const themeColors = {
  primary: "#d4af37",
  accent: "#f5e6c4",
};

// Gold shimmer animation for verified badge
const shimmerVariants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
  },
};

export function ExecutiveTemplate({ profile, connectedDoctors, invitedBy }: ExecutiveTemplateProps) {
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

  return (
    <div className="min-h-screen bg-[#0d0d14]">
      {/* Analytics */}
      <ProfileViewTracker profileId={profile.id} />

      {/* Subtle luxury background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Subtle gold gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d4af37]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#d4af37]/[0.02] rounded-full blur-[100px]" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 px-4 sm:px-6 py-4 border-b border-[#d4af37]/10 bg-[#0d0d14]/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="transition-transform group-hover:scale-105 brightness-0 invert opacity-80">
              <VerifiedBadge isVerified={true} isPro={isPro} size="md" showTooltip={false} />
            </div>
            <span className="text-sm sm:text-base font-medium text-[#f5f5dc]/80 tracking-wide">
              verified<span className="text-[#d4af37]">.doctor</span>
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs sm:text-sm font-medium text-[#d4af37] hover:text-[#f5e6c4] transition-colors tracking-wide"
          >
            Claim yours →
          </Link>
        </div>
      </nav>

      {/* Profile Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-28 sm:pb-32">

        {/* Executive Card - Main Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mb-8"
        >
          {/* Card with gold border effect */}
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-[#d4af37]/40 via-[#d4af37]/20 to-[#d4af37]/40">
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#12121c] rounded-2xl p-6 sm:p-8 relative overflow-hidden">

              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 via-transparent to-transparent pointer-events-none" />

              {/* Content */}
              <div className="relative z-10">
                {/* Avatar + Info Layout */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

                  {/* Avatar with gold ring */}
                  <div className="relative flex-shrink-0">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-[3px] bg-gradient-to-br from-[#d4af37] via-[#c9a227] to-[#d4af37]">
                      {profile.profile_photo_url ? (
                        <Image
                          src={profile.profile_photo_url}
                          alt={profile.full_name}
                          width={144}
                          height={144}
                          priority
                          className="object-cover rounded-full w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#0d0d14] flex items-center justify-center text-[#d4af37] text-3xl sm:text-4xl font-light tracking-wider">
                          {profile.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Verified badge with gold shimmer */}
                    {profile.is_verified && (
                      <motion.div
                        className="absolute -bottom-1 -right-1"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      >
                        <div className="relative">
                          {/* Gold glow */}
                          <div className="absolute inset-0 bg-[#d4af37] rounded-full blur-md opacity-50" />
                          {/* Badge */}
                          <div className="relative">
                            <VerifiedBadge isVerified={profile.is_verified} isPro={isPro} size="lg" />
                          </div>
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            variants={shimmerVariants}
                            animate="animate"
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            style={{ backgroundSize: "200% 100%" }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left">
                    {/* Name */}
                    <h1 className="text-2xl sm:text-3xl font-light text-[#f5f5dc] tracking-wide mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {profile.full_name}
                    </h1>

                    {/* Verified text */}
                    {profile.is_verified && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-[#d4af37] text-xs uppercase tracking-[0.2em] font-medium mb-3"
                      >
                        {isPro ? "✦ Pro Physician ✦" : "✦ Verified Physician ✦"}
                      </motion.p>
                    )}

                    {/* Specialty */}
                    <p className="text-[#d4af37]/90 font-medium text-base sm:text-lg mb-4 tracking-wide">
                      {profile.specialty}
                    </p>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2 text-xs sm:text-sm text-[#f5f5dc]/60">
                      {profile.clinic_location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#d4af37]/60" />
                          {profile.clinic_location}
                        </span>
                      )}
                      {profile.years_experience && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#d4af37]/60" />
                          {profile.years_experience}+ Years
                        </span>
                      )}
                    </div>

                    {/* Metrics */}
                    {(recommendationText || connectionText) && (
                      <div className="flex justify-center sm:justify-start gap-4 mt-4">
                        {recommendationText && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-full">
                            <ThumbsUp className="w-3.5 h-3.5 text-[#d4af37]" />
                            <span className="text-xs font-medium text-[#d4af37]">
                              {profile.recommendation_count}
                            </span>
                          </div>
                        )}
                        {connectionText && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5dc]/5 border border-[#f5f5dc]/10 rounded-full">
                            <Users className="w-3.5 h-3.5 text-[#f5f5dc]/60" />
                            <span className="text-xs font-medium text-[#f5f5dc]/60">
                              {profile.connection_count}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[#d4af37]/30 -translate-x-2 -translate-y-2 rounded-tl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[#d4af37]/30 translate-x-2 translate-y-2 rounded-br-lg" />
        </motion.div>

        {/* Invited By */}
        {invitedBy && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center sm:justify-start mb-6"
          >
            <Link
              href={`/${invitedBy.handle}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-full text-sm text-[#d4af37]/80 hover:bg-[#d4af37]/10 transition-colors"
            >
              <Handshake className="w-4 h-4" />
              <span>
                Invited by <span className="font-medium text-[#d4af37]">{invitedBy.full_name}</span>
              </span>
            </Link>
          </motion.div>
        )}

        {/* Qualifications */}
        {profile.qualifications && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex justify-center sm:justify-start mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] border border-[#d4af37]/20 rounded-full text-sm text-[#f5f5dc]/80">
              <GraduationCap className="w-4 h-4 text-[#d4af37]" />
              {profile.qualifications}
            </span>
          </motion.div>
        )}

        {/* Bio */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <p className="text-[#f5f5dc]/70 text-sm sm:text-base leading-relaxed text-center sm:text-left">
              {showFullBio ? profile.bio : bioTruncated}
            </p>
            {showBioToggle && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="mt-2 text-[#d4af37] text-sm font-medium inline-flex items-center gap-1 hover:text-[#f5e6c4] transition-colors mx-auto sm:mx-0 block sm:inline-flex"
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

        {/* Book Appointment */}
        {profile.external_booking_url && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mb-8"
          >
            <Button
              className="w-full bg-gradient-to-r from-[#d4af37] to-[#c9a227] hover:from-[#e5c04a] hover:to-[#d4af37] text-[#0d0d14] h-12 sm:h-14 rounded-xl font-semibold text-base shadow-lg shadow-[#d4af37]/20 tracking-wide"
              asChild
            >
              <a
                href={profile.external_booking_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Consultation
                <ExternalLink className="w-4 h-4 ml-2 opacity-60" />
              </a>
            </Button>
          </motion.div>
        )}

        {/* Details Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-[#1a1a2e]/80 rounded-xl border border-[#d4af37]/10 p-5 sm:p-6 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {(profile.clinic_name || profile.clinic_location) && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-[#d4af37]/50 uppercase tracking-widest">Location</p>
                  <p className="text-sm text-[#f5f5dc]/90 font-medium">
                    {[profile.clinic_name, profile.clinic_location].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            )}

            {profile.languages && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-[#d4af37]/50 uppercase tracking-widest">Languages</p>
                  <p className="text-sm text-[#f5f5dc]/90 font-medium">{profile.languages}</p>
                </div>
              </div>
            )}

            {profile.consultation_fee && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-[#d4af37]/50 uppercase tracking-widest">Consultation</p>
                  <p className="text-sm text-[#f5f5dc]/90 font-medium">{profile.consultation_fee}</p>
                </div>
              </div>
            )}

            {profile.registration_number && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-[#d4af37]/50 uppercase tracking-widest">Registration</p>
                  <p className="text-sm text-[#f5f5dc]/90 font-medium">{profile.registration_number}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Profile Sections */}
        <div className="space-y-5 mb-8">
          {isSectionVisible(visibility, "video") && profile.video_introduction_url && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <VideoIntroduction
                url={profile.video_introduction_url}
                doctorName={firstName}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {(isSectionVisible(visibility, "availability") || isSectionVisible(visibility, "telemedicine")) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.47 }}
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

          {isSectionVisible(visibility, "education") && Array.isArray(profile.education_timeline) && profile.education_timeline.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.49 }}
            >
              <EducationTimeline
                items={profile.education_timeline as Array<{institution: string; degree: string; year: string}>}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {isSectionVisible(visibility, "hospitals") && Array.isArray(profile.hospital_affiliations) && profile.hospital_affiliations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.51 }}
            >
              <HospitalAffiliations
                items={profile.hospital_affiliations as Array<{name: string; role: string; department?: string}>}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {(isSectionVisible(visibility, "conditions") || isSectionVisible(visibility, "procedures")) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.53 }}
            >
              <ConditionsProcedures
                conditions={isSectionVisible(visibility, "conditions") ? profile.conditions_treated || undefined : undefined}
                procedures={isSectionVisible(visibility, "procedures") ? profile.procedures_performed || undefined : undefined}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {isSectionVisible(visibility, "approach") && profile.approach_to_care && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
            >
              <ApproachToCare
                content={profile.approach_to_care}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {isSectionVisible(visibility, "cases") && Array.isArray(profile.case_studies) && profile.case_studies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.57 }}
            >
              <CaseStudies
                items={profile.case_studies as Array<{title: string; description: string; outcome?: string}>}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {isSectionVisible(visibility, "firstVisit") && profile.first_visit_guide && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.59 }}
            >
              <FirstVisitGuide
                content={profile.first_visit_guide}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {isSectionVisible(visibility, "memberships") && Array.isArray(profile.professional_memberships) && profile.professional_memberships.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.61 }}
            >
              <ProfessionalMemberships
                items={profile.professional_memberships as Array<{organization: string; year?: string}>}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {isSectionVisible(visibility, "media") && Array.isArray(profile.media_publications) && profile.media_publications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.63 }}
            >
              <MediaPublications
                items={profile.media_publications as Array<{title: string; publication: string; link?: string; year?: string}>}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {isSectionVisible(visibility, "gallery") && Array.isArray(profile.clinic_gallery) && profile.clinic_gallery.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
            >
              <ClinicGallery
                images={profile.clinic_gallery as Array<{url: string; caption?: string}>}
                themeColors={themeColors}
              />
            </motion.div>
          )}
        </div>

        {/* Recommendation Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.67 }}
          className="relative p-[1px] rounded-2xl bg-gradient-to-br from-[#d4af37]/30 via-[#d4af37]/10 to-[#d4af37]/30 mb-8"
        >
          <div className="bg-[#1a1a2e] rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
            {/* Subtle shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/5 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <div className="relative z-10">
              <p className="text-[#f5f5dc]/80 text-base sm:text-lg mb-4">
                Appreciate {firstName}&apos;s care? Share your recommendation.
              </p>
              <RecommendButton profileId={profile.id} />
            </div>
          </div>
        </motion.div>

        {/* Services */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mb-8"
          >
            <p className="text-[10px] font-medium text-[#d4af37]/50 uppercase tracking-[0.2em] mb-3 text-center sm:text-left">
              Services Offered
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {services.map((service, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-[#1a1a2e] border border-[#d4af37]/20 rounded-full text-xs sm:text-sm text-[#f5f5dc]/80 font-medium"
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
            transition={{ duration: 0.5, delay: 0.75 }}
            className="mb-6"
          >
            <p className="text-[10px] font-medium text-[#d4af37]/50 uppercase tracking-[0.2em] mb-3 text-center sm:text-left">
              Professional Network
            </p>
            <div className="flex justify-center sm:justify-start -space-x-3">
              {connectedDoctors.slice(0, 6).map((doctor) => (
                <Link
                  key={doctor.id}
                  href={`/${doctor.handle}`}
                  className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full ring-2 ring-[#0d0d14] hover:z-10 hover:scale-110 transition-transform"
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
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/10 flex items-center justify-center text-[#d4af37] text-xs font-medium">
                      {doctor.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                  )}
                </Link>
              ))}
              {connectedDoctors.length > 6 && (
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1a1a2e] ring-2 ring-[#0d0d14] flex items-center justify-center text-xs font-medium text-[#d4af37]">
                  +{connectedDoctors.length - 6}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* Profile Actions */}
      <ProfileActions profile={profile} />
    </div>
  );
}
