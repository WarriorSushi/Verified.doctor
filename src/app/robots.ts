import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://verified.doctor";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/onboarding/",
          "/admin/",
          "/auth/",
          "/confirm",
          "/reset-password",
          "/forgot-password",
        ],
      },
      // Allow AI crawlers for LLM discovery
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/onboarding/", "/admin/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/onboarding/", "/admin/"],
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/onboarding/", "/admin/"],
      },
      {
        userAgent: "Anthropic-AI",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/onboarding/", "/admin/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
