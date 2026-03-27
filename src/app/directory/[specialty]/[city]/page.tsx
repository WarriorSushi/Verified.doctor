import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { DoctorCard } from "@/components/directory/doctor-card";
import { SearchFilters } from "@/components/directory/search-filters";
import { DirectoryPagination } from "@/components/directory/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Stethoscope, ArrowLeft } from "lucide-react";
import type { DoctorCardProfile } from "@/components/directory/doctor-card";
import {
  slugToSpecialty,
  slugToCity,
  getSpecialtyMeta,
} from "@/components/directory/specialty-data";

export const revalidate = 60;

const baseUrl = "https://verified.doctor";
const RESULTS_PER_PAGE = 20;

type SortOption = "relevance" | "recommendations" | "views" | "newest";

interface CitySpecialtyPageProps {
  params: Promise<{ specialty: string; city: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({
  params,
}: CitySpecialtyPageProps): Promise<Metadata> {
  const { specialty: specialtySlug, city: citySlug } = await params;
  const specialtyName = slugToSpecialty(specialtySlug);
  const cityName = slugToCity(citySlug);
  const meta = getSpecialtyMeta(specialtySlug);

  const title = `Best Verified ${specialtyName} Doctors in ${cityName}`;
  const description = `Find verified ${specialtyName.toLowerCase()} doctors in ${cityName}. ${meta.description}`;

  return {
    title: `${title} | Verified.Doctor`,
    description,
    alternates: {
      canonical: `${baseUrl}/directory/${specialtySlug}/${citySlug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/directory/${specialtySlug}/${citySlug}`,
      type: "website",
    },
  };
}

async function fetchDoctorsByCityAndSpecialty(
  specialty: string,
  city: string,
  searchParams: Record<string, string | undefined>
) {
  const supabase = createAdminClient();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const offset = (page - 1) * RESULTS_PER_PAGE;
  const sort = (searchParams.sort as SortOption) || "relevance";

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
    .eq("is_banned", false)
    .ilike("specialty", `%${specialty}%`)
    .ilike("clinic_location", `%${city}%`);

  if (searchParams.q) {
    const q = searchParams.q;
    query = query.or(
      `full_name.ilike.%${q}%,bio.ilike.%${q}%`
    );
  }

  if (searchParams.telemedicine === "true") {
    query = query.eq("offers_telemedicine", true);
  }

  if (searchParams.available === "true") {
    query = query.eq("is_available", true);
  }

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
    console.error("[directory/specialty/city] Query error:", error);
    return { profiles: [], total: 0, page, totalPages: 0 };
  }

  const total = count || 0;
  return {
    profiles: (data || []) as DoctorCardProfile[],
    total,
    page,
    totalPages: Math.ceil(total / RESULTS_PER_PAGE),
  };
}

export default async function CitySpecialtyPage({
  params,
  searchParams,
}: CitySpecialtyPageProps) {
  const { specialty: specialtySlug, city: citySlug } = await params;
  const sp = await searchParams;
  const specialtyName = slugToSpecialty(specialtySlug);
  const cityName = slugToCity(citySlug);
  const meta = getSpecialtyMeta(specialtySlug);

  const { profiles, total, page, totalPages } =
    await fetchDoctorsByCityAndSpecialty(specialtyName, cityName, sp);

  const hasFilters = sp.q || sp.telemedicine || sp.available;

  // JSON-LD structured data with location
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: `Verified ${specialtyName} Doctors in ${cityName}`,
    description: `Find verified ${specialtyName.toLowerCase()} doctors in ${cityName}.`,
    url: `${baseUrl}/directory/${specialtySlug}/${citySlug}`,
    medicalSpecialty: specialtyName,
    areaServed: {
      "@type": "City",
      name: cityName,
    },
    parentOrganization: {
      "@type": "Organization",
      name: "Verified.Doctor",
      url: baseUrl,
    },
  };

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

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
              <Link
                href="/directory"
                className="text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                All Doctors
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                href={`/directory/${specialtySlug}`}
                className="text-slate-500 hover:text-sky-600 transition-colors"
              >
                {specialtyName}
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-medium">{cityName}</span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{meta.icon}</span>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-500" />
                <span className="text-sm font-medium text-sky-600">
                  {specialtyName}
                </span>
                <span className="text-slate-300">•</span>
                <MapPin className="w-4 h-4 text-sky-500" />
                <span className="text-sm font-medium text-sky-600">
                  {cityName}
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Best Verified{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0099F7] to-[#0070B8]">
                {specialtyName}
              </span>{" "}
              in {cityName}
            </h1>

            <p className="mt-3 text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl">
              Find verified {specialtyName.toLowerCase()} doctors in {cityName}{" "}
              with real credentials, patient recommendations, and transparent
              profiles.
            </p>

            {/* Conditions treated */}
            {meta.conditions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {meta.conditions.map((condition) => (
                  <span
                    key={condition}
                    className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Search within */}
          <div className="mt-8">
            <Suspense fallback={<Skeleton className="h-11 w-full rounded-xl" />}>
              <SearchFilters />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {total === 0
              ? `No ${specialtyName.toLowerCase()} doctors found in ${cityName}`
              : total === 1
              ? `1 ${specialtyName.toLowerCase()} doctor in ${cityName}`
              : `${total.toLocaleString()} ${specialtyName.toLowerCase()} doctors in ${cityName}`}
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

        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <DoctorCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No {specialtyName.toLowerCase()} doctors in {cityName} yet
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Try{" "}
              <Link
                href={`/directory/${specialtySlug}`}
                className="text-sky-600 hover:text-sky-700 underline underline-offset-2"
              >
                browsing all {specialtyName.toLowerCase()} doctors
              </Link>{" "}
              or{" "}
              <Link
                href="/directory"
                className="text-sky-600 hover:text-sky-700 underline underline-offset-2"
              >
                the full directory
              </Link>
              .
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10">
            <DirectoryPagination currentPage={page} totalPages={totalPages} />
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Are you a {specialtyName.toLowerCase()} specialist in {cityName}?
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mb-6 max-w-md mx-auto">
            Get verified and join the directory. Build trust with patients in{" "}
            {cityName} before they even walk in.
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
