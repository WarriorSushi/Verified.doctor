import Link from "next/link";
import Image from "next/image";
import { MapPin, ThumbsUp, Video, Clock, MessageSquare } from "lucide-react";
import { VerifiedBadge } from "@/components/profile/verified-badge";

export interface DoctorCardProfile {
  id: string;
  handle: string;
  full_name: string;
  specialty: string | null;
  qualifications: string | null;
  bio: string | null;
  clinic_location: string | null;
  clinic_name: string | null;
  profile_photo_url: string | null;
  is_verified: boolean | null;
  is_available: boolean | null;
  offers_telemedicine: boolean | null;
  recommendation_count: number | null;
  view_count: number | null;
  years_experience: number | null;
  subscription_plan: string | null;
}

interface DoctorCardProps {
  profile: DoctorCardProfile;
}

export function DoctorCard({ profile }: DoctorCardProps) {
  const isPro = profile.subscription_plan === "pro";
  const displayName = profile.full_name.match(/^dr\.?\s/i)
    ? profile.full_name
    : `Dr. ${profile.full_name}`;

  // Format qualifications (e.g. "MD, FACC")
  const credentials = profile.qualifications
    ? profile.qualifications
        .split(/[,;\n]/)
        .map((q) => q.trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(", ")
    : null;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:shadow-sky-100/50 hover:border-sky-200/60 transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0099F7] to-[#0080CC] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Verified shimmer overlay */}
      {profile.is_verified && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-sky-100">
            ✓ Verified
          </span>
        </div>
      )}

      <Link href={`/${profile.handle}`} className="block flex-1">
        <div className="p-5 pb-3">
          {/* Header: Photo + Name + Specialty */}
          <div className="flex items-start gap-4">
            {/* Photo */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 ring-2 ring-slate-100 group-hover:ring-sky-100 transition-all duration-300">
              {profile.profile_photo_url ? (
                <Image
                  src={profile.profile_photo_url}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-50 to-sky-100 text-sky-600 font-semibold text-xl">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name + Specialty */}
            <div className="flex-1 min-w-0 pr-12">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-slate-900 truncate text-[15px] group-hover:text-sky-700 transition-colors duration-200">
                  {displayName}
                </h3>
                <VerifiedBadge
                  isVerified={profile.is_verified ?? false}
                  isPro={isPro}
                  size="xs"
                />
              </div>
              {credentials && (
                <p className="text-xs text-slate-400 mt-0.5 truncate font-medium">
                  {credentials}
                </p>
              )}
              {profile.specialty && (
                <p className="text-sm text-sky-600 mt-1 truncate font-medium">
                  {profile.specialty}
                </p>
              )}
              {profile.years_experience && profile.years_experience > 0 && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {profile.years_experience}+ years experience
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          {profile.clinic_location && (
            <div className="flex items-center gap-1.5 mt-3 text-sm text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{profile.clinic_location}</span>
            </div>
          )}

          {/* Bio preview */}
          {profile.bio && (
            <p className="text-sm text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Badges row */}
          <div className="flex items-center gap-2 mt-3.5 flex-wrap">
            {/* Recommendations */}
            {(profile.recommendation_count ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 bg-sky-50 px-2 py-1 rounded-full">
                <ThumbsUp className="w-3 h-3" />
                {profile.recommendation_count} recommended
              </span>
            )}

            {/* Available */}
            {profile.is_available && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                Available
              </span>
            )}

            {/* Telemedicine */}
            {profile.offers_telemedicine && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                <Video className="w-3 h-3" />
                Telemedicine
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action bar */}
      <div className="px-5 pb-4 pt-1 mt-auto flex items-center gap-2">
        <Link
          href={`/${profile.handle}`}
          className="flex-1 inline-flex items-center justify-center h-9 text-sm font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors duration-200"
        >
          View Profile
        </Link>
        <Link
          href={`/${profile.handle}?inquiry=true`}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          title="Send Inquiry"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Inquire</span>
        </Link>
      </div>
    </div>
  );
}
