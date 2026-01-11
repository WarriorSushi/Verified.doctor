import { redirect } from "next/navigation";
import Image from "next/image";
import { MessageSquareWarning } from "lucide-react";
import { verifyAdminSession } from "@/lib/admin-auth";
import { AdminLogoutButton } from "@/components/admin/logout-button";
import { AdminAppealsList } from "@/components/admin/appeals-list";

export default async function AdminAppealsPage() {
  const isAdmin = await verifyAdminSession();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image
                src="/verified-doctor-logo.svg"
                alt="Verified.Doctor"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">Admin Panel</span>
              <span className="px-2 py-0.5 text-xs font-medium bg-[#0099F7]/20 text-[#0099F7] rounded-full">
                Verified.Doctor
              </span>
            </div>
          </div>
          <AdminLogoutButton />
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            <a
              href="/admin"
              className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent"
            >
              Verifications
            </a>
            <a
              href="/admin/users"
              className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent"
            >
              All Users
            </a>
            <a
              href="/admin/appeals"
              className="px-4 py-3 text-sm font-medium text-white border-b-2 border-[#0099F7]"
            >
              Appeals
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
            <MessageSquareWarning className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Ban Appeals
            </h1>
            <p className="text-slate-400">
              Review appeals from suspended accounts
            </p>
          </div>
        </div>

        {/* Appeals List */}
        <AdminAppealsList />
      </main>
    </div>
  );
}
