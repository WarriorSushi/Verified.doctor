"use client";

import { motion } from "framer-motion";
import { Shield, ThumbsUp, MessageSquare, Clock } from "lucide-react";

const signals = [
  {
    icon: Shield,
    title: "Manual Verification",
    description: "Every doctor's credentials are reviewed by our team before the badge is awarded.",
  },
  {
    icon: ThumbsUp,
    title: "Positive-Only Reviews",
    description: "We only collect recommendations. No negative reviews, no anonymous attacks.",
  },
  {
    icon: MessageSquare,
    title: "Private Messaging",
    description: "Patients can reach you without ever seeing your personal phone number.",
  },
  {
    icon: Clock,
    title: "Live in Minutes",
    description: "AI builds your profile from the details you provide. No design skills needed.",
  },
];

export function TrustSignalsSection() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 sm:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium mb-5">
            Built for Trust
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 mb-5 leading-tight">
            Designed for{" "}
            <span className="text-sky-600">healthcare professionals</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Every feature is built with patient trust and doctor privacy in mind
          </p>
        </motion.div>

        {/* Trust Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {signals.map((signal, index) => (
            <motion.div
              key={signal.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-300 h-full flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center">
                  <signal.icon className="w-5 h-5 text-sky-600" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                    {signal.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {signal.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
