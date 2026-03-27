"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

function AuthTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSignUp = pathname === "/sign-up";

  const isSignIn = pathname === "/sign-in";

  // Hide tabs on password reset and confirmation pages
  if (
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/confirm"
  ) {
    return null;
  }

  // Preserve query params (handle, invite, redirect)
  const queryString = searchParams.toString();
  const queryPart = queryString ? `?${queryString}` : "";

  return (
    <div className="flex bg-slate-100/80 rounded-xl p-1 mb-6">
      <Link
        href={`/sign-in${queryPart}`}
        className={`
          flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-center transition-all duration-200
          ${isSignIn
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
          }
        `}
      >
        Sign In
      </Link>
      <Link
        href={`/sign-up${queryPart}`}
        className={`
          flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-center transition-all duration-200
          ${isSignUp
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
          }
        `}
      >
        Sign Up
      </Link>
    </div>
  );
}

function AuthTabsFallback() {
  return (
    <div className="flex bg-slate-100/80 rounded-xl p-1 mb-6">
      <div className="flex-1 py-2.5 px-4 rounded-lg bg-white shadow-sm">
        <div className="h-4 bg-slate-200 rounded animate-pulse w-14 mx-auto" />
      </div>
      <div className="flex-1 py-2.5 px-4 rounded-lg">
        <div className="h-4 bg-slate-200 rounded animate-pulse w-14 mx-auto" />
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#0099F7]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#A4FDFF]/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 sm:p-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 group">
          <div className="relative w-10 h-10 transition-transform group-hover:scale-105">
            <Image
              src="/verified-doctor-logo.svg"
              alt="Verified.Doctor"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-semibold text-slate-800 tracking-tight">
            verified<span className="text-[#0099F7]">.doctor</span>
          </span>
        </Link>

        {/* Auth card with tabs */}
        <div className="w-full max-w-md">
          <Suspense fallback={<AuthTabsFallback />}>
            <AuthTabs />
          </Suspense>
          {children}
        </div>

        {/* Footer links */}
        <p className="mt-8 text-xs text-slate-400 text-center">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-slate-500 hover:text-[#0099F7] underline underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-slate-500 hover:text-[#0099F7] underline underline-offset-2">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
