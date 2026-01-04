"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, MessageSquare } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-sky-50/40 px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-16 h-16">
            <Image
              src="/verified-doctor-logo.svg"
              alt="Verified.Doctor"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Error Message */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-3xl">!</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Something went wrong
        </h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          We encountered an unexpected error. Don&apos;t worry, your data is safe.
          Please try again or contact support if the problem persists.
        </p>

        {/* Error ID for support */}
        {error.digest && (
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            size="lg"
            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700"
          >
            <RefreshCw className="mr-2 w-4 h-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="mr-2 w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Support Link */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-3">Still having issues?</p>
          <Button asChild variant="ghost" size="sm">
            <Link href="/contact">
              <MessageSquare className="mr-2 w-4 h-4" />
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
