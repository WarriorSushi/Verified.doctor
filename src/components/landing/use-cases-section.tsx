"use client";

import { motion } from "framer-motion";
import { UserPlus, FileCheck, Share2, Star, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Claim Your URL",
    description: "Choose your unique verified.doctor handle. It takes just seconds.",
    accent: "bg-sky-50 text-sky-600 border-sky-200",
    iconBg: "bg-sky-600",
  },
  {
    number: "02",
    icon: FileCheck,
    title: "Build Your Profile",
    description: "Add your credentials, bio, and photo. AI helps you write compelling content.",
    accent: "bg-teal-50 text-teal-600 border-teal-200",
    iconBg: "bg-teal-600",
  },
  {
    number: "03",
    icon: Share2,
    title: "Share Everywhere",
    description: "Display your QR code in your clinic. Share your link with patients.",
    accent: "bg-amber-50 text-amber-600 border-amber-200",
    iconBg: "bg-amber-600",
  },
  {
    number: "04",
    icon: Star,
    title: "Grow Your Reputation",
    description: "Collect patient recommendations and connect with fellow doctors.",
    accent: "bg-emerald-50 text-emerald-600 border-emerald-200",
    iconBg: "bg-emerald-600",
  },
];

export function UseCasesSection() {
  return (
    <section className="py-20 sm:py-28 bg-white overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-medium mb-5">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 mb-5 leading-tight">
            Go live in{" "}
            <span className="text-sky-600">under 5 minutes</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            From signup to verified professional in four simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-[2px]">
            <div className="w-full h-full bg-gradient-to-r from-sky-200 via-teal-200 via-amber-200 to-emerald-200 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 h-full">
                  {/* Number + Icon */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`relative z-10 w-14 h-14 rounded-xl ${step.iconBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-slate-100">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector for mobile/tablet */}
                {index < steps.length - 1 && (
                  <div className="flex lg:hidden justify-center py-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-slate-400 rotate-90 sm:rotate-0" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16 sm:mt-20"
        >
          <a
            href="#top"
            className="inline-flex items-center gap-2 px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-base"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
