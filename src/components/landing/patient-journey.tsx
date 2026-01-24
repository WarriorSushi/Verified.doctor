"use client";

import { motion } from "framer-motion";
import { Search, Link, Users, Briefcase, QrCode, Globe, FileText, Camera, ShieldCheck } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Multiple entry points - different ways people land on your page
const entryPoints = [
  {
    icon: Search,
    label: "Googles your name",
    color: "from-slate-500 to-slate-600",
  },
  {
    icon: Link,
    label: "Clicks your social bio link",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Users,
    label: "Colleague looks you up",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Briefcase,
    label: "Employer checks credentials",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: QrCode,
    label: "Scans QR in your clinic",
    color: "from-teal-500 to-teal-600",
  },
];

// The journey after landing on the page
const flowSteps = [
  {
    icon: Globe,
    label: "Lands on Your Page",
    detail: "verified.doctor/you",
    color: "from-sky-500 to-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
  },
  {
    icon: FileText,
    label: "Sees Everything",
    detail: "Credentials, services, location",
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  {
    icon: Camera,
    label: "Gets the Full Picture",
    detail: "Photos, videos, personal touch",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    icon: ShieldCheck,
    label: "Trusts You Instantly",
    detail: "Verified, recommended, credible",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
];

export function PatientJourney() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mt-10 sm:mt-14">

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:block">
        {/* Entry points row */}
        <div className="flex items-center justify-center gap-3">
          {entryPoints.map((entry, index) => (
            <motion.div
              key={entry.label}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: -15 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 shadow-sm"
            >
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${entry.color} flex items-center justify-center`}>
                <entry.icon className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xs text-slate-600 font-medium whitespace-nowrap">{entry.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Connecting wires - SVG funnel lines */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex justify-center py-3"
        >
          <svg width="400" height="32" viewBox="0 0 400 32" fill="none" className="overflow-visible">
            {/* Lines from entry points converging to center */}
            <path d="M40 0 L200 28" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M120 0 L200 28" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M200 0 L200 28" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M280 0 L200 28" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M360 0 L200 28" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
            {/* Convergence dot */}
            <circle cx="200" cy="28" r="3" fill="#0ea5e9" />
          </svg>
        </motion.div>

        {/* Flow steps row */}
        <div className="flex items-center justify-center gap-2">
          {flowSteps.map((step, index) => (
            <div key={step.label} className="flex items-center">
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.5 + index * 0.12, duration: 0.5, ease: "easeOut" }}
                className={`relative flex flex-col items-center text-center px-4 py-4 rounded-2xl border ${step.borderColor} ${step.bgColor} w-[160px]`}
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shadow-sm mb-2`}>
                  <step.icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{step.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{step.detail}</p>
              </motion.div>

              {/* Connector */}
              {index < flowSteps.length - 1 && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + index * 0.12, duration: 0.3 }}
                  className="flex items-center justify-center w-5"
                >
                  <div className="w-4 h-[2px] bg-slate-200 rounded-full" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== TABLET LAYOUT ===== */}
      <div className="hidden sm:block lg:hidden">
        {/* Entry points - wrapped pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {entryPoints.map((entry, index) => (
            <motion.div
              key={entry.label}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm"
            >
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${entry.color} flex items-center justify-center`}>
                <entry.icon className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[11px] text-slate-600 font-medium">{entry.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Converge indicator */}
        <div className="flex justify-center mb-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-[2px] h-3 bg-slate-200 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-sky-400" />
            <div className="w-[2px] h-3 bg-slate-200 rounded-full" />
          </div>
        </div>

        {/* Flow steps - wrapped */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {flowSteps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${step.borderColor} ${step.bgColor} min-w-[180px]`}
            >
              <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shadow-sm`}>
                <step.icon className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{step.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="flex sm:hidden flex-col items-center">
        {/* Entry points - compact pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
          {entryPoints.map((entry, index) => (
            <motion.div
              key={entry.label}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm"
            >
              <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${entry.color} flex items-center justify-center`}>
                <entry.icon className="w-2 h-2 text-white" strokeWidth={3} />
              </div>
              <span className="text-[10px] text-slate-600 font-medium">{entry.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Converge indicator */}
        <div className="flex flex-col items-center gap-0.5 mb-3">
          <div className="w-[2px] h-2 bg-slate-200 rounded-full" />
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <div className="w-[2px] h-2 bg-slate-200 rounded-full" />
        </div>

        {/* Flow steps - vertical */}
        <div className="flex flex-col items-center gap-2">
          {flowSteps.map((step, index) => (
            <div key={step.label} className="flex flex-col items-center">
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: 0.2 + index * 0.08, duration: 0.4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${step.borderColor} ${step.bgColor} w-[260px]`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shadow-sm`}>
                  <step.icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{step.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{step.detail}</p>
                </div>
              </motion.div>

              {/* Vertical connector */}
              {index < flowSteps.length - 1 && (
                <div className="w-[2px] h-2 bg-slate-200 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
