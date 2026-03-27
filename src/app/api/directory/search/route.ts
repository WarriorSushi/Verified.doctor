import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const RESULTS_PER_PAGE = 20;
const MAX_LIMIT = 50;

type SortOption = "relevance" | "recommendations" | "views" | "newest";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q")?.trim() || "";
    const specialty = searchParams.get("specialty")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const telemedicine = searchParams.get("telemedicine") === "true";
    const available = searchParams.get("available") === "true";
    const sort = (searchParams.get("sort") as SortOption) || "relevance";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get("limit") || String(RESULTS_PER_PAGE), 10))
    );

    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    // Build the query
    let dbQuery = supabase
      .from("profiles")
      .select(
        `
        id,
        handle,
        full_name,
        specialty,
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
      `,
        { count: "exact" }
      )
      .eq("is_frozen", false)
      .eq("is_banned", false);

    // Text search across multiple fields
    if (query) {
      // Use ilike for search across key fields
      dbQuery = dbQuery.or(
        `full_name.ilike.%${query}%,specialty.ilike.%${query}%,bio.ilike.%${query}%,conditions_treated.ilike.%${query}%,services.ilike.%${query}%,clinic_location.ilike.%${query}%`
      );
    }

    // Filter by specialty
    if (specialty) {
      dbQuery = dbQuery.ilike("specialty", `%${specialty}%`);
    }

    // Filter by location
    if (location) {
      dbQuery = dbQuery.ilike("clinic_location", `%${location}%`);
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
        // For relevance, prioritize verified doctors, then by recommendation count
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
      console.error("[directory/search] Database error:", error);
      return NextResponse.json(
        { error: "Failed to search profiles" },
        { status: 500 }
      );
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      profiles: profiles || [],
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("[directory/search] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
