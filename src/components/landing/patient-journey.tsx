"use client";

import { motion, useInView } from "framer-motion";
import { Search, Link, Users, Briefcase, QrCode, Globe, FileText, Camera, ShieldCheck } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useRef } from "react";

const entryPoints = [
  { icon: Search, label: "Google search", color: "from-slate-500 to-slate-600" },
  { icon: Link, label: "Social bio link", color: "from-pink-500 to-rose-500" },
  { icon: Users, label: "Colleague referral", color: "from-indigo-500 to-indigo-600" },
  { icon: Briefcase, label: "Job application", color: "from-orange-500 to-orange-600" },
  { icon: QrCode, label: "Clinic QR scan", color: "from-teal-500 to-teal-600" },
];

const flowSteps = [
  { icon: Globe, label: "Lands on Your Page", color: "from-sky-500 to-sky-600", glowColor: "shadow-sky-300/60" },
  { icon: FileText, label: "Sees Everything", color: "from-violet-500 to-violet-600", glowColor: "shadow-violet-300/60" },
  { icon: Camera, label: "Gets the Full Picture", color: "from-amber-500 to-amber-600", glowColor: "shadow-amber-300/60" },
  { icon: ShieldCheck, label: "Trusts You", color: "from-emerald-500 to-emerald-600", glowColor: "shadow-emerald-300/60" },
];

// Animated dotted path component
function AnimatedDottedPath({ d, delay, duration }: { d: string; delay: number; duration: number }) {
  return (
    <motion.path
      d={d}
      stroke="#cbd5e1"
      strokeWidth="1.5"
      strokeDasharray="4 4"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay, duration, ease: "easeOut" }}
    />
  );
}

export function PatientJourney() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });

  return (
    <div ref={containerRef} className="mt-8 sm:mt-12">

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:block relative">
        {/* Entry points - floating scattered */}
        <div className="relative h-[52px] mb-0">
          {entryPoints.map((entry, index) => {
            const positions = [
              "left-[4%]", "left-[22%]", "left-[40%]", "left-[58%]", "left-[76%]"
            ];
            return (
              <motion.div
                key={entry.label}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: -10, scale: 0.9 }}
                animate={isInView && !prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : prefersReducedMotion ? {} : undefined}
                transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
                className={`absolute top-0 ${positions[index]} flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm`}
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${entry.color} flex items-center justify-center`}>
                  <entry.icon className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[11px] text-slate-600 font-medium whitespace-nowrap">{entry.label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* SVG dotted lines converging */}
        <div className="relative h-[40px] w-full">
          {isInView && (
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 40" preserveAspectRatio="none">
              <AnimatedDottedPath d="M 80 0 Q 400 30, 400 38" delay={0.5} duration={0.6} />
              <AnimatedDottedPath d="M 230 0 Q 400 30, 400 38" delay={0.6} duration={0.5} />
              <AnimatedDottedPath d="M 380 0 L 400 38" delay={0.7} duration={0.4} />
              <AnimatedDottedPath d="M 530 0 Q 400 30, 400 38" delay={0.6} duration={0.5} />
              <AnimatedDottedPath d="M 700 0 Q 400 30, 400 38" delay={0.5} duration={0.6} />
              {/* Convergence pulse */}
              <motion.circle
                cx="400"
                cy="38"
                r="4"
                fill="#0ea5e9"
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 1.1, duration: 0.3 }}
              />
            </svg>
          )}
        </div>

        {/* Flow steps - horizontal with animated glow */}
        <div className="flex items-center justify-center gap-1.5 mt-1">
          {flowSteps.map((step, index) => (
            <div key={step.label} className="flex items-center">
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.85 }}
                animate={isInView && !prefersReducedMotion ? {
                  opacity: 1,
                  scale: [0.85, 1.08, 1],
                } : prefersReducedMotion ? {} : undefined}
                transition={{
                  delay: 1.2 + index * 0.25,
                  duration: 0.5,
                  scale: { delay: 1.2 + index * 0.25, duration: 0.5, ease: "easeOut" },
                }}
                className={`relative flex flex-col items-center text-center px-3 py-3 rounded-xl border border-slate-200/80 bg-white w-[140px]`}
              >
                {/* Glow effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView && !prefersReducedMotion ? { opacity: [0, 0.7, 0.3] } : {}}
                  transition={{ delay: 1.2 + index * 0.25, duration: 0.8 }}
                  className={`absolute inset-0 rounded-xl shadow-lg ${step.glowColor} pointer-events-none`}
                />
                <div className={`relative w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shadow-sm mb-1.5`}>
                  <step.icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
                <p className="relative text-[11px] font-semibold text-slate-800 leading-tight">{step.label}</p>
              </motion.div>

              {/* Dotted connector between steps */}
              {index < flowSteps.length - 1 && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0 }}
                  animate={isInView && !prefersReducedMotion ? { opacity: 1 } : prefersReducedMotion ? {} : undefined}
                  transition={{ delay: 1.4 + index * 0.25, duration: 0.3 }}
                  className="flex items-center justify-center w-4"
                >
                  <div className="w-3 border-t border-dashed border-slate-300" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== TABLET ===== */}
      <div className="hidden sm:block lg:hidden">
        {/* Entry pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
          {entryPoints.map((entry, index) => (
            <motion.div
              key={entry.label}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm"
            >
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${entry.color} flex items-center justify-center`}>
                <entry.icon className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[11px] text-slate-600 font-medium">{entry.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Converge */}
        <div className="flex justify-center mb-3">
          <div className="flex flex-col items-center">
            <div className="w-px h-3 border-l border-dashed border-slate-300" />
            <div className="w-2 h-2 rounded-full bg-sky-400" />
            <div className="w-px h-3 border-l border-dashed border-slate-300" />
          </div>
        </div>

        {/* Flow steps */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {flowSteps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: 0.3 + index * 0.12, duration: 0.4 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/80 bg-white shadow-sm"
            >
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                <step.icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-[11px] font-semibold text-slate-700">{step.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ===== MOBILE ===== */}
      <div className="flex sm:hidden flex-col items-center">
        {/* Entry pills - ultra compact */}
        <div className="flex flex-wrap items-center justify-center gap-1 mb-2">
          {entryPoints.map((entry, index) => (
            <motion.div
              key={entry.label}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-slate-200/80 shadow-sm"
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${entry.color} flex items-center justify-center`}>
                <entry.icon className="w-[7px] h-[7px] text-white" strokeWidth={3} />
              </div>
              <span className="text-[9px] text-slate-600 font-medium">{entry.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Converge dot */}
        <div className="flex flex-col items-center mb-2">
          <div className="w-px h-2 border-l border-dashed border-slate-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <div className="w-px h-2 border-l border-dashed border-slate-300" />
        </div>

        {/* Flow - horizontal scroll-like compact row */}
        <div className="flex items-center gap-1">
          {flowSteps.map((step, index) => (
            <div key={step.label} className="flex items-center">
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.85 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                className="flex flex-col items-center px-2 py-2 rounded-lg border border-slate-200/80 bg-white w-[72px]"
              >
                <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${step.color} flex items-center justify-center mb-1`}>
                  <step.icon className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-[8px] font-semibold text-slate-700 leading-tight text-center">{step.label}</p>
              </motion.div>
              {index < flowSteps.length - 1 && (
                <div className="w-1 border-t border-dashed border-slate-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
