/**
 * Profile Completeness Score & Achievement Badges System
 *
 * Calculates a 0-100% completeness score based on weighted profile fields.
 * Also manages achievement badges for gamification.
 */

import type { Profile } from "@/types/database";

// ─── Score Weights ───────────────────────────────────────────────
// Must sum to 100
interface FieldWeight {
  field: keyof Profile;
  weight: number;
  label: string;
  tip: string;
  /** For JSON/array fields, check if non-empty array */
  isArray?: boolean;
}

const FIELD_WEIGHTS: FieldWeight[] = [
  { field: "profile_photo_url", weight: 15, label: "Profile Photo", tip: "Upload a professional photo to build trust with patients" },
  { field: "bio", weight: 10, label: "Bio", tip: "Write a compelling bio about your practice and approach" },
  { field: "specialty", weight: 10, label: "Specialty", tip: "Add your medical specialty" },
  { field: "qualifications", weight: 8, label: "Qualifications", tip: "List your medical qualifications (MBBS, MD, etc.)" },
  { field: "clinic_name", weight: 5, label: "Clinic Name", tip: "Add your clinic or hospital name" },
  { field: "clinic_location", weight: 5, label: "Location", tip: "Add your practice location so patients can find you" },
  { field: "years_experience", weight: 5, label: "Experience", tip: "Add your years of experience" },
  { field: "languages", weight: 3, label: "Languages", tip: "List the languages you speak" },
  { field: "consultation_fee", weight: 3, label: "Consultation Fee", tip: "Add your consultation fee to set patient expectations" },
  { field: "services", weight: 3, label: "Services", tip: "List the services you offer" },
  { field: "education_timeline", weight: 8, label: "Education Timeline", tip: "Add your education history to showcase your training", isArray: true },
  { field: "hospital_affiliations", weight: 5, label: "Hospital Affiliations", tip: "Add hospital affiliations to boost credibility", isArray: true },
  { field: "approach_to_care", weight: 4, label: "Approach to Care", tip: "Describe your approach to patient care" },
  { field: "conditions_treated", weight: 4, label: "Conditions Treated", tip: "List conditions you treat so patients know you're the right fit" },
  { field: "procedures_performed", weight: 3, label: "Procedures", tip: "Add procedures you perform" },
  { field: "external_booking_url", weight: 3, label: "Booking Link", tip: "Add an online booking link for easy appointment scheduling" },
  { field: "registration_number", weight: 3, label: "Registration Number", tip: "Add your medical registration number for verification" },
  { field: "first_visit_guide", weight: 3, label: "First Visit Guide", tip: "Help patients prepare for their first visit" },
];

// ─── Score Calculation ───────────────────────────────────────────

export interface ScoreTip {
  label: string;
  tip: string;
  weight: number;
  field: string;
}

export interface ProfileScore {
  /** 0-100 */
  score: number;
  /** Number of fields completed */
  completedFields: number;
  /** Total number of scored fields */
  totalFields: number;
  /** Actionable tips to improve score, sorted by highest weight first */
  tips: ScoreTip[];
  /** Fields that are already completed */
  completedList: string[];
}

function isFieldFilled(profile: Profile, fw: FieldWeight): boolean {
  const value = profile[fw.field];

  if (value === null || value === undefined) return false;

  if (fw.isArray) {
    return Array.isArray(value) && value.length > 0;
  }

  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return value > 0;
  if (typeof value === "boolean") return true; // boolean fields are always "filled"

  return Boolean(value);
}

export function calculateProfileScore(profile: Profile): ProfileScore {
  let score = 0;
  const tips: ScoreTip[] = [];
  const completedList: string[] = [];

  for (const fw of FIELD_WEIGHTS) {
    if (isFieldFilled(profile, fw)) {
      score += fw.weight;
      completedList.push(fw.label);
    } else {
      tips.push({
        label: fw.label,
        tip: fw.tip,
        weight: fw.weight,
        field: fw.field as string,
      });
    }
  }

  // Sort tips by weight descending — highest impact first
  tips.sort((a, b) => b.weight - a.weight);

  return {
    score: Math.round(Math.min(score, 100)),
    completedFields: completedList.length,
    totalFields: FIELD_WEIGHTS.length,
    tips,
    completedList,
  };
}

// ─── Achievement Badges ──────────────────────────────────────────

export type BadgeId =
  | "early_adopter"
  | "fully_verified"
  | "well_connected"
  | "recommended"
  | "complete_profile";

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string; // emoji
  color: string; // tailwind color class
}

export const BADGES: Record<BadgeId, Badge> = {
  early_adopter: {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Among the first 100 doctors to join Verified.Doctor",
    icon: "🚀",
    color: "bg-sky-100 text-sky-700 border-sky-200",
  },
  fully_verified: {
    id: "fully_verified",
    name: "Fully Verified",
    description: "Passed credential verification",
    icon: "✅",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  well_connected: {
    id: "well_connected",
    name: "Well Connected",
    description: "10+ professional connections",
    icon: "🤝",
    color: "bg-teal-100 text-teal-700 border-teal-200",
  },
  recommended: {
    id: "recommended",
    name: "Recommended",
    description: "5+ patient recommendations",
    icon: "⭐",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  complete_profile: {
    id: "complete_profile",
    name: "Complete Profile",
    description: "Achieved 100% profile completeness",
    icon: "💯",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

/**
 * Calculate which badges a profile has earned.
 * `profileNumber` is the sequential signup number (1-based) — pass null to skip early adopter check.
 */
export function calculateBadges(
  profile: Profile,
  profileNumber?: number | null
): BadgeId[] {
  const earned: BadgeId[] = [];

  // Early Adopter — first 100 signups
  if (profileNumber != null && profileNumber <= 100) {
    earned.push("early_adopter");
  }

  // Fully Verified
  if (profile.is_verified) {
    earned.push("fully_verified");
  }

  // Well Connected
  if ((profile.connection_count ?? 0) >= 10) {
    earned.push("well_connected");
  }

  // Recommended
  if ((profile.recommendation_count ?? 0) >= 5) {
    earned.push("recommended");
  }

  // Complete Profile
  const { score } = calculateProfileScore(profile);
  if (score >= 100) {
    earned.push("complete_profile");
  }

  return earned;
}
