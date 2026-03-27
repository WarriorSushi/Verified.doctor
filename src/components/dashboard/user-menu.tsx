"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, User, Settings, ChevronDown, HelpCircle, FileText, Shield, Mail, Compass, Crown, Sparkles } from "lucide-react";
import { useTour } from "@/components/tour";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface UserMenuProps {
  fullName: string;
  handle: string;
  profilePhotoUrl?: string | null;
  subscriptionStatus?: string | null;
  trialStatus?: string | null;
  trialExpiresAt?: string | null;
}

export function UserMenu({
  fullName,
  handle,
  profilePhotoUrl,
  subscriptionStatus,
  trialStatus,
  trialExpiresAt,
}: UserMenuProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { startTour } = useTour();

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Determine subscription display
  const isPro = subscriptionStatus === "pro";
  const isTrialActive = trialStatus === "active" && trialExpiresAt && new Date(trialExpiresAt) > new Date();

  // Calculate trial days remaining
  let trialDaysRemaining = 0;
  if (isTrialActive && trialExpiresAt) {
    const expiresAt = new Date(trialExpiresAt);
    const now = new Date();
    trialDaysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/");
        router.refresh();
      } else {
        toast.error("Failed to logout");
      }
    } catch {
      toast.error("Failed to logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 focus:outline-none group">
        {profilePhotoUrl ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
            <Image
              src={profilePhotoUrl}
              alt={fullName}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0099F7] to-[#0080CC] flex items-center justify-center text-white text-xs sm:text-sm font-bold ring-2 ring-white shadow-sm">
            {initials}
          </div>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-900">{fullName}</p>
            {isPro && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold">
                <Crown className="w-2.5 h-2.5" />
                PRO
              </span>
            )}
            {isTrialActive && !isPro && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 text-white text-[10px] font-bold">
                <Sparkles className="w-2.5 h-2.5" />
                TRIAL
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">verified.doctor/{handle}</p>
          {isTrialActive && !isPro && trialDaysRemaining > 0 && (
            <p className="text-[10px] text-teal-600 mt-0.5">
              {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} left in trial
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push(`/${handle}`)}
          className="cursor-pointer"
        >
          <User className="w-4 h-4 mr-2" />
          View Public Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/settings")}
          className="cursor-pointer"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            startTour();
          }}
          className="cursor-pointer"
        >
          <Compass className="w-4 h-4 mr-2" />
          Take a Tour
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/help")}
          className="cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Help & Support
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <FileText className="w-4 h-4 mr-2" />
            Policies
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => router.push("/terms")}
              className="cursor-pointer"
            >
              <FileText className="w-4 h-4 mr-2" />
              Terms of Service
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/privacy")}
              className="cursor-pointer"
            >
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/contact")}
              className="cursor-pointer"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
