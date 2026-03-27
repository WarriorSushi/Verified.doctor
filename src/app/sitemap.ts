import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://verified.doctor";
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/directory`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic doctor profile pages
  const { data: profiles } = await supabase
    .from("profiles")
    .select("handle, updated_at, is_verified, specialty")
    .eq("is_frozen", false)
    .order("updated_at", { ascending: false });

  const profilePages: MetadataRoute.Sitemap = (profiles || []).map((profile) => ({
    url: `${baseUrl}/${profile.handle}`,
    lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    // Verified doctors get higher priority
    priority: profile.is_verified ? 0.9 : 0.8,
  }));

  // Directory specialty pages
  const specialtySet = new Set<string>();
  for (const profile of profiles || []) {
    if (profile.specialty) {
      specialtySet.add(profile.specialty.trim());
    }
  }

  const directoryPages: MetadataRoute.Sitemap = Array.from(specialtySet).map(
    (specialty) => ({
      url: `${baseUrl}/directory?specialty=${encodeURIComponent(specialty)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })
  );

  return [...staticPages, ...directoryPages, ...profilePages];
}
