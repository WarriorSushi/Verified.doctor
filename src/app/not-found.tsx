import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
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

        {/* 404 Text */}
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          But hey, this could be your chance to claim a great profile URL!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
            <Link href="/">
              Claim Your URL
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="mr-2 w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Available Handle Hint */}
        <div className="mt-12 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-2">Looking for a doctor?</p>
          <p className="text-slate-700">
            Try searching at{" "}
            <Link href="/" className="text-sky-600 hover:underline font-medium">
              verified.doctor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
