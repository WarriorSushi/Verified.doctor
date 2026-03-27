"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Video, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Common medical specialties
const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Family Medicine",
  "Gastroenterology",
  "General Practice",
  "General Surgery",
  "Gynecology",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Obstetrics",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Plastic Surgery",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology",
];

type SortOption = "relevance" | "recommendations" | "views" | "newest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Most Relevant" },
  { value: "recommendations", label: "Most Recommended" },
  { value: "views", label: "Most Viewed" },
  { value: "newest", label: "Newest" },
];

interface SearchFiltersProps {
  specialties?: string[];
}

export function SearchFilters({ specialties }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial values from URL
  const initialQuery = searchParams.get("q") || "";
  const initialSpecialty = searchParams.get("specialty") || "";
  const initialLocation = searchParams.get("location") || "";
  const initialTelemedicine = searchParams.get("telemedicine") === "true";
  const initialAvailable = searchParams.get("available") === "true";
  const initialSort = (searchParams.get("sort") as SortOption) || "relevance";

  const [query, setQuery] = useState(initialQuery);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const availableSpecialties =
    specialties && specialties.length > 0 ? specialties : SPECIALTIES;

  // Build URL and navigate
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      // Always reset to page 1 when filters change
      params.delete("page");

      router.push(`/directory?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        updateParams({ q: value });
      }, 400);
    },
    [updateParams]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const hasActiveFilters =
    initialSpecialty || initialLocation || initialTelemedicine || initialAvailable;

  const clearAllFilters = () => {
    setQuery("");
    router.push("/directory");
  };

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by name, specialty, condition..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-11 bg-white border-slate-200 text-sm rounded-xl shadow-sm focus-visible:ring-sky-500/30 focus-visible:border-sky-400"
          />
          {query && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile filter toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="lg:hidden h-11 px-3 rounded-xl border-slate-200"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-sky-500 ml-1" />
          )}
        </Button>
      </div>

      {/* Filters row — visible on desktop, togglable on mobile */}
      <div
        className={`${
          mobileFiltersOpen ? "flex" : "hidden"
        } lg:flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap`}
      >
        {/* Specialty filter */}
        <Select
          value={initialSpecialty || "all"}
          onValueChange={(val) =>
            updateParams({ specialty: val === "all" ? "" : val })
          }
        >
          <SelectTrigger className="w-full sm:w-[180px] h-9 rounded-lg border-slate-200 bg-white text-sm">
            <SelectValue placeholder="All Specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {availableSpecialties.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Location filter */}
        <div className="relative w-full sm:w-[180px]">
          <Input
            type="text"
            placeholder="City or location"
            defaultValue={initialLocation}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({ location: e.currentTarget.value });
              }
            }}
            onBlur={(e) => {
              if (e.target.value !== initialLocation) {
                updateParams({ location: e.target.value });
              }
            }}
            className="h-9 bg-white border-slate-200 text-sm rounded-lg"
          />
        </div>

        {/* Sort */}
        <Select
          value={initialSort}
          onValueChange={(val) => updateParams({ sort: val })}
        >
          <SelectTrigger className="w-full sm:w-[170px] h-9 rounded-lg border-slate-200 bg-white text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Toggle buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              updateParams({
                telemedicine: initialTelemedicine ? "" : "true",
              })
            }
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all duration-150 ${
              initialTelemedicine
                ? "bg-sky-50 border-sky-200 text-sky-700"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Telemedicine
          </button>

          <button
            onClick={() =>
              updateParams({
                available: initialAvailable ? "" : "true",
              })
            }
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all duration-150 ${
              initialAvailable
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Available
          </button>
        </div>

        {/* Clear filters */}
        {(hasActiveFilters || query) && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
