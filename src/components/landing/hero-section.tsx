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

const DEMO_NAMES = [
  "Asra", "Irfan", "Anna", "Arjun", "Priya", "Chong", "Fatima",
  "Rohan", "Hannah", "Anjali", "Vikram", "Sarah", "Meera", "Richard"
];

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

  if (reduceMotion) return names[0];
  return displayText;
}

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
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />

      {/* Subtle grid pattern for depth */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* LEFT SIDE - Text + CTA Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 w-full lg:max-w-xl text-center lg:text-left"
          >
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-100 mb-6"
            >
              <div className="relative w-4 h-4">
                <Image src="/verified-doctor-logo.svg" alt="Verified" fill sizes="16px" className="object-contain" />
              </div>
              <span className="text-xs font-semibold text-sky-700 tracking-wide uppercase">
                The Blue Checkmark for Doctors
              </span>
            </motion.div>

            {/* Headline — big, confident, action-oriented */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1] mb-5"
            >
              The verified page{" "}
              <span className="text-sky-600">every doctor needs</span>
            </motion.h1>

            {/* Subheadline — clear value prop */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg text-slate-500 mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed"
            >
              Your credentials, recommendations, and contact — in one trusted page that ranks when patients search your name.
            </motion.p>

            {/* Claim CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="max-w-lg mx-auto lg:mx-0"
            >
              {/* Demo URL preview */}
              <div className="mb-3 flex items-center justify-center lg:justify-start">
                <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-sm font-mono">verified.doctor/</span>
                  <span className="text-sky-600 text-sm font-mono font-semibold">
                    {demoName}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                      className="inline-block w-[1.5px] h-4 bg-sky-500 ml-0.5 align-middle"
                    />
                  </span>
                </div>
              </div>

              {/* Input Row — the star of the show */}
              <div
                className={`
                  relative flex items-center rounded-2xl bg-white border-2 transition-all duration-200
                  ${isInputFocused ? "border-sky-400 shadow-lg shadow-sky-100/60" : "border-slate-200 shadow-lg shadow-slate-200/40"}
                  ${status === "available" ? "border-emerald-400 shadow-lg shadow-emerald-100/60" : ""}
                  ${status === "taken" ? "border-red-300 shadow-lg shadow-red-100/40" : ""}
                `}
              >
                <div className="flex-shrink-0 pl-4 sm:pl-5 pr-1 py-3.5 sm:py-4 flex items-center">
                  <span className="text-slate-400 font-medium text-sm sm:text-base whitespace-nowrap">
                    verified.doctor/
                  </span>
                </div>

                <div className="relative flex-1 min-w-0">
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
                    className="border-0 bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-300 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-3.5 sm:py-4 px-1 sm:px-2 w-full"
                  />
                </div>

                {/* Desktop Button */}
                <div className="hidden sm:block flex-shrink-0 pr-2">
                  {status === "available" ? (
                    <Button
                      onClick={handleClaim}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-5 rounded-xl font-semibold text-sm cursor-pointer"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Claim
                    </Button>
                  ) : (
                    <Button
                      onClick={checkAvailability}
                      disabled={!handle.trim() || status === "checking"}
                      className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
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
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-semibold text-base cursor-pointer"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Claim This Name
                  </Button>
                ) : (
                  <Button
                    onClick={checkAvailability}
                    disabled={!handle.trim() || status === "checking"}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-base cursor-pointer"
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

              {/* Urgency nudge */}
              <p className="text-xs text-slate-400 mt-2 text-center lg:text-left">
                Claim your name before someone else does.
              </p>

              {/* Status Messages */}
              <div className="h-6 mt-1.5">
                <AnimatePresence mode="wait">
                  {status === "available" && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="text-emerald-600 font-medium flex items-center justify-center lg:justify-start gap-2 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      This name is available — claim it now!
                    </motion.p>
                  )}
                  {status === "taken" && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="text-red-500 font-medium text-sm text-center lg:text-left"
                    >
                      This name is taken. Try another.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Social Proof — minimal, honest */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-8 flex items-center justify-center lg:justify-start gap-3"
            >
              <div className="flex -space-x-2">
                {DOCTOR_PHOTOS.slice(0, 4).map((photo, i) => (
                  <div
                    key={photo}
                    className="relative w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gradient-to-br from-sky-100 to-slate-100"
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
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-sm">
                Doctors are claiming daily
              </p>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE - Phone Mockup Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 w-full lg:max-w-lg flex flex-col items-center"
          >
            {/* Carousel Container */}
            <div className="relative flex items-center justify-center">
              {/* Navigation arrows - desktop */}
              <button
                onClick={goToPrev}
                className="hidden lg:flex absolute -left-12 z-20 w-9 h-9 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm items-center justify-center hover:bg-white hover:shadow-md transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              <div className="relative flex items-center justify-center" style={{ minHeight: '580px' }}>
                {SAMPLE_DOCTORS.map((doctor, index) => {
                  let offset = index - activeIndex;
                  if (offset > SAMPLE_DOCTORS.length / 2) offset -= SAMPLE_DOCTORS.length;
                  if (offset < -SAMPLE_DOCTORS.length / 2) offset += SAMPLE_DOCTORS.length;
                  const isVisible = offset >= -1 && offset <= 0;

                  return (
                    <motion.div
                      key={doctor.id}
                      animate={{
                        opacity: offset === 0 ? 1 : isVisible ? 0.35 : 0,
                        scale: offset === 0 ? 1 : isVisible ? 0.82 : 0.8,
                        x: isVisible ? offset * 60 : 0,
                        zIndex: offset === 0 ? 10 : 0,
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`${offset === 0 ? '' : isVisible ? 'hidden lg:block' : 'absolute pointer-events-none'}`}
                    >
                      <ProfileCard doctor={doctor} isActive={offset === 0} />
                    </motion.div>
                  );
                })}
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

            {/* Caption */}
            <p className="text-sm text-slate-400 text-center max-w-xs mt-4">
              AI generates your profile from the details you provide
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
