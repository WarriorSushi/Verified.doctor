"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileCard, SAMPLE_DOCTORS } from "@/components/landing/profile-showcase";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type AvailabilityStatus = "idle" | "checking" | "available" | "taken";

// Names for typewriter - diverse, global
const DEMO_NAMES = [
  "Asra", "Irfan", "Anna", "Arjun", "Priya", "Chong", "Fatima",
  "Rohan", "Wei", "Anjali", "Vikram", "Sarah", "Meera", "Kwame"
];

// Typewriter hook for placeholder text
function useTypewriter(names: string[], isActive: boolean, reduceMotion: boolean) {
  const [displayText, setDisplayText] = useState("");
  const [nameIndex, setNameIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const currentName = names[nameIndex];

  const typeCharacter = useCallback(() => {
    if (!isActive || reduceMotion) return;

    if (isTyping) {
      if (displayText.length < currentName.length) {
        setDisplayText(currentName.slice(0, displayText.length + 1));
      } else {
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setIsTyping(false);
        }, 1800);
      }
    } else {
      if (displayText.length > 0) {
        setDisplayText(displayText.slice(0, -1));
      } else {
        setNameIndex((prev) => (prev + 1) % names.length);
        setIsTyping(true);
      }
    }
  }, [displayText, currentName, isTyping, isActive, reduceMotion, names.length]);

  useEffect(() => {
    if (!isActive || isPaused || reduceMotion) return;
    const speed = isTyping ? 90 : 45;
    const timer = setTimeout(typeCharacter, speed);
    return () => clearTimeout(timer);
  }, [typeCharacter, isTyping, isPaused, isActive, reduceMotion]);

  // When reduced motion is preferred, show the full first name statically
  if (reduceMotion) return names[0];

  return displayText;
}

// No fake counter - removed fabricated stats

// Stock doctor photos
const DOCTOR_PHOTOS = [
  "/doctors/doctor-1.webp",
  "/doctors/doctor-2.webp",
  "/doctors/doctor-3.webp",
  "/doctors/doctor-4.webp",
  "/doctors/doctor-5.webp",
];

