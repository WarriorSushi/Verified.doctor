/**
 * Template variable processing for email automation
 */

import { escapeHtml } from "@/lib/utils/html-escape";

export interface TemplateVars {
  name: string;
  handle: string;
  profileUrl: string;
  dashboardUrl: string;
  [key: string]: string;
}

/**
 * Process template string by replacing {{variables}} with HTML-escaped values.
 * All variable values are escaped to prevent HTML/script injection in emails.
 */
export function processTemplate(template: string, vars: TemplateVars): string {
  let processed = template;

  for (const [key, value] of Object.entries(vars)) {
    processed = processed.replace(
      new RegExp(`{{${key}}}`, "g"),
      escapeHtml(value || "")
    );
  }

  return processed;
}

/**
 * Get default template variables for a profile
 */
export function getDefaultVars(profile: {
  full_name: string;
  handle: string;
}): TemplateVars {
  return {
    name: profile.full_name,
    handle: profile.handle,
    profileUrl: `https://verified.doctor/${profile.handle}`,
    dashboardUrl: "https://verified.doctor/dashboard",
  };
}
