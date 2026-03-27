import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Badge dimensions by size
const SIZES = {
  small: { width: 280, height: 60, fontSize: 12, titleSize: 14, pad: 10, iconSize: 14, radius: 8 },
  medium: { width: 360, height: 76, fontSize: 14, titleSize: 17, pad: 14, iconSize: 16, radius: 10 },
  large: { width: 440, height: 92, fontSize: 16, titleSize: 20, pad: 18, iconSize: 20, radius: 12 },
} as const;

type BadgeSize = keyof typeof SIZES;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateVerifiedBadge(
  name: string,
  specialty: string | null,
  theme: "light" | "dark",
  size: BadgeSize
): string {
  const s = SIZES[size];
  const teal = "#14b8a6";
  const bg = theme === "dark" ? "#0f172a" : "#ffffff";
  const border = theme === "dark" ? "#1e293b" : "#e2e8f0";
  const textPrimary = theme === "dark" ? "#f1f5f9" : "#0f172a";
  const textSecondary = theme === "dark" ? "#94a3b8" : "#64748b";
  const brandText = theme === "dark" ? "#94a3b8" : "#64748b";
  const brandAccent = "#0099F7";
  const checkBg = teal;

  const escapedName = escapeXml(name);
  const escapedSpecialty = specialty ? escapeXml(specialty) : null;

  // Layout: [check icon] [name + specialty] [verified.doctor branding]
  const checkX = s.pad + s.iconSize / 2;
  const checkY = s.height / 2;
  const textX = s.pad + s.iconSize + s.pad * 0.7;
  const nameY = escapedSpecialty ? s.height * 0.38 : s.height * 0.45;
  const specialtyY = s.height * 0.62;
  const brandX = s.width - s.pad;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s.width}" height="${s.height}" viewBox="0 0 ${s.width} ${s.height}">
  <rect x="0.5" y="0.5" width="${s.width - 1}" height="${s.height - 1}" rx="${s.radius}" fill="${bg}" stroke="${border}" stroke-width="1"/>
  <circle cx="${checkX}" cy="${checkY}" r="${s.iconSize * 0.65}" fill="${checkBg}"/>
  <path d="M${checkX - s.iconSize * 0.25} ${checkY} l${s.iconSize * 0.18} ${s.iconSize * 0.18} l${s.iconSize * 0.32} ${-s.iconSize * 0.35}" stroke="white" stroke-width="${Math.max(1.5, s.iconSize * 0.12)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="${textX}" y="${nameY}" font-family="system-ui, -apple-system, sans-serif" font-size="${s.titleSize}" font-weight="600" fill="${textPrimary}" dominant-baseline="middle">${escapedName}</text>
  ${escapedSpecialty ? `<text x="${textX}" y="${specialtyY}" font-family="system-ui, -apple-system, sans-serif" font-size="${s.fontSize}" fill="${textSecondary}" dominant-baseline="middle">${escapedSpecialty}</text>` : ""}
  <text x="${brandX}" y="${s.height * 0.42}" font-family="system-ui, -apple-system, sans-serif" font-size="${s.fontSize * 0.85}" fill="${brandText}" text-anchor="end" dominant-baseline="middle">verified<tspan fill="${brandAccent}">.doctor</tspan></text>
  <text x="${brandX}" y="${s.height * 0.62}" font-family="system-ui, -apple-system, sans-serif" font-size="${s.fontSize * 0.75}" fill="${teal}" text-anchor="end" dominant-baseline="middle">✓ Verified</text>
</svg>`;
}

function generateNotVerifiedBadge(
  theme: "light" | "dark",
  size: BadgeSize
): string {
  const s = SIZES[size];
  const bg = theme === "dark" ? "#0f172a" : "#ffffff";
  const border = theme === "dark" ? "#1e293b" : "#e2e8f0";
  const textPrimary = theme === "dark" ? "#64748b" : "#94a3b8";
  const brandText = theme === "dark" ? "#475569" : "#94a3b8";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s.width}" height="${s.height}" viewBox="0 0 ${s.width} ${s.height}">
  <rect x="0.5" y="0.5" width="${s.width - 1}" height="${s.height - 1}" rx="${s.radius}" fill="${bg}" stroke="${border}" stroke-width="1"/>
  <text x="${s.width / 2}" y="${s.height / 2}" font-family="system-ui, -apple-system, sans-serif" font-size="${s.titleSize}" fill="${textPrimary}" text-anchor="middle" dominant-baseline="middle">Not Verified</text>
  <text x="${s.width - s.pad}" y="${s.height - s.pad}" font-family="system-ui, -apple-system, sans-serif" font-size="${s.fontSize * 0.7}" fill="${brandText}" text-anchor="end" dominant-baseline="auto">verified.doctor</text>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const { searchParams } = request.nextUrl;

  const theme = searchParams.get("theme") === "dark" ? "dark" : "light";
  const sizeParam = searchParams.get("size") || "medium";
  const size: BadgeSize = (sizeParam in SIZES) ? sizeParam as BadgeSize : "medium";

  // Fetch doctor profile using admin client (no auth needed for public badge)
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, specialty, is_verified")
    .eq("handle", handle.toLowerCase())
    .single();

  let svg: string;

  if (!profile || !profile.is_verified) {
    svg = generateNotVerifiedBadge(theme, size);
  } else {
    svg = generateVerifiedBadge(
      profile.full_name,
      profile.specialty,
      theme,
      size
    );
  }

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
