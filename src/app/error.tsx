"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-rose-50/30 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-lg w-full text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6"
        >
          <div className="relative w-14 h-14 mx-auto">
            <Image
              src="/verified-doctor-logo.svg"
              alt="Verified.Doctor"
              fill
              className="object-contain"
            />
          </div>
        </motion.div>

        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-100 to-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            Something went wrong
          </h1>
          <p className="text-slate-600 mb-8 text-lg">
            We encountered an unexpected error. Don&apos;t worry, your data is safe.
            Please try again or contact support if the issue persists.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            size="lg"
            onClick={() => reset()}
            className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-8 py-6 rounded-xl font-semibold text-lg shadow-lg shadow-sky-500/25"
          >
            <RefreshCw className="mr-2 w-5 h-5" />
            Try Again
          </Button>
          <Link href="/">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 py-6 rounded-xl font-semibold text-lg border-2"
            >
              <Home className="mr-2 w-5 h-5" />
              Go Home
            </Button>
          </Link>
        </motion.div>

        {/* Error details (dev only) */}
        {process.env.NODE_ENV === "development" && error.digest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 p-4 bg-slate-100 rounded-lg text-left"
          >
            <p className="text-xs text-slate-500 font-mono">
              Error ID: {error.digest}
            </p>
          </motion.div>
        )}

        {/* Support link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 pt-8 border-t border-slate-200"
        >
          <p className="text-slate-500 text-sm">
            Need help?{" "}
            <Link href="/contact" className="text-sky-600 hover:underline font-medium">
              Contact our support team
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
