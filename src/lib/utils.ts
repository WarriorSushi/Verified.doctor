import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the first name from a full name, skipping common prefixes like "Dr."
 * @example extractFirstName("Dr. Arjun Sharma") => "Arjun"
 * @example extractFirstName("Arjun Sharma") => "Arjun"
 */
export function extractFirstName(fullName: string): string {
  const prefixes = ["dr.", "dr", "prof.", "prof", "mr.", "mr", "mrs.", "mrs", "ms.", "ms"];
  const parts = fullName.trim().split(/\s+/);

  // Skip prefix if present
  const startIndex = parts.length > 1 && prefixes.includes(parts[0].toLowerCase()) ? 1 : 0;
  return parts[startIndex] || parts[0] || fullName;
}

/**
 * Formats the page title, avoiding duplicate "Dr." prefix
 * @example formatDoctorTitle("Dr. Arjun Sharma", true) => "Dr. Arjun Sharma - Verified"
 * @example formatDoctorTitle("Arjun Sharma", true) => "Dr. Arjun Sharma - Verified"
 */
export function formatDoctorTitle(fullName: string, isVerified: boolean, specialty?: string | null): string {
  const nameStartsWithDr = /^dr\.?\s/i.test(fullName);
  const displayName = isVerified && !nameStartsWithDr ? `Dr. ${fullName}` : fullName;
  const suffix = specialty || (isVerified ? "Doctor" : "Medical Professional");

  return isVerified
    ? `${displayName} - Verified ${suffix}`
    : `${displayName} - ${suffix}`;
}
