"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger glass effect after scrolling 20px
      setIsScrolled(window.scrollY > 20);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`
        fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4
        transition-all duration-300 ease-out
        ${isScrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_2px_20px_-2px_rgba(0,0,0,0.05)]"
          : "bg-transparent border-b border-transparent"
        }
      `}
    >
      {/* Subtle gradient overlay for extra depth when scrolled */}
      <div
        className={`
          absolute inset-0 transition-opacity duration-300
          bg-gradient-to-b from-white/30 to-transparent
          ${isScrolled ? "opacity-100" : "opacity-0"}
        `}
      />

      <div className="relative max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/verified-doctor-logo.svg"
              alt="Verified.Doctor"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight">
            verified<span className="text-[#0099F7]">.doctor</span>
          </span>
        </Link>

        {/* Nav Links + CTA */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/directory"
            className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors duration-200"
          >
            Find a Doctor
          </Link>
          <Button
            size="sm"
            className="bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white font-medium shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all duration-200 text-sm sm:text-base px-4 sm:px-5"
            asChild
          >
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
