"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AvailabilityStatus = "idle" | "checking" | "available" | "taken";

// Names for typewriter - diverse, global
const DEMO_NAMES = [
  "Asra", "Irfan", "Anna", "Arjun", "Priya", "Chong", "Fatima",
  "Rohan", "Wei", "Anjali", "Vikram", "Sarah", "Meera", "Kwame"
];

// Typewriter hook for the demo URL
function useTypewriter(names: string[], isActive: boolean) {
  const [displayText, setDisplayText] = useState("");
  const [nameIndex, setNameIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const currentName = names[nameIndex];

  const typeCharacter = useCallback(() => {
    if (!isActive) return;

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
  }, [displayText, currentName, isTyping, isActive, names.length]);

  useEffect(() => {
    if (!isActive || isPaused) return;
    const speed = isTyping ? 90 : 45;
    const timer = setTimeout(typeCharacter, speed);
    return () => clearTimeout(timer);
  }, [typeCharacter, isTyping, isPaused, isActive]);

  return displayText;
}

// Hook for animated doctor count with daily reset
// Starts at 620-720, increments +1-3 every 2-6 seconds, caps at ~1450
function useDoctorCount() {
  const [count, setCount] = useState(687); // Default for SSR
  const [displayCount, setDisplayCount] = useState(687);

  useEffect(() => {
    // Check for daily reset
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem("vd_count_date");
    const storedCount = localStorage.getItem("vd_count_today");

    let initialCount: number;
    if (storedDate === today && storedCount) {
      initialCount = parseInt(storedCount, 10);
    } else {
      // New day - reset to random value between 620-720
      initialCount = Math.floor(Math.random() * 100) + 620;
      localStorage.setItem("vd_count_date", today);
      localStorage.setItem("vd_count_today", String(initialCount));
    }

    setCount(initialCount);
    setDisplayCount(initialCount);

    // Function to schedule next increment with random delay
    const scheduleIncrement = () => {
      // Random delay between 2-6 seconds (2000-6000ms)
      const delay = 2000 + Math.random() * 4000;

      return setTimeout(() => {
        setCount((prev) => {
          // Cap at 1450 to keep it realistic
          if (prev >= 1450) return prev;

          // Random increment between 1-3
          const increment = Math.floor(Math.random() * 3) + 1;
          const newCount = Math.min(prev + increment, 1450);
          localStorage.setItem("vd_count_today", String(newCount));
          return newCount;
        });
      }, delay);
    };

    // Start the increment cycle
    let timeoutId = scheduleIncrement();

    // Set up recurring increments
    const intervalId = setInterval(() => {
      clearTimeout(timeoutId);
      timeoutId = scheduleIncrement();
    }, 2000 + Math.random() * 4000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  // Smooth animation for display count
  useEffect(() => {
    if (displayCount === count) return;

    const diff = count - displayCount;
    const step = diff > 0 ? 1 : -1;

    const timer = setTimeout(() => {
      setDisplayCount(prev => prev + step);
    }, 50); // Animate quickly

    return () => clearTimeout(timer);
  }, [count, displayCount]);

  return displayCount;
}

// Stock doctor photos - these will be in /public/doctors/
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

  const doctorCount = useDoctorCount();
  const demoName = useTypewriter(DEMO_NAMES, !isInputFocused);

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
      // Show error state instead of random result
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient - refined medical aesthetic */}
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

      {/* Floating orbs - more refined, less obvious */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-gradient-to-br from-sky-200/30 to-cyan-100/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 15, 0],
          scale: [1, 0.95, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 -right-48 w-[400px] h-[400px] bg-gradient-to-tl from-cyan-100/30 to-sky-50/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          {/* Trust badge - Updated copy */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-sky-100 shadow-sm mb-8 sm:mb-10"
          >
            <div className="relative w-5 h-5">
              <Image
                src="/verified-doctor-logo.svg"
                alt="Verified"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              The Blue Checkmark for Doctors
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-4 sm:mb-5"
          >
            Your Digital Identity.
            <br />
            <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent">
              Verified.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-xl text-slate-600 mb-10 sm:mb-14 max-w-2xl mx-auto leading-relaxed"
          >
            Claim your unique verified domain before another doctor does.
            <span className="hidden sm:inline"> Stand out with a professional presence that patients can trust.</span>
          </motion.p>

          {/* Demo URL Preview - Clean text without box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <p className="text-sm sm:text-base text-slate-500 mb-3 font-medium">
              Here&apos;s how your personal verified domain will appear
            </p>
            <div className="inline-flex items-center justify-center">
              <span className="text-slate-400 text-xl sm:text-3xl font-mono tracking-tight">verified.doctor/</span>
              <span className="text-sky-600 text-xl sm:text-3xl font-mono font-bold tracking-tight min-w-[100px] sm:min-w-[160px] text-left">
                {demoName}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  className="inline-block w-[2px] h-6 sm:h-8 bg-sky-500 ml-0.5 align-middle rounded-full"
                />
              </span>
            </div>
          </motion.div>

          {/* URL Input Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="max-w-xl mx-auto"
          >
            {/* Input Row - URL prefix and input always on same line */}
            <div
              className={`
                relative flex items-center rounded-2xl bg-white border-2 transition-all duration-300 shadow-xl shadow-slate-200/50
                ${isInputFocused ? "border-sky-400 shadow-sky-100/50" : "border-slate-200/80"}
                ${status === "available" ? "border-emerald-400 shadow-emerald-100/50" : ""}
                ${status === "taken" ? "border-red-300 shadow-red-100/50" : ""}
              `}
            >
              {/* URL Prefix */}
              <div className="flex-shrink-0 pl-3 sm:pl-6 pr-0 sm:pr-2 py-3 sm:py-4 flex items-center">
                <span className="text-slate-500 font-medium text-sm sm:text-lg whitespace-nowrap">
                  verified.doctor/
                </span>
              </div>

              {/* Input Field */}
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
                placeholder="type your name"
                className="border-0 bg-transparent text-sm sm:text-lg font-medium text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-3 sm:py-4 px-1 sm:px-2 min-w-0 flex-1"
              />

              {/* Desktop Button - Inside input box */}
              <div className="hidden sm:block flex-shrink-0 pr-3">
                {status === "available" ? (
                  <Button
                    onClick={handleClaim}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-6 rounded-xl font-semibold transition-all duration-200 text-base shadow-lg shadow-emerald-500/25"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Claim This Name
                  </Button>
                ) : (
                  <Button
                    onClick={checkAvailability}
                    disabled={!handle.trim() || status === "checking"}
                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-6 py-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-lg shadow-sky-500/25"
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
            </div>

            {/* Mobile Button - Below input box */}
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
            <div className="h-8 mt-4">
              <AnimatePresence mode="wait">
                {status === "available" && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-emerald-600 font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Perfect! This name is available. Claim it now!
                  </motion.p>
                )}
                {status === "taken" && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-red-500 font-medium text-sm"
                  >
                    This name is already taken. Try another one.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Social Proof with Doctor Photos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            {/* Doctor avatars */}
            <div className="flex -space-x-3">
              {DOCTOR_PHOTOS.map((photo, i) => (
                <motion.div
                  key={photo}
                  initial={{ opacity: 0, scale: 0.5, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                  className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-white shadow-md overflow-hidden bg-gradient-to-br from-sky-100 to-slate-100"
                >
                  <Image
                    src={photo}
                    alt={`Doctor ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="48px"
                    onError={(e) => {
                      // Fallback to initials if image doesn't exist
                      const target = e.currentTarget.parentElement;
                      if (target) {
                        target.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-400 to-sky-600 text-white font-bold text-sm">D${i + 1}</div>`;
                      }
                    }}
                  />
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.4 }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-white shadow-md bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center"
              >
                <span className="text-white text-xs sm:text-sm font-bold">+99</span>
              </motion.div>
            </div>

            {/* Counter text - Updated */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-center sm:text-left"
            >
              <p className="text-slate-700 font-semibold text-base sm:text-lg">
                <motion.span
                  key={doctorCount}
                  initial={{ opacity: 0.5, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-sky-600 tabular-nums"
                >
                  {doctorCount}
                </motion.span>
                {" "}doctors claimed their domain today
              </p>
              <p className="text-slate-500 text-sm mt-0.5">Join the verified medical professional network</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
