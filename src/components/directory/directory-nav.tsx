import Link from "next/link";
import Image from "next/image";

export function DirectoryNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_2px_20px_-2px_rgba(0,0,0,0.05)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
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
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/directory"
            className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors duration-200"
          >
            All Doctors
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-white bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] rounded-lg shadow-lg shadow-sky-500/20 transition-all duration-200"
          >
            Get Verified
          </Link>
        </div>
      </div>
    </nav>
  );
}
