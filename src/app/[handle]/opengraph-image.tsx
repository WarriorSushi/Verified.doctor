import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const revalidate = 300;
export const alt = "Doctor Profile - Verified.Doctor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, specialty, clinic_location, is_verified, recommendation_count, connection_count, years_experience, profile_photo_url"
    )
    .eq("handle", handle.toLowerCase())
    .single();

  if (!profile) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "#0f172a",
            color: "#fff",
            fontSize: 48,
            fontFamily: "sans-serif",
          }}
        >
          Verified.Doctor
        </div>
      ),
      { ...size }
    );
  }

  const isVerified = profile.is_verified;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          fontFamily: "sans-serif",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Top accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #0099F7, #A4FDFF)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
            flex: 1,
          }}
        >
          {/* Profile photo or initials */}
          {profile.profile_photo_url ? (
            <img
              src={profile.profile_photo_url}
              alt=""
              width={160}
              height={160}
              style={{
                borderRadius: "80px",
                objectFit: "cover",
                border: "4px solid rgba(0, 153, 247, 0.3)",
              }}
            />
          ) : (
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "80px",
                background: "linear-gradient(135deg, #0099F7, #0070B8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 56,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {profile.full_name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "#f8fafc",
                  lineHeight: 1.1,
                }}
              >
                {profile.full_name}
              </span>
              {isVerified && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(0, 153, 247, 0.15)",
                    border: "1px solid rgba(0, 153, 247, 0.3)",
                    borderRadius: "20px",
                    padding: "4px 14px",
                    fontSize: 18,
                    color: "#38bdf8",
                    fontWeight: 600,
                  }}
                >
                  ✓ Verified
                </div>
              )}
            </div>

            {profile.specialty && (
              <span style={{ fontSize: 28, color: "#0099F7", fontWeight: 500 }}>
                {profile.specialty}
              </span>
            )}

            {profile.clinic_location && (
              <span style={{ fontSize: 22, color: "#94a3b8" }}>
                📍 {profile.clinic_location}
              </span>
            )}

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                gap: "32px",
                marginTop: "16px",
              }}
            >
              {profile.years_experience && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#f8fafc" }}>
                    {profile.years_experience}+
                  </span>
                  <span style={{ fontSize: 14, color: "#64748b" }}>Years Exp.</span>
                </div>
              )}
              {(profile.recommendation_count ?? 0) > 0 && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#f8fafc" }}>
                    {profile.recommendation_count}
                  </span>
                  <span style={{ fontSize: 14, color: "#64748b" }}>Recommendations</span>
                </div>
              )}
              {(profile.connection_count ?? 0) > 0 && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#f8fafc" }}>
                    {profile.connection_count}
                  </span>
                  <span style={{ fontSize: 14, color: "#64748b" }}>Connections</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: 22, fontWeight: 600, color: "#cbd5e1" }}>
              verified
            </span>
            <span style={{ fontSize: 22, fontWeight: 600, color: "#0099F7" }}>
              .doctor
            </span>
            <span style={{ fontSize: 22, color: "#475569" }}>/{handle}</span>
          </div>
          <span style={{ fontSize: 16, color: "#475569" }}>
            The Blue Checkmark for Doctors
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
