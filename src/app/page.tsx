import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { ProfileShowcase } from "@/components/landing/profile-showcase";
import { RecentlyClaimed } from "@/components/landing/recently-claimed";
import { FeaturesSection } from "@/components/landing/features-section";
import { UseCasesSection } from "@/components/landing/use-cases-section";
import { TrustSignalsSection } from "@/components/landing/trust-signals-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

const baseUrl = "https://verified.doctor";

export const metadata: Metadata = {
  alternates: {
    canonical: baseUrl,
  },
};

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <ProfileShowcase />
      <RecentlyClaimed />
      <FeaturesSection />
      <UseCasesSection />
      <TrustSignalsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
