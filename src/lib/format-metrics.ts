/**
 * Format recommendation count for display using tiered system.
 * 0: Hidden completely
 * 1-10: "Recommended by patients" (no number)
 * 11-50: "Recommended by 10+ patients"
 * 51-100: "Recommended by 50+ patients"
 * 100+: "Recommended by 100+ patients"
 */
export function formatRecommendationCount(count: number): string | null {
  if (count === 0) return null;
  if (count <= 10) return "Recommended by patients";
  if (count <= 50) return "Recommended by 10+ patients";
  if (count <= 100) return "Recommended by 50+ patients";
  return "Recommended by 100+ patients";
}

/**
 * Format connection count for display.
 */
export function formatConnectionCount(count: number): string | null {
  if (count === 0) return null;
  return `Connected with ${count} doctor${count === 1 ? "" : "s"}`;
}

/**
 * Format view count for display (number only, no "views" suffix).
 */
export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
