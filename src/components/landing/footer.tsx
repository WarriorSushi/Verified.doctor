import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-white py-12 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-5">
            <div className="relative w-7 h-7">
              <Image
                src="/verified-doctor-logo.svg"
                alt="Verified.Doctor"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-base font-semibold text-white tracking-tight">
              verified<span className="text-sky-400">.doctor</span>
            </span>
          </Link>

          {/* Tagline */}
          <p className="text-slate-400 text-sm mb-8 max-w-sm">
            The Blue Checkmark for Medical Professionals.
          </p>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm">
            <Link
              href="/directory"
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              Find a Doctor
            </Link>
            <Link
              href="/privacy"
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              Contact
            </Link>
          </div>

          {/* Divider */}
          <div className="w-full max-w-xs h-px bg-slate-800 mb-8" />

          {/* Copyright + Parent */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-slate-500 text-xs">
              © {currentYear} Verified.Doctor. All rights reserved.
            </p>
            <Link
              href="https://altcorp.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 transition-colors duration-200"
            >
              <span className="text-xs">A unit of</span>
              <div className="relative w-4 h-4">
                <Image
                  src="/Altcorp.svg"
                  alt="AltCorp"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-medium">AltCorp</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
