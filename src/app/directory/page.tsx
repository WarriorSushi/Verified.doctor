import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { DoctorCard } from "@/components/directory/doctor-card";
import { SearchFilters } from "@/components/directory/search-filters";
import { DirectoryPagination } from "@/components/directory/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search as SearchIcon } from "lucide-react";
import type { DoctorCardProfile } from "@/components/directory/doctor-card";
import { specialtyToSlug, getSpecialtyMeta } from "@/components/directory/specialty-data";

export const revalidate = 60;

const baseUrl = "https://verified.doctor";
const RESULTS_PER_PAGE = 20;

type SortOption = "relevance" | "recommendations" | "views" | "newest";

interface DirectorySearchParams {
  q?: string;
  specialty?: string;
  location?: string;
  telemedicine?: string;
  available?: string;
  sort?: string;
  page?: string;
}

interface DirectoryPageProps {
  searchParams: Promise<DirectorySearchParams>;
}

export async function generateMetadata({
  searchParams,
}: DirectoryPageProps): Promise<Metadata> {
  const params = await searchParams;
  const parts: string[] = [];

  if (params.q) parts.push(params.q);
  if (params.specialty) parts.push(params.specialty);
  if (params.location) parts.push(`in ${params.location}`);

  const filterDesc = parts.length > 0 ? ` — ${parts.join(", ")}` : "";
  const pageNum = params.page ? ` | Page ${params.page}` : "";

  return {
    title: `Find a Doctor${filterDesc}${pageNum} | Verified.Doctor`,
    description: `Browse our directory of verified doctors${filterDesc}. Find trusted medical professionals with verified credentials, patient recommendations, and transparent profiles.`,
    alternates: {
      canonical: `${baseUrl}/directory`,
    },
    openGraph: {
      title: `Find a Verified Doctor${filterDesc}`,
      description:
        "Browse verified doctors with real credentials, patient recommendations, and transparent profiles.",
      url: `${baseUrl}/directory`,
      type: "website",
    },
  };
}

async function fetchDoctors(params: DirectorySearchParams) {
  const supabase = createAdminClient();

  const page = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (page - 1) * RESULTS_PER_PAGE;
  const sort = (params.sort as SortOption) || "relevance";

  let query = supabase
    .from("profiles")
    .select(
      `
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
    `,
      { count: "exact" }
    )
    .eq("is_frozen", false)
    .eq("is_banned", false);

  // Text search
  if (params.q) {
    const q = params.q;
    query = query.or(
      `full_name.ilike.%${q}%,specialty.ilike.%${q}%,bio.ilike.%${q}%,conditions_treated.ilike.%${q}%,services.ilike.%${q}%,clinic_location.ilike.%${q}%`
    );
  }

  if (params.specialty) {
    query = query.ilike("specialty", `%${params.specialty}%`);
  }

  if (params.location) {
    query = query.ilike("clinic_location", `%${params.location}%`);
  }

  if (params.telemedicine === "true") {
    query = query.eq("offers_telemedicine", true);
  }

  if (params.available === "true") {
    query = query.eq("is_available", true);
  }

  // Sorting
  switch (sort) {
    case "recommendations":
      query = query.order("recommendation_count", {
        ascending: false,
        nullsFirst: false,
      });
      break;
    case "views":
      query = query.order("view_count", {
        ascending: false,
        nullsFirst: false,
      });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "relevance":
    default:
      query = query
        .order("is_verified", { ascending: false, nullsFirst: false })
        .order("recommendation_count", {
          ascending: false,
          nullsFirst: false,
        });
      break;
  }

  query = query.range(offset, offset + RESULTS_PER_PAGE - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[directory] Query error:", error);
    return { profiles: [], total: 0, page, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / RESULTS_PER_PAGE);

  return {
    profiles: (data || []) as DoctorCardProfile[],
    total,
    page,
    totalPages,
  };
}

async function fetchSpecialties(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("specialty")
    .eq("is_frozen", false)
    .eq("is_banned", false)
    .not("specialty", "is", null);

  if (!data) return [];

  const specialtySet = new Set<string>();
  for (const row of data) {
    if (row.specialty) {
      specialtySet.add(row.specialty.trim());
    }
  }

  return Array.from(specialtySet).sort();
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200/80 p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-40 mt-3" />
          <Skeleton className="h-10 w-full mt-2.5" />
          <div className="flex gap-2 mt-3.5">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function DirectoryPage({
  searchParams,
}: DirectoryPageProps) {
  const params = await searchParams;
  const [{ profiles, total, page, totalPages }, specialties] =
    await Promise.all([fetchDoctors(params), fetchSpecialties()]);

  const hasFilters = params.q || params.specialty || params.location || params.telemedicine || params.available;

  return (
    <main className="min-h-screen bg-slate-50/50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_2px_20px_-2px_rgba(0,0,0,0.05)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/verified-doctor-logo.svg"
                alt="Verified.Doctor"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight">
              verified<span className="text-[#0099F7]">.doctor</span>
            </span>
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-white bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] rounded-lg shadow-lg shadow-sky-500/20 transition-all duration-200"
          >
            Get Verified
          </Link>
        </div>
      </nav>

      {/* Hero section */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-sky-500" />
              <span className="text-sm font-medium text-sky-600">
                Doctor Directory
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Find a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0099F7] to-[#0070B8]">
                Verified Doctor
              </span>
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-500 leading-relaxed">
              Browse verified medical professionals with real credentials, patient
              recommendations, and transparent profiles.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mt-8">
            <Suspense fallback={<Skeleton className="h-11 w-full rounded-xl" />}>
              <SearchFilters specialties={specialties} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Browse by specialty */}
      {!hasFilters && specialties.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <h2 className="text-sm font-medium text-slate-500 mb-3">
            Browse by specialty
          </h2>
          <div className="flex flex-wrap gap-2">
            {specialties.map((s) => {
              const meta = getSpecialtyMeta(specialtyToSlug(s));
              return (
                <Link
                  key={s}
                  href={`/directory/${specialtyToSlug(s)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-full transition-colors duration-150"
                >
                  <span>{meta.icon}</span>
                  {s}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Results */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {total === 0
              ? "No doctors found"
              : total === 1
              ? "1 doctor found"
              : `${total.toLocaleString()} doctors found`}
            {hasFilters && (
              <span className="text-slate-400"> matching your criteria</span>
            )}
          </p>
          {totalPages > 1 && (
            <p className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </p>
          )}
        </div>

        {/* Doctor cards grid */}
        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <DoctorCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No doctors found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Try adjusting your search or filters. You can also{" "}
              <Link
                href="/directory"
                className="text-sky-600 hover:text-sky-700 underline underline-offset-2"
              >
                browse all doctors
              </Link>
              .
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10">
            <DirectoryPagination
              currentPage={page}
              totalPages={totalPages}
            />
          </div>
        )}
      </section>

      {/* CTA for doctors */}
      <section className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Are you a doctor?
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mb-6 max-w-md mx-auto">
            Get verified and join the directory. Build trust with patients
            before they even walk in.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] rounded-xl shadow-lg shadow-sky-500/20 transition-all duration-200"
          >
            Claim Your Profile
          </Link>
        </div>
      </section>
    </main>
  );
}
