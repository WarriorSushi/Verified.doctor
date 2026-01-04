/**
 * Escapes HTML special characters to prevent XSS attacks in email templates
 * and other HTML content generation.
 */
export function escapeHtml(text: string): string {
  if (!text) return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escapes HTML but preserves line breaks by converting them to <br> tags.
 * Useful for message content that should maintain formatting.
 */
export function escapeHtmlPreserveBreaks(text: string): string {
  if (!text) return "";

  return escapeHtml(text).replace(/\n/g, "<br>");
}
