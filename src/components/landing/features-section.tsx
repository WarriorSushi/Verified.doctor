"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ThumbsUp,
  Users,
  QrCode,
  MessageSquare,
  Sparkles,
  BadgeCheck,
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50 overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium mb-5">
            <BadgeCheck className="w-3.5 h-3.5 text-sky-500" />
            Platform Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 mb-5 tracking-tight leading-tight">
            Everything you need to{" "}
            <span className="text-sky-600">build trust online</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            A complete platform designed specifically for medical professionals
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 auto-rows-[minmax(160px,auto)]">

          {/* Hero Card - Verified Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="sm:col-span-2 lg:col-span-7 lg:row-span-2 group"
          >
            <div className="relative h-full bg-gradient-to-br from-sky-600 to-sky-700 rounded-3xl p-7 sm:p-9 overflow-hidden min-h-[320px] sm:min-h-[380px]">
              {/* Subtle light effects */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />

              {/* Floating logo */}
              <motion.div
                className="absolute top-8 right-8 sm:top-12 sm:right-12"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center p-3 sm:p-4">
                  <Image
                    src="/verified-doctor-logo.svg"
                    alt="Verified Doctor Badge"
                    width={80}
                    height={80}
                    className="w-full h-full drop-shadow-lg"
                  />
                </div>
              </motion.div>

              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Core Feature
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
                  Verified Badge
                </h3>
                <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-md">
                  Stand out with an authenticated credential that patients trust instantly. The blue checkmark for doctors.
                </p>
              </div>
            </div>
          </motion.div>

          {/* No Negative Reviews Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 group"
          >
            <div className="relative h-full bg-emerald-600 rounded-2xl p-5 sm:p-6 overflow-hidden min-h-[180px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />

              <div className="relative z-10 h-full flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                  <ThumbsUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  No Negative Reviews
                </h3>
                <p className="text-white/80 text-sm leading-relaxed flex-grow">
                  Collect recommendations only. Your reputation can only grow.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Doctor Network Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 group"
          >
            <div className="relative h-full bg-slate-800 rounded-2xl p-5 sm:p-6 overflow-hidden min-h-[180px] border border-slate-700">
              <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl" />

              {/* Network visualization */}
              <div className="absolute top-4 right-4 opacity-40">
                <svg width="80" height="80" viewBox="0 0 80 80" className="text-sky-400">
                  <circle cx="40" cy="40" r="6" fill="currentColor" />
                  <circle cx="20" cy="25" r="4" fill="currentColor" opacity="0.6" />
                  <circle cx="60" cy="20" r="4" fill="currentColor" opacity="0.6" />
                  <circle cx="65" cy="55" r="4" fill="currentColor" opacity="0.6" />
                  <circle cx="15" cy="55" r="4" fill="currentColor" opacity="0.6" />
                  <line x1="40" y1="40" x2="20" y2="25" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                  <line x1="40" y1="40" x2="60" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                  <line x1="40" y1="40" x2="65" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                  <line x1="40" y1="40" x2="15" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                </svg>
              </div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-sky-500/20 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  Doctor Network
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-grow">
                  Connect with peers and showcase your professional network.
                </p>
              </div>
            </div>
          </motion.div>

          {/* QR Code Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-4 group"
          >
            <div className="relative h-full bg-white rounded-2xl p-5 sm:p-6 overflow-hidden min-h-[180px] border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
              {/* QR Code illustration */}
              <div className="absolute top-4 right-4">
                <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 p-2 group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full grid grid-cols-4 gap-0.5">
                    {[...Array(16)].map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${[0,1,2,4,5,8,10,11,12,14,15].includes(i) ? 'bg-slate-800' : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                  <QrCode className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  QR Code
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-grow">
                  Scannable code for your clinic. Patients save your contact instantly.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Patient Messaging Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-4 group"
          >
            <div className="relative h-full bg-white rounded-2xl p-5 sm:p-6 overflow-hidden min-h-[180px] border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center mb-4">
                  <MessageSquare className="w-5 h-5 text-sky-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Patient Messaging
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-grow">
                  Secure async messaging without sharing your personal number.
                </p>
              </div>
            </div>
          </motion.div>

          {/* AI-Powered Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-4 group"
          >
            <div className="relative h-full bg-slate-900 rounded-2xl p-5 sm:p-6 overflow-hidden min-h-[180px] border border-slate-800">
              {/* Subtle glow */}
              <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 bg-sky-500/10 rounded-full blur-2xl" />

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-sky-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400 text-xs font-medium">Free</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  AI-Powered Profiles
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  AI crafts your professional bio and profile content automatically.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
