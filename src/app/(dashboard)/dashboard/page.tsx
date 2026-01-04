import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  ThumbsUp,
  Users,
  MessageSquare,
  QrCode,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Edit,
  ChevronRight,
  MapPin,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile-cache";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/dashboard/copy-button";
import { formatViewCount } from "@/lib/format-metrics";
import { InviteDialog } from "@/components/dashboard/invite-dialog";

export default async function DashboardPage() {
  const { profile, userId } = await getProfile();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!profile) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const { count: unreadCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .eq("is_read", false);

  const metrics = [
    { label: "Views", value: profile.view_count || 0, icon: Eye, format: formatViewCount },
    { label: "Recommendations", value: profile.recommendation_count || 0, icon: ThumbsUp },
    { label: "Connections", value: profile.connection_count || 0, icon: Users },
    { label: "Messages", value: unreadCount || 0, icon: MessageSquare, href: "/dashboard/messages" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Verification Banner - Compact */}
      {!profile.is_verified && (
        <Link
          href="/dashboard/profile-builder?tab=settings"
          className="block bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 hover:bg-amber-100/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 text-sm">
                Get your verified badge
              </h3>
              <p className="text-xs text-amber-700 mt-0.5 hidden sm:block">
                Upload credentials to build trust with patients
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-600 flex-shrink-0" />
          </div>
        </Link>
      )}

      {profile.is_verified && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="font-medium text-emerald-900 text-sm">Verified Physician</p>
        </div>
      )}

      {/* Mini Profile Preview Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {/* Profile Photo */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
              {profile.profile_photo_url ? (
                <Image
                  src={profile.profile_photo_url}
                  alt={profile.full_name}
                  fill
                  className="object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-lg sm:text-xl font-semibold text-slate-500">
                  {profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6">
                  <Image src="/verified-doctor-logo.svg" alt="Verified" fill className="object-contain" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {profile.full_name}
              </h2>
              {profile.specialty && (
                <p className="text-sm font-medium text-[#0099F7]">{profile.specialty}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
                {profile.clinic_location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {profile.clinic_location}
                  </span>
                )}
                {profile.years_experience && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {profile.years_experience}+ years
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile URL */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2 font-mono text-xs text-slate-600 truncate">
              verified.doctor/{profile.handle}
            </div>
            <CopyButton text={`https://verified.doctor/${profile.handle}`} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-100 p-3 bg-slate-50/50 flex gap-2">
          <Button size="sm" className="flex-1 text-xs sm:text-sm" asChild>
            <Link href={`/${profile.handle}`} target="_blank">
              <ExternalLink className="w-4 h-4 mr-1.5" />
              View
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs sm:text-sm" asChild>
            <Link href="/dashboard/profile-builder">
              <Edit className="w-4 h-4 mr-1.5" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row - Compact */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const content = (
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 text-center hover:border-slate-300 transition-colors">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-slate-400 mb-1" />
              <p className="text-lg sm:text-2xl font-bold text-slate-900">
                {metric.format ? metric.format(metric.value) : metric.value.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">{metric.label}</p>
            </div>
          );

          if (metric.href) {
            return (
              <Link key={metric.label} href={metric.href}>
                {content}
              </Link>
            );
          }

          return <div key={metric.label}>{content}</div>;
        })}
      </div>

      {/* QR Code & Invite - Side by Side */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* QR Code */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">QR Code</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-lg border border-slate-200 flex-shrink-0">
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://verified.doctor/${profile.handle}`}
                alt="QR Code"
                width={80}
                height={80}
                className="sm:w-[100px] sm:h-[100px]"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-3">
                Display in your clinic for patients to scan and save your contact
              </p>
              <Button variant="outline" size="sm" className="text-xs w-full" asChild>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://verified.doctor/${profile.handle}`}
                  download={`qr-${profile.handle}.png`}
                  target="_blank"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Invite Colleagues */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-200/50 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Grow Your Network</h3>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Invite colleagues to connect and boost your professional credibility
          </p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-white border-2 border-sky-100 flex items-center justify-center"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
            <InviteDialog
              trigger={
                <Button size="sm" className="text-xs bg-sky-600 hover:bg-sky-700">
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Invite
                </Button>
              }
            />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard/messages"
          className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Messages
          {unreadCount ? (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
              {unreadCount}
            </span>
          ) : null}
        </Link>
        <Link
          href="/dashboard/connections"
          className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          Connections
        </Link>
        <Link
          href="/dashboard/analytics"
          className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Analytics
        </Link>
      </div>
    </div>
  );
}
