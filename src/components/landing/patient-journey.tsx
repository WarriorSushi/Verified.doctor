"use client";

import { motion, useInView } from "framer-motion";
import { Search, Link, Users, Briefcase, QrCode } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useRef } from "react";

const sources = [
  { icon: Search, label: "Google search" },
  { icon: Link, label: "Social bio" },
  { icon: Users, label: "Colleague" },
  { icon: Briefcase, label: "Employer" },
  { icon: QrCode, label: "QR scan" },
];

// Pre-compute orbital positions (distributed around upper arc)
const RADIUS = 115;
const SPREAD = 240;
const START = -90;
const positions = sources.map((_, i) => {
  const angle = START - SPREAD / 2 + (SPREAD / (sources.length - 1)) * i;
  const rad = (angle * Math.PI) / 180;
  return { x: Math.cos(rad) * RADIUS, y: Math.sin(rad) * RADIUS };
});

export function PatientJourney() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const shouldAnimate = isInView && !prefersReducedMotion;

  return (
    <div ref={ref} className="mt-10 sm:mt-14">

      {/* ===== DESKTOP & TABLET ===== */}
      <div className="hidden sm:block">
        <div className="relative max-w-xl mx-auto h-[250px]">

          {/* Radial ambient glow */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={shouldAnimate ? { opacity: 1 } : prefersReducedMotion ? {} : undefined}
            transition={{ delay: 0.2, duration: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              className="w-[300px] h-[300px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 65%)" }}
            />
          </motion.div>

          {/* Dashed beam lines — absolutely positioned per source */}
          {positions.map((pos, i) => {
            const cx = 0; // center offset
            const cy = 0;
            // Line from center to source position
            const lineLength = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
            const angle = Math.atan2(pos.y, pos.x) * (180 / Math.PI);
            return (
              <motion.div
                key={`line-${i}`}
                initial={prefersReducedMotion ? { opacity: 0.4 } : { opacity: 0, scaleX: 0 }}
                animate={shouldAnimate ? { opacity: 0.4, scaleX: 1 } : prefersReducedMotion ? { opacity: 0.4 } : undefined}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                className="absolute left-1/2 top-1/2 origin-left pointer-events-none"
                style={{
                  width: `${lineLength}px`,
                  height: "1px",
                  transform: `translate(${cx}px, ${cy}px) rotate(${angle}deg)`,
                  borderTop: "1px dashed #cbd5e1",
                }}
              />
            );
          })}

          {/* Central orb */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer pulse ring */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.6 }}
              animate={shouldAnimate ? { opacity: 1, scale: 1 } : prefersReducedMotion ? {} : undefined}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute w-[88px] h-[88px] rounded-full bg-sky-50 shadow-[0_0_30px_rgba(14,165,233,0.12)]"
            />
            {/* Core */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.3 }}
              animate={shouldAnimate ? { opacity: 1, scale: 1 } : prefersReducedMotion ? {} : undefined}
              transition={{ delay: 0.6, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex flex-col items-center justify-center w-[72px] h-[72px] rounded-full bg-sky-600 shadow-md shadow-sky-600/20"
            >
              <span className="text-white text-[9px] font-bold tracking-wider uppercase leading-none">Your</span>
              <span className="text-white text-[9px] font-bold tracking-wider uppercase leading-none mt-0.5">Page</span>
            </motion.div>
          </div>

          {/* Orbiting source nodes */}
          {sources.map((source, i) => {
            const pos = positions[i];
            return (
              <motion.div
                key={source.label}
                initial={prefersReducedMotion ? { x: pos.x, y: pos.y } : { opacity: 0, x: 0, y: 0 }}
                animate={shouldAnimate ? { opacity: 1, x: pos.x, y: pos.y } : prefersReducedMotion ? { x: pos.x, y: pos.y } : undefined}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-sm transition-shadow duration-200 hover:shadow-md">
                  <source.icon className="w-[18px] h-[18px] text-slate-500" strokeWidth={1.7} />
                </div>
                <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{source.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ===== MOBILE ===== */}
      <div className="sm:hidden">
        <div className="relative flex flex-col items-center">
          {/* Central orb */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.5 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-sky-600 shadow-md shadow-sky-600/20 mb-4"
          >
            <span className="text-white text-[8px] font-bold tracking-wider uppercase">Your Page</span>
          </motion.div>

          {/* Sources as minimal icon+text pairs */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5">
            {sources.map((source, i) => (
              <motion.div
                key={source.label}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: 0.35 + i * 0.06, duration: 0.3 }}
                className="flex items-center gap-1.5"
              >
                <source.icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.7} />
                <span className="text-[11px] text-slate-500 font-medium">{source.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
