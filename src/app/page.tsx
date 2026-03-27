import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { RecentlyClaimed } from "@/components/landing/recently-claimed";
import { PatientJourney } from "@/components/landing/patient-journey";
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

      {/* Bridge Statement */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-900 leading-tight">
            Patients Google you.{" "}
            <span className="text-sky-600">
              Own what they find.
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            A verified profile page that ranks, builds trust, and lets patients reach you — no website builder needed.
          </p>
          <PatientJourney />
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
