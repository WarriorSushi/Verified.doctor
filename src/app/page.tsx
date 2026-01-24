import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/landing/hero-section";
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
      <RecentlyClaimed />

      {/* Bridge statement */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50/30 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Patients Google You.{" "}
            <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
              Own What They Find.
            </span>
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            A verified profile page that ranks, builds trust, and collects recommendations — automatically.
          </p>
        </div>
      </section>

      <FeaturesSection />
      <UseCasesSection />
      <TrustSignalsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
