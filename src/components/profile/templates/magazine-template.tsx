"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  GraduationCap,
  Globe,
  ThumbsUp,
  Calendar,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Handshake,
  ArrowRight,
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
import { SocialProofWidget } from "../social-proof-widget";
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

interface MagazineTemplateProps {
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
 * MAGAZINE TEMPLATE
 * Aesthetic: Fashion magazine / portfolio site
 * Asymmetric grid with photo offset, dramatic whitespace
 * Mix of ultra-thin and bold typography weights
 * Creative asymmetric section boxes
 */
export function MagazineTemplate({ profile, connectedDoctors, invitedBy, theme }: MagazineTemplateProps) {
  const colors = theme.colors;
  const [showFullBio, setShowFullBio] = useState(false);
  const recommendationText = formatRecommendationCount(profile.recommendation_count || 0);
  const connectionText = formatConnectionCount(profile.connection_count || 0);
  const services = profile.services?.split(",").map((s) => s.trim()).filter(Boolean) || [];
  const firstName = extractFirstName(profile.full_name);
  const visibility = profile.section_visibility;
  const isPro = profile.subscription_status === "pro";

  const bioTruncated = profile.bio && profile.bio.length > 200
    ? profile.bio.slice(0, 200).trim() + "..."
    : profile.bio;
  const showBioToggle = profile.bio && profile.bio.length > 200;

  const themeColors = { primary: colors.primary, accent: colors.accent };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: colors.background }}>
      <ProfileViewTracker profileId={profile.id} />

      {/* Floating Navbar - Offset to the right */}
      <nav className="fixed top-6 right-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl shadow-lg"
          style={{ backgroundColor: `${colors.card}E6`, border: `1px solid ${colors.cardBorder}` }}
        >
          <VerifiedBadge isVerified={true} isPro={isPro} size="sm" showTooltip={false} />
          <span className="text-xs font-medium" style={{ color: colors.text }}>
            Get yours
          </span>
          <ArrowRight className="w-3 h-3" style={{ color: colors.primary }} />
        </Link>
      </nav>

      {/* Hero Section - Asymmetric Split */}
      <section className="relative min-h-[90vh] flex flex-col lg:flex-row">
        {/* Left Side - Photo (Offset) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:w-5/12 relative lg:self-start lg:sticky lg:top-0"
        >
          <div className="lg:h-screen">
            {/* Photo Container - Asymmetric Shape */}
            <div className="h-[60vh] lg:h-full relative overflow-hidden">
              {profile.profile_photo_url ? (
                <Image
                  src={profile.profile_photo_url}
                  alt={profile.full_name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <span className="text-8xl font-thin" style={{ color: colors.textOnPrimary }}>
                    {profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Gradient Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, transparent 60%, ${colors.background} 100%)`
                }}
              />

              {/* Diagonal Cut */}
              <div
                className="absolute bottom-0 right-0 w-full h-32 lg:h-full lg:w-24"
                style={{
                  background: colors.background,
                  clipPath: "polygon(100% 0, 100% 100%, 0 100%)"
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Right Side - Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:w-7/12 relative z-10"
        >
          <div className="px-6 sm:px-12 lg:px-16 py-12 lg:py-24">
            {/* Verified Badge */}
            {profile.is_verified && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase" style={{ color: colors.primary }}>
                  <VerifiedBadge isVerified={profile.is_verified} isPro={isPro} size="sm" />
                  {isPro ? "Pro" : "Verified"}
                </span>
              </motion.div>
            )}

            {/* Name - Large, thin weight */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-extralight tracking-tight leading-none mb-4"
              style={{ color: colors.text }}
            >
              {profile.full_name.split(" ")[0]}
              <br />
              <span className="font-bold">{profile.full_name.split(" ").slice(1).join(" ")}</span>
            </motion.h1>

            {/* Specialty - Bold accent */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl sm:text-2xl font-bold mb-8"
              style={{ color: colors.primary }}
            >
              {profile.specialty}
            </motion.p>

            {/* Horizontal Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex gap-8 mb-8 py-6 border-y"
              style={{ borderColor: colors.cardBorder }}
            >
              {profile.years_experience && (
                <div>
                  <p className="text-3xl font-bold" style={{ color: colors.text }}>{profile.years_experience}+</p>
                  <p className="text-xs tracking-widest uppercase" style={{ color: colors.textMuted }}>Years</p>
                </div>
              )}
              {recommendationText && (
                <div>
                  <p className="text-3xl font-bold" style={{ color: colors.text }}>{profile.recommendation_count}</p>
                  <p className="text-xs tracking-widest uppercase" style={{ color: colors.textMuted }}>Recs</p>
                </div>
              )}
              {connectionText && (
                <div>
                  <p className="text-3xl font-bold" style={{ color: colors.text }}>{profile.connection_count}</p>
                  <p className="text-xs tracking-widest uppercase" style={{ color: colors.textMuted }}>Network</p>
                </div>
              )}
            </motion.div>

            {/* Location & Quick Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              {profile.clinic_location && (
                <span className="inline-flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                  <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                  {profile.clinic_location}
                </span>
              )}
              {profile.languages && (
                <span className="inline-flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                  <Globe className="w-4 h-4" style={{ color: colors.primary }} />
                  {profile.languages}
                </span>
              )}
            </motion.div>

            {/* CTA Button */}
            {profile.external_booking_url && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  className="h-14 px-8 rounded-none font-bold tracking-wider uppercase"
                  style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}
                  asChild
                >
                  <a href={profile.external_booking_url} target="_blank" rel="noopener noreferrer">
                    Book Appointment
                    <ExternalLink className="w-4 h-4 ml-3" />
                  </a>
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Main Content - Single Column Below */}
      <main className="max-w-4xl mx-auto px-6 sm:px-12 pb-32">
        {/* Invited By */}
        {invitedBy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <Link
              href={`/${invitedBy.handle}`}
              className="inline-flex items-center gap-3 group"
            >
              <Handshake className="w-5 h-5" style={{ color: colors.primary }} />
              <span className="text-sm" style={{ color: colors.textMuted }}>
                Invited by{" "}
                <span className="font-bold group-hover:underline" style={{ color: colors.text }}>
                  {invitedBy.full_name}
                </span>
              </span>
            </Link>
          </motion.div>
        )}

        {/* Bio - Large Pull Quote */}
        {profile.bio && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <p className="text-2xl sm:text-3xl font-light leading-relaxed" style={{ color: colors.text }}>
              "{showFullBio ? profile.bio : bioTruncated}"
            </p>
            {showBioToggle && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="mt-6 text-sm font-bold tracking-wider uppercase flex items-center gap-2"
                style={{ color: colors.primary }}
              >
                {showFullBio ? <>Collapse <ChevronUp className="w-4 h-4" /></> : <>Read More <ChevronDown className="w-4 h-4" /></>}
              </button>
            )}
          </motion.section>
        )}

        {/* Credentials - Asymmetric Grid */}
        {(profile.qualifications || profile.registration_number || profile.consultation_fee) && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-px mb-20"
            style={{ backgroundColor: colors.cardBorder }}
          >
            {profile.qualifications && (
              <div className="p-8" style={{ backgroundColor: colors.background }}>
                <GraduationCap className="w-6 h-6 mb-4" style={{ color: colors.primary }} />
                <p className="text-xs tracking-widest uppercase mb-2" style={{ color: colors.textMuted }}>Credentials</p>
                <p className="text-lg font-bold" style={{ color: colors.text }}>{profile.qualifications}</p>
              </div>
            )}
            {profile.registration_number && (
              <div className="p-8" style={{ backgroundColor: colors.background }}>
                <CheckCircle2 className="w-6 h-6 mb-4" style={{ color: colors.primary }} />
                <p className="text-xs tracking-widest uppercase mb-2" style={{ color: colors.textMuted }}>Registration</p>
                <p className="text-lg font-bold" style={{ color: colors.text }}>{profile.registration_number}</p>
              </div>
            )}
            {profile.consultation_fee && (
              <div className="p-8 md:col-span-2" style={{ backgroundColor: colors.background }}>
                <Calendar className="w-6 h-6 mb-4" style={{ color: colors.primary }} />
                <p className="text-xs tracking-widest uppercase mb-2" style={{ color: colors.textMuted }}>Consultation Fee</p>
                <p className="text-3xl font-bold" style={{ color: colors.text }}>{profile.consultation_fee}</p>
              </div>
            )}
          </motion.section>
        )}

        {/* Profile Sections */}
        <div className="space-y-16">
          {isSectionVisible(visibility, "video") && profile.video_introduction_url && (
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <VideoIntroduction url={profile.video_introduction_url} doctorName={firstName} themeColors={themeColors} />
            </motion.div>
          )}

          {(isSectionVisible(visibility, "availability") || isSectionVisible(visibility, "telemedicine")) && (
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-wrap gap-4">
              {isSectionVisible(visibility, "availability") && profile.is_available !== null && (
                <AvailabilityBadge isAvailable={profile.is_available} availabilityNote={profile.availability_note || undefined} themeColors={themeColors} />
              )}
              {isSectionVisible(visibility, "telemedicine") && profile.offers_telemedicine && (
                <TelemedicineBadge offersTelemedicine={profile.offers_telemedicine} themeColors={themeColors} />
              )}
            </motion.div>
          )}

          {isSectionVisible(visibility, "education") && Array.isArray(profile.education_timeline) && profile.education_timeline.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <EducationTimeline items={profile.education_timeline as Array<{institution: string; degree: string; year: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "hospitals") && Array.isArray(profile.hospital_affiliations) && profile.hospital_affiliations.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <HospitalAffiliations items={profile.hospital_affiliations as Array<{name: string; role: string; department?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {(isSectionVisible(visibility, "conditions") || isSectionVisible(visibility, "procedures")) && (
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <ConditionsProcedures
                conditions={isSectionVisible(visibility, "conditions") ? profile.conditions_treated || undefined : undefined}
                procedures={isSectionVisible(visibility, "procedures") ? profile.procedures_performed || undefined : undefined}
                themeColors={themeColors}
              />
            </motion.div>
          )}

          {isSectionVisible(visibility, "approach") && profile.approach_to_care && (
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <ApproachToCare content={profile.approach_to_care} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "cases") && Array.isArray(profile.case_studies) && profile.case_studies.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <CaseStudies items={profile.case_studies as Array<{title: string; description: string; outcome?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "firstVisit") && profile.first_visit_guide && (
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <FirstVisitGuide content={profile.first_visit_guide} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "memberships") && Array.isArray(profile.professional_memberships) && profile.professional_memberships.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <ProfessionalMemberships items={profile.professional_memberships as Array<{organization: string; year?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "media") && Array.isArray(profile.media_publications) && profile.media_publications.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <MediaPublications items={profile.media_publications as Array<{title: string; publication: string; link?: string; year?: string}>} themeColors={themeColors} />
            </motion.div>
          )}

          {isSectionVisible(visibility, "gallery") && Array.isArray(profile.clinic_gallery) && profile.clinic_gallery.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <ClinicGallery images={profile.clinic_gallery as Array<{url: string; caption?: string}>} themeColors={themeColors} />
            </motion.div>
          )}
        </div>

        {/* Services - Horizontal Scroll */}
        {services.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <p className="text-xs tracking-widest uppercase mb-6" style={{ color: colors.textMuted }}>Services</p>
            <div className="flex flex-wrap gap-3">
              {services.map((service, i) => (
                <span
                  key={i}
                  className="px-6 py-3 text-sm font-bold tracking-wide border-2 transition-colors hover:bg-opacity-10"
                  style={{
                    borderColor: colors.primary,
                    color: colors.primary,
                    backgroundColor: 'transparent'
                  }}
                >
                  {service}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Recommend - Full Width Block */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 py-16 -mx-6 sm:-mx-12 px-6 sm:px-12"
          style={{ backgroundColor: colors.backgroundAlt }}
        >
          <div className="text-center max-w-md mx-auto">
            <ThumbsUp className="w-12 h-12 mx-auto mb-6" style={{ color: colors.primary }} />
            <p className="text-2xl font-light mb-2" style={{ color: colors.text }}>
              Recommend
            </p>
            <p className="text-3xl font-bold mb-8" style={{ color: colors.text }}>
              {firstName}
            </p>
            <RecommendButton profileId={profile.id} />
          </div>
        </motion.section>

        {(profile.recommendation_count > 0 || connectedDoctors.length > 0) && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <SocialProofWidget
              recommendationCount={profile.recommendation_count || 0}
              connectedDoctors={connectedDoctors}
            />
          </motion.section>
        )}

        {/* Connected Doctors - Grid */}
        {connectedDoctors.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <p className="text-xs tracking-widest uppercase mb-6" style={{ color: colors.textMuted }}>Network</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {connectedDoctors.slice(0, 8).map((doctor) => (
                <Link
                  key={doctor.id}
                  href={`/${doctor.handle}`}
                  className="relative aspect-square group"
                  title={doctor.full_name}
                >
                  <div className="w-full h-full overflow-hidden">
                    {doctor.profile_photo_url ? (
                      <Image
                        src={doctor.profile_photo_url}
                        alt={doctor.full_name}
                        fill
                        sizes="48px"
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: colors.backgroundAlt, color: colors.primary }}
                      >
                        {doctor.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              {connectedDoctors.length > 8 && (
                <div
                  className="aspect-square flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: colors.backgroundAlt, color: colors.textMuted }}
                >
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
