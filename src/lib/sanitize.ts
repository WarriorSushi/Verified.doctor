import { z } from "zod";

/**
 * Input sanitization utilities for user-submitted content.
 * Prevents XSS, injection attacks, and other input-based vulnerabilities.
 */

/**
 * Strip HTML tags from a string. Use for plain-text fields like names.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize a string by removing control characters and normalizing whitespace.
 * Preserves newlines for content fields.
 */
export function sanitizeText(input: string, preserveNewlines = false): string {
  let result = input;

  // Remove null bytes and other control characters (except \n, \r, \t)
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Remove zero-width characters (used in homograph attacks)
  result = result.replace(/[\u200B-\u200D\uFEFF\u2060]/g, "");

  // Normalize unicode to NFC form (prevents homograph attacks)
  result = result.normalize("NFC");

  if (preserveNewlines) {
    // Normalize line endings to \n
    result = result.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    // Collapse multiple blank lines to max 2
    result = result.replace(/\n{3,}/g, "\n\n");
    // Trim lines but preserve structure
    result = result
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .trim();
  } else {
    // Collapse all whitespace to single spaces
    result = result.replace(/\s+/g, " ").trim();
  }

  return result;
}

/**
 * Sanitize a name field (no HTML, no special chars except hyphens, apostrophes, dots, spaces).
 */
export function sanitizeName(input: string): string {
  let result = stripHtml(input);
  result = sanitizeText(result);
  // Allow letters (including unicode), spaces, hyphens, apostrophes, dots
  result = result.replace(/[^\p{L}\p{M}\s'.,-]/gu, "");
  // Collapse multiple spaces
  result = result.replace(/\s+/g, " ").trim();
  return result;
}

/**
 * Sanitize a bio/description field. Allows basic text with newlines but no HTML.
 */
export function sanitizeBio(input: string): string {
  let result = stripHtml(input);
  result = sanitizeText(result, true);
  return result;
}

/**
 * Sanitize a message field. Similar to bio but with slightly different limits.
 */
export function sanitizeMessage(input: string): string {
  let result = stripHtml(input);
  result = sanitizeText(result, true);
  return result;
}

/**
 * Sanitize a URL field.
 */
export function sanitizeUrl(input: string): string {
  const trimmed = input.trim();
  
  // Only allow http and https protocols
  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }
    return url.toString();
  } catch {
    // Try with https:// prefix
    try {
      const url = new URL(`https://${trimmed}`);
      if (url.protocol === "https:") {
        return url.toString();
      }
    } catch {
      // Invalid URL
    }
    return "";
  }
}

// ---- Zod refinements for common patterns ---- //

/**
 * Zod string that sanitizes name input.
 */
export const safeNameString = z
  .string()
  .min(1)
  .max(100)
  .transform(sanitizeName);

/**
 * Zod string that sanitizes bio/description input.
 */
export const safeBioString = z
  .string()
  .max(2000)
  .transform(sanitizeBio);

/**
 * Zod string that sanitizes message content.
 */
export const safeMessageString = z
  .string()
  .min(1)
  .max(5000)
  .transform(sanitizeMessage);

/**
 * Zod string that sanitizes and validates URLs.
 */
export const safeUrlString = z
  .string()
  .max(2048)
  .transform(sanitizeUrl)
  .refine((val) => val === "" || val.startsWith("https://") || val.startsWith("http://"), {
    message: "Must be a valid URL",
  });
