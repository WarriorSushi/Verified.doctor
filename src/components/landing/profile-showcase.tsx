"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Minimal profile data for the carousel labels
export const SAMPLE_DOCTORS = [
  { id: "1", handle: "asra", full_name: "Dr. Asra", specialty: "Pediatrician", layout: "Classic", file: "asra-classic.webp" },
  { id: "2", handle: "stevens", full_name: "Dr. Stevens", specialty: "Orthopedic Surgeon", layout: "Hero", file: "stevens-hero.webp" },
  { id: "3", handle: "david-g", full_name: "Dr. David G", specialty: "Dermatologist", layout: "Magazine", file: "david-g-magazine.webp" },
  { id: "4", handle: "rajesh-verma", full_name: "Dr. Rajesh Verma", specialty: "Neurologist", layout: "Grid", file: "rajesh-verma-grid.webp" },
  { id: "5", handle: "arun", full_name: "Dr. Arun", specialty: "Pediatrician", layout: "Minimal", file: "arun-minimal.webp" },
];

type Profile = (typeof SAMPLE_DOCTORS)[0];

// Phone frame with a static image that scrolls via CSS animation
export function ProfileCard({ doctor, isActive }: { doctor: Profile; isActive: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = isActive && !prefersReducedMotion;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: isActive ? 1 : 0.6,
        scale: isActive ? 1 : 0.9,
        y: isActive ? 0 : 10,
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative ${isActive ? "z-10" : "z-0"}`}
    >
      {/* Phone Frame */}
      <div
        className={`relative rounded-[32px] p-2 transition-all duration-500 ${
          isActive
            ? "bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl shadow-slate-900/50"
            : "bg-slate-800/80 shadow-xl"
        }`}
      >
        {/* Screen */}
        <div className="profile-phone-screen relative rounded-[24px] overflow-hidden w-[280px] sm:w-[320px] h-[500px] sm:h-[560px] bg-white">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-5 z-20 bg-white/80 backdrop-blur-sm">
            <span className="text-xs font-medium text-slate-400">9:41</span>
            <div className="w-4 h-2.5 rounded-sm bg-slate-300" />
          </div>

          {/* Profile Image - scrolls via CSS animation */}
          <Image
            src={`/profile-previews/${doctor.file}`}
            alt={`${doctor.full_name} - ${doctor.specialty} profile`}
            width={640}
            height={2272}
            className={`w-full h-auto ${shouldAnimate ? "animate-profile-scroll" : ""}`}
            style={shouldAnimate ? undefined : { transform: "translateY(0)" }}
            priority
            sizes="320px"
          />
        </div>
      </div>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-center"
      >
        <p className={`font-semibold text-sm ${isActive ? "text-slate-800" : "text-slate-500"}`}>
          {doctor.full_name}
        </p>
        <p className="text-xs text-slate-400">
          {doctor.specialty} &bull; {doctor.layout} Layout
        </p>
      </motion.div>
    </motion.div>
  );
}
