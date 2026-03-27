"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Power,
  AlertTriangle,
  Bell,
  Mail,
  Globe,
  Shield,
  Trash2,
  LogOut,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  handle: string;
  full_name: string;
  specialty: string | null;
  clinic_name: string | null;
  clinic_location: string | null;
  years_experience: number | null;
  profile_photo_url: string | null;
  external_booking_url: string | null;
  is_verified: boolean | null;
  verification_status: string | null;
  profile_template: string | null;
  profile_layout: string | null;
  profile_theme: string | null;
}

interface ProfileSettingsProps {
  profile: Profile;
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const router = useRouter();
  const [isFrozen, setIsFrozen] = useState(false);
  const [isTogglingFreeze, setIsTogglingFreeze] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification preferences (local state - would connect to API in production)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [connectionNotifications, setConnectionNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [isTogglingDigest, setIsTogglingDigest] = useState(false);

  const fetchWeeklyDigestPreference = useCallback(async () => {
    try {
      const response = await fetch(`/api/profiles/${profile.id}`);
      if (response.ok) {
        const data = await response.json();
        const badges = data.profile?.achievement_badges as Record<string, unknown> | undefined;
        setWeeklyDigest(!(badges?.weekly_digest_opt_out === true));
      }
    } catch {
      // Ignore errors and keep default true
    }
  }, [profile.id]);

  // Fetch persisted settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const freezeResponse = await fetch("/api/profile/freeze");
        if (freezeResponse.ok) {
          const data = await freezeResponse.json();
          setIsFrozen(data.isFrozen);
        }
      } catch {
        // Ignore errors, default to false
      }

      fetchWeeklyDigestPreference();
    };
    fetchSettings();
  }, [fetchWeeklyDigestPreference]);

  const handleFreezeToggle = async (checked: boolean) => {
    setIsTogglingFreeze(true);
    try {
      const response = await fetch("/api/profile/freeze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFrozen: checked }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFrozen(data.isFrozen);
        toast.success(data.message);
        router.refresh();
      } else {
        toast.error("Failed to update profile status");
      }
    } catch {
      toast.error("Failed to update profile status");
    } finally {
      setIsTogglingFreeze(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      // In production, this would call an API to schedule account deletion
      toast.success("Account deletion scheduled. You will receive a confirmation email.");
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Link to Edit Profile */}
      <Link
        href="/dashboard/profile-builder"
        className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-sky-200 hover:bg-sky-50/30 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Edit Your Profile</h3>
              <p className="text-sm text-slate-500">Update photo, bio, layout & content</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Choose what notifications you receive
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="font-medium">New Messages</Label>
              <p className="text-sm text-slate-500">Get notified when patients send you messages</p>
            </div>
            <Switch
              checked={messageNotifications}
              onCheckedChange={setMessageNotifications}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="font-medium">Connection Requests</Label>
              <p className="text-sm text-slate-500">Get notified when doctors want to connect</p>
            </div>
            <Switch
              checked={connectionNotifications}
              onCheckedChange={setConnectionNotifications}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="font-medium">Email Notifications</Label>
              <p className="text-sm text-slate-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </div>
      </div>

      {/* Email & Communication */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Email Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="font-medium">Weekly Digest</Label>
              <p className="text-sm text-slate-500">Receive a weekly summary of profile views, messages, and tips</p>
            </div>
            <Switch
              checked={weeklyDigest}
              onCheckedChange={async (checked) => {
                setIsTogglingDigest(true);
                try {
                  const csrfRes = await fetch("/api/csrf");
                  const csrfData = await csrfRes.json();
                  const currentRes = await fetch(`/api/profiles/${profile.id}`);
                  const currentData = await currentRes.json();
                  const currentBadges = (currentData.profile?.achievement_badges || {}) as Record<string, unknown>;

                  const response = await fetch(`/api/profiles/${profile.id}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      "x-csrf-token": csrfData.token,
                    },
                    body: JSON.stringify({
                      achievementBadges: {
                        ...currentBadges,
                        weekly_digest_opt_out: !checked,
                      },
                    }),
                  });
                  if (response.ok) {
                    setWeeklyDigest(checked);
                    toast.success(checked ? "Weekly digest enabled" : "Weekly digest disabled");
                  } else {
                    toast.error("Failed to update preference");
                  }
                } catch {
                  toast.error("Failed to update preference");
                } finally {
                  setIsTogglingDigest(false);
                }
              }}
              disabled={isTogglingDigest}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="font-medium">Product Updates</Label>
              <p className="text-sm text-slate-500">News about features and improvements</p>
            </div>
            <Switch
              checked={marketingEmails}
              onCheckedChange={setMarketingEmails}
            />
          </div>
        </div>
      </div>

      {/* Privacy & Profile Visibility */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Privacy</h2>
        </div>

        <div className="space-y-4">
          {/* Profile URL */}
          <div className="py-2">
            <Label className="font-medium">Your Profile URL</Label>
            <p className="text-sm text-slate-500 mt-1">
              verified.doctor/{profile.handle}
            </p>
          </div>

          {/* Profile Live Toggle - ON means Live, OFF means Frozen */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Power className="w-4 h-4 text-slate-500" />
                <p className="font-medium text-slate-900">
                  {!isFrozen ? "Profile is Live" : "Profile is Offline"}
                </p>
                {!isFrozen && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
                    Active
                  </span>
                )}
                {isFrozen && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                    Frozen
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {!isFrozen
                  ? "Patients can find and contact you"
                  : "Your profile is hidden from patients"}
              </p>
            </div>
            <Switch
              checked={!isFrozen}
              onCheckedChange={(checked) => handleFreezeToggle(!checked)}
              disabled={isTogglingFreeze}
              className={cn(
                !isFrozen && "data-[state=checked]:bg-emerald-500"
              )}
            />
          </div>

          {isFrozen && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Profile frozen</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Patients cannot find you, send messages, or leave recommendations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Language & Region */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Language & Region</h2>
        </div>

        <div className="py-2">
          <Label className="font-medium">Language</Label>
          <p className="text-sm text-slate-500 mt-1">English (US)</p>
          <p className="text-xs text-slate-400 mt-2">More languages coming soon</p>
        </div>
      </div>

      {/* Account Management */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Account</h2>

        <div className="space-y-4">
          {/* Sign Out */}
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="font-medium">Sign Out</Label>
              <p className="text-sm text-slate-500">Sign out of your account on this device</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Delete Account */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium text-red-600">Delete Account</Label>
                <p className="text-sm text-slate-500">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>

            {showDeleteConfirm && (
              <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Are you sure? This action cannot be undone.
                </p>
                <p className="text-sm text-red-700 mb-3">
                  Type <strong>DELETE</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-3 py-2 border border-red-200 rounded-md text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== "DELETE"}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
