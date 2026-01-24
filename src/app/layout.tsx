import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/cookie-consent";
import { AuthHandler } from "@/components/auth/auth-handler";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = "https://verified.doctor";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Verified.Doctor - The Blue Checkmark for Medical Professionals",
    template: "%s | Verified.Doctor",
  },
  description:
    "Premium digital identity and reputation management for doctors. Claim your verified domain, showcase credentials, collect patient recommendations, and build your professional network.",
  keywords: [
    "doctor verification",
    "medical professional verification",
    "verified doctor profile",
    "healthcare digital identity",
    "doctor credentials",
    "patient recommendations",
    "medical reputation management",
    "doctor directory",
    "physician verification",
    "healthcare professional",
    "doctor profile page",
    "medical practitioner",
    "verified physician",
    "doctor QR code",
    "medical professional network",
  ],
  authors: [{ name: "Verified.Doctor", url: baseUrl }],
  creator: "Verified.Doctor",
  publisher: "Verified.Doctor",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/verified-doctor-logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Verified.Doctor",
    title: "Verified.Doctor - The Blue Checkmark for Medical Professionals",
    description:
      "Premium digital identity for doctors. Claim your verified domain, showcase credentials, and build your professional network.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Verified.Doctor - Premium Digital Identity for Medical Professionals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified.Doctor - The Blue Checkmark for Medical Professionals",
    description:
      "Premium digital identity for doctors. Claim your verified domain today.",
    images: ["/og-image.png"],
    creator: "@verifieddoctor",
    site: "@verifieddoctor",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // NOTE: Don't set a global canonical here - each page should define its own
  // canonical URL to prevent all pages from pointing to the homepage
  category: "healthcare",
  classification: "Medical Professional Directory",
  referrer: "origin-when-cross-origin",
  other: {
    "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
    "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
  },
};

// JSON-LD Structured Data for the website
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "Verified.Doctor",
      description: "The Blue Checkmark for Medical Professionals",
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/{search_term}`,
        },
        "query-input": "required name=search_term",
      },
    },
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Verified.Doctor",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/verified-doctor-logo.svg`,
        width: 512,
        height: 512,
      },
      description:
        "Premium digital identity and reputation management platform for medical professionals worldwide.",
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: `${baseUrl}/help`,
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Verified.Doctor",
      operatingSystem: "Web",
      applicationCategory: "HealthApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Digital identity platform for doctors to verify credentials and manage their professional reputation.",
    },
    {
      "@type": "FAQPage",
      "@id": `${baseUrl}/help#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Verified.Doctor?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Verified.Doctor is a premium digital identity platform that provides medical professionals with verified profiles, patient recommendation collection, and professional networking features.",
          },
        },
        {
          "@type": "Question",
          name: "How do I get verified?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "After creating your profile, upload your medical registration certificate and ID for verification. Our team reviews submissions within 24-48 hours.",
          },
        },
        {
          "@type": "Question",
          name: "Is Verified.Doctor free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Verified.Doctor offers a free tier with essential features including profile creation, patient recommendations, and professional connections.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Critical resource hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {/* Preload critical assets */}
        <link rel="preload" href="/verified-doctor-logo.svg" as="image" type="image/svg+xml" />
        {/* Preconnect to Supabase for faster auth/data */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ""} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Suspense fallback={null}>
          <AuthHandler />
        </Suspense>
        {children}
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