export function HeroSection() {
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState<AvailabilityStatus>("idle");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const demoName = useTypewriter(DEMO_NAMES, !isInputFocused, prefersReducedMotion);

  // Auto-rotate carousel
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SAMPLE_DOCTORS.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [startAutoPlay]);

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % SAMPLE_DOCTORS.length);
    startAutoPlay();
  };

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + SAMPLE_DOCTORS.length) % SAMPLE_DOCTORS.length);
    startAutoPlay();
  };

  const checkAvailability = async () => {
    if (!handle.trim()) return;
    setStatus("checking");
    try {
      const response = await fetch("/api/check-handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.toLowerCase().trim() }),
      });
      const data = await response.json();
      setStatus(data.available ? "available" : "taken");
    } catch {
      setStatus("idle");
    }
  };

  const handleClaim = () => {
    window.location.href = `/sign-up?handle=${encodeURIComponent(handle.toLowerCase().trim())}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (status === "available") {
        handleClaim();
      } else {
        checkAvailability();
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-sky-50/40" />

      {/* Subtle mesh gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 153, 247, 0.15), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(164, 253, 255, 0.1), transparent),
            radial-gradient(ellipse 50% 30% at 0% 80%, rgba(0, 128, 204, 0.08), transparent)
          `
        }}
      />

      {/* Floating orbs — static when reduced motion is preferred */}
      <motion.div
        animate={prefersReducedMotion ? {} : { y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={prefersReducedMotion ? {} : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-gradient-to-br from-sky-200/30 to-cyan-100/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={prefersReducedMotion ? {} : { y: [0, 15, 0], scale: [1, 0.95, 1] }}
        transition={prefersReducedMotion ? {} : { duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 -right-48 w-[400px] h-[400px] bg-gradient-to-tl from-cyan-100/30 to-sky-50/20 rounded-full blur-3xl"
      />

      {/* Main Content - Split Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 sm:pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* LEFT SIDE - Text + Input */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 w-full lg:max-w-xl text-center lg:text-left"
          >
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-sky-100 shadow-sm mb-5"
            >
              <div className="relative w-4 h-4">
                <Image src="/verified-doctor-logo.svg" alt="Verified" fill sizes="16px" className="object-contain" />
              </div>
              <span className="text-xs font-semibold text-slate-800">
                The Blue Checkmark for Doctors
              </span>
            </motion.div>

            {/* Headline - concise */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-3"
            >
              Claim Your{" "}
              <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent">
                Verified
              </span>{" "}
              Domain
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-sm sm:text-base text-slate-500 mb-6 max-w-md mx-auto lg:mx-0"
            >
              A premium digital identity for medical professionals.
            </motion.p>

            {/* URL Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="max-w-lg mx-auto lg:mx-0"
            >
              {/* Demo URL */}
              <div className="mb-2.5 flex items-center justify-center lg:justify-start">
                <div className="inline-flex items-center">
                  <span className="text-slate-400 text-sm sm:text-base font-mono tracking-tight">verified.doctor/</span>
                  <span className="text-sky-600 text-sm sm:text-base font-mono font-bold tracking-tight min-w-[60px] sm:min-w-[90px] text-left">
                    {demoName}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                      className="inline-block w-[1.5px] h-4 bg-sky-500 ml-0.5 align-middle rounded-full"
                    />
                  </span>
                </div>
              </div>

              {/* Input Row */}
              <div
                className={`
                  relative flex items-center rounded-2xl bg-white border-2 transition-all duration-300 shadow-xl shadow-slate-200/50
                  ${isInputFocused ? "border-sky-400 shadow-sky-100/50" : "border-slate-200/80"}
                  ${status === "available" ? "border-emerald-400 shadow-emerald-100/50" : ""}
                  ${status === "taken" ? "border-red-300 shadow-red-100/50" : ""}
                `}
              >
                <div className="flex-shrink-0 pl-3 sm:pl-5 pr-0 sm:pr-1 py-3 sm:py-3.5 flex items-center">
                  <span className="text-slate-500 font-medium text-sm sm:text-base whitespace-nowrap">
                    verified.doctor/
                  </span>
                </div>

                <Input
                  type="text"
                  value={handle}
                  onChange={(e) => {
                    setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                    setStatus("idle");
                  }}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onKeyDown={handleKeyDown}
                  placeholder="your-name"
                  className="border-0 bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-3 sm:py-3.5 px-1 sm:px-2 min-w-0 flex-1"
                />

                {/* Desktop Button */}
                <div className="hidden sm:block flex-shrink-0 pr-2.5">
                  {status === "available" ? (
                    <Button
                      onClick={handleClaim}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-5 rounded-xl font-semibold transition-all duration-200 text-sm shadow-lg shadow-emerald-500/25"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Claim Name
                    </Button>
                  ) : (
                    <Button
                      onClick={checkAvailability}
                      disabled={!handle.trim() || status === "checking"}
                      className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-5 py-5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-sky-500/25"
                    >
                      {status === "checking" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Check
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Mobile Button */}
              <div className="sm:hidden mt-3">
                {status === "available" ? (
                  <Button
                    onClick={handleClaim}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 text-base shadow-lg shadow-emerald-500/25"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Claim This Name
                  </Button>
                ) : (
                  <Button
                    onClick={checkAvailability}
                    disabled={!handle.trim() || status === "checking"}
                    className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-lg shadow-sky-500/25"
                  >
                    {status === "checking" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Check Availability
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Status Messages */}
              <div className="h-6 mt-2">
                <AnimatePresence mode="wait">
                  {status === "available" && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-emerald-600 font-medium flex items-center justify-center lg:justify-start gap-2 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      This name is available!
                    </motion.p>
                  )}
                  {status === "taken" && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-red-500 font-medium text-sm text-center lg:text-left"
                    >
                      This name is taken. Try another one.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Social Proof - Compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-6 mb-6 lg:mb-0 flex items-center justify-center lg:justify-start gap-3"
            >
              <div className="flex -space-x-2">
                {DOCTOR_PHOTOS.slice(0, 4).map((photo, i) => (
                  <motion.div
                    key={photo}
                    initial={{ opacity: 0, scale: 0.5, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.08, duration: 0.4 }}
                    className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gradient-to-br from-sky-100 to-slate-100"
                  >
                    <Image
                      src={photo}
                      alt={`Doctor ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="32px"
                      onError={(e) => {
                        const target = e.currentTarget.parentElement;
                        if (target) {
                          target.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-400 to-sky-600 text-white font-bold text-[10px]">D${i + 1}</div>`;
                        }
                      }}
                    />
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center"
                >
                  <span className="text-white text-[9px] font-bold">+99</span>
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="text-slate-600 text-xs sm:text-sm"
              >
                <span className="text-sky-600 font-semibold">Doctors</span>
                {" "}are joining daily
              </motion.p>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE - Phone Mockup Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 w-full lg:max-w-lg flex flex-col items-center"
          >
            {/* Carousel Container */}
            <div className="relative flex items-center justify-center">
              {/* Navigation arrows - desktop only */}
              <button
                onClick={goToPrev}
                className="hidden lg:flex absolute -left-12 z-20 w-9 h-9 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm items-center justify-center hover:bg-white hover:shadow-md transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              {/* Phone Cards - current + previous only */}
              <div className="flex items-center justify-center" style={{ minHeight: '580px' }}>
                <AnimatePresence mode="popLayout">
                  {SAMPLE_DOCTORS.map((doctor, index) => {
                    // Calculate offset with wrapping
                    let offset = index - activeIndex;
                    if (offset > SAMPLE_DOCTORS.length / 2) offset -= SAMPLE_DOCTORS.length;
                    if (offset < -SAMPLE_DOCTORS.length / 2) offset += SAMPLE_DOCTORS.length;

                    // Show only previous (-1) and current (0) on desktop, only current on mobile
                    if (offset < -1 || offset > 0) return null;

                    return (
                      <motion.div
                        key={doctor.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: offset === 0 ? 1 : 0.35,
                          scale: offset === 0 ? 1 : 0.82,
                          x: offset * 60,
                          zIndex: offset === 0 ? 10 : 0,
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={`${offset !== 0 ? 'hidden lg:block' : ''}`}
                      >
                        <ProfileCard doctor={doctor} isActive={offset === 0} />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <button
                onClick={goToNext}
                className="hidden lg:flex absolute -right-12 z-20 w-9 h-9 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm items-center justify-center hover:bg-white hover:shadow-md transition-all"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {SAMPLE_DOCTORS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveIndex(index);
                    startAutoPlay();
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    index === activeIndex
                      ? 'w-6 h-1.5 bg-sky-500'
                      : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            {/* Mobile navigation arrows */}
            <div className="flex lg:hidden items-center gap-3 mt-3">
              <button
                onClick={goToPrev}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={goToNext}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
