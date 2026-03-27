"use client";

import Image from "next/image";
import Link from "next/link";
import { ThumbsUp, Users } from "lucide-react";

interface ConnectedDoctor {
  id: string;
  full_name: string;
  specialty: string | null;
  handle: string;
  profile_photo_url: string | null;
}

interface SocialProofWidgetProps {
  recommendationCount: number;
  connectedDoctors: ConnectedDoctor[];
  /** Tailwind text color for the heading */
  accentColor?: string;
}

/**
 * "Recommended by X doctors" social proof widget.
 * Shows recommendation count + connected doctor avatars.
 * Designed to be embedded in any profile template.
 */
export function SocialProofWidget({
  recommendationCount,
  connectedDoctors,
  accentColor = "text-[#0099F7]",
}: SocialProofWidgetProps) {
  if (recommendationCount === 0 && connectedDoctors.length === 0) {
    return null;
  }

  const showDoctors = connectedDoctors.slice(0, 5);
  const extraCount = connectedDoctors.length - showDoctors.length;

  return (
    <div className="bg-gradient-to-br from-sky-50/80 to-blue-50/60 rounded-xl border border-sky-100 p-4 sm:p-5">
      {/* Recommendation count */}
      {recommendationCount > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
            <ThumbsUp className={`w-4 h-4 ${accentColor}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Recommended by{" "}
              <span className={accentColor}>
                {recommendationCount}
              </span>{" "}
              {recommendationCount === 1 ? "person" : "people"} on Verified.Doctor
            </p>
          </div>
        </div>
      )}

      {/* Connected doctors */}
      {showDoctors.length > 0 && (
        <div>
          {recommendationCount > 0 && (
            <div className="border-t border-sky-100 my-3" />
          )}
          <div className="flex items-center gap-2 mb-2.5">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Connected with
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {showDoctors.map((doc) => (
              <Link
                key={doc.id}
                href={`/${doc.handle}`}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-sky-100/80 hover:border-sky-200 hover:bg-white transition-colors group"
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                  {doc.profile_photo_url ? (
                    <Image
                      src={doc.profile_photo_url}
                      alt={doc.full_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-sky-100 flex items-center justify-center text-[10px] font-bold text-sky-600">
                      {doc.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate group-hover:text-[#0099F7] transition-colors">
                    {doc.full_name}
                  </p>
                  {doc.specialty && (
                    <p className="text-[10px] text-slate-500 truncate">
                      {doc.specialty}
                    </p>
                  )}
                </div>
              </Link>
            ))}
            {extraCount > 0 && (
              <div className="flex items-center px-2.5 py-1.5 text-xs text-slate-500">
                +{extraCount} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
