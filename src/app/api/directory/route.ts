import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const PROFILE_FIELDS = `
  id,
  handle,
  full_name,
  specialty,
  qualifications,
  bio,
  clinic_location,
  clinic_name,
  profile_photo_url,
  is_verified,
  is_available,
  offers_telemedicine,
  recommendation_count,
  view_count,
  years_experience,
  subscription_plan
`;

type SortOption = "relevance" | "recommendations" | "views" | "newest" | "name";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim() || "";
    const specialty = searchParams.get("specialty")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const telemedicine = searchParams.get("telemedicine") === "true";
    const available = searchParams.get("available") === "true";
    const verified = searchParams.get("verified");
    const sort = (searchParams.get("sort") as SortOption) || "relevance";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10))
    );
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let dbQuery = supabase
      .from("profiles")
      .select(PROFILE_FIELDS, { count: "exact" })
      .eq("is_frozen", false)
      .eq("is_banned", false);

    // Full-text search across multiple fields
    if (q) {
      dbQuery = dbQuery.or(
        `full_name.ilike.%${q}%,specialty.ilike.%${q}%,bio.ilike.%${q}%,conditions_treated.ilike.%${q}%,services.ilike.%${q}%,clinic_location.ilike.%${q}%,qualifications.ilike.%${q}%`
      );
    }

    // Filter by specialty
    if (specialty) {
      dbQuery = dbQuery.ilike("specialty", `%${specialty}%`);
    }

    // Filter by city/location (support both params)
    const locationFilter = city || location;
    if (locationFilter) {
      dbQuery = dbQuery.ilike("clinic_location", `%${locationFilter}%`);
    }

    // Filter by verification status
    if (verified === "true") {
      dbQuery = dbQuery.eq("is_verified", true);
    }

    // Filter by telemedicine
    if (telemedicine) {
      dbQuery = dbQuery.eq("offers_telemedicine", true);
    }

    // Filter by availability
    if (available) {
      dbQuery = dbQuery.eq("is_available", true);
    }

    // Sorting
    switch (sort) {
      case "name":
        dbQuery = dbQuery.order("full_name", { ascending: true });
        break;
      case "recommendations":
        dbQuery = dbQuery.order("recommendation_count", {
          ascending: false,
          nullsFirst: false,
        });
        break;
      case "views":
        dbQuery = dbQuery.order("view_count", {
          ascending: false,
          nullsFirst: false,
        });
        break;
      case "newest":
        dbQuery = dbQuery.order("created_at", { ascending: false });
        break;
      case "relevance":
      default:
        dbQuery = dbQuery
          .order("is_verified", { ascending: false, nullsFirst: false })
          .order("recommendation_count", {
            ascending: false,
            nullsFirst: false,
          });
        break;
    }

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data: profiles, count, error } = await dbQuery;

    if (error) {
      console.error("[api/directory] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch directory" },
        { status: 500 }
      );
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        profiles: profiles || [],
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasMore: page < totalPages,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("[api/directory] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
