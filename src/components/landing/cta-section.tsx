"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 sm:py-28 bg-slate-900 overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-sky-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/10 mb-8">
            <span className="text-sm font-medium text-slate-300">
              Free to get started · No credit card required
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
            Ready to claim your{" "}
            <span className="text-sky-400">verified identity?</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Secure your verified.doctor page before someone else claims your name.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="#top"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition-all duration-200 text-base"
            >
              <BadgeCheck className="w-5 h-5" />
              Claim Your URL Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/8 hover:bg-white/12 text-white font-medium rounded-xl transition-all duration-200 border border-white/10"
            >
              Sign in
            </Link>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-slate-500 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Free verification</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>2-minute setup</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>No hidden fees</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
