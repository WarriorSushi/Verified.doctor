"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface LegalHeaderProps {
  isLoggedIn: boolean;
}

export function LegalHeader({ isLoggedIn }: LegalHeaderProps) {
  const backUrl = isLoggedIn ? "/dashboard" : "/";
  const backText = isLoggedIn ? "Back to Dashboard" : "Back to Home";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={backUrl} className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src="/verified-doctor-logo.svg"
              alt="Verified.Doctor"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg font-semibold text-slate-800">
            verified<span className="text-[#0099F7]">.doctor</span>
          </span>
        </Link>
        <Link
          href={backUrl}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#0099F7] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {backText}
        </Link>
      </div>
    </header>
  );
}
