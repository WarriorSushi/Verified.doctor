"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Users,
  ThumbsUp,
  MessageSquare,
  MousePointer,
  Loader2,
  Send,
  ExternalLink,
  Ban,
  Snowflake,
  Crown,
  Shield,
  Gift,
  AlertTriangle,
  History,
  Mail,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdminLogoutButton } from "@/components/admin/logout-button";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  handle: string;
  specialty: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  is_verified: boolean;
  verification_status: string | null;
  clinic_name: string | null;
  clinic_location: string | null;
  years_experience: number | null;
  recommendation_count: number | null;
  connection_count: number | null;
  created_at: string | null;
  is_frozen: boolean | null;
  is_banned: boolean | null;
  ban_reason: string | null;
  subscription_status: string | null;
  trial_status: string | null;
  trial_expires_at: string | null;
}

interface Stats {
  messageCount: number;
  connectionCount: number;
  totalViews: number;
  uniqueViews: number;
  verifiedDoctorViews: number;
  totalActions: number;
}

interface Document {
  id: string;
  document_url: string;
  uploaded_at: string;
}

interface AdminAction {
  id: string;
  action_type: string;
  details: Record<string, unknown>;
  created_at: string;
}

interface UserData {
  profile: Profile;
  documents: Document[];
  stats: Stats;
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [trialDays, setTrialDays] = useState(30);
  const [banReason, setBanReason] = useState("");
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${id}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchActions = async () => {
      try {
        const response = await fetch(`/api/admin/actions?profileId=${id}`);
        if (response.ok) {
          const data = await response.json();
          setAdminActions(data.actions || []);
        }
      } catch (error) {
        console.error("Failed to fetch admin actions:", error);
      }
    };

    fetchUser();
    fetchActions();
  }, [id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !userData) return;

    setSending(true);
    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: userData.profile.id,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.emailSent
          ? "Message sent & email notification delivered!"
          : "Message sent to inbox (email notification may have failed)"
        );
        setMessage("");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to send message");
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleAdminAction = async (action: string, extraParams?: Record<string, unknown>) => {
    if (!userData) return;

    setActionLoading(action);
    try {
      const response = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: userData.profile.id,
          action,
          ...extraParams,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Action completed successfully");
        // Refresh user data
        const refreshResponse = await fetch(`/api/admin/users/${id}`);
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setUserData(refreshData);
        }
        // Refresh admin actions
        const actionsResponse = await fetch(`/api/admin/actions?profileId=${id}`);
        if (actionsResponse.ok) {
          const actionsData = await actionsResponse.json();
          setAdminActions(actionsData.actions || []);
        }
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
      setBanReason("");
    }
  };

  const getStatusBadge = (profile: Profile) => {
    if (profile.is_banned) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-red-500/20 text-red-400 rounded-full">
          <Ban className="w-4 h-4" />
          Banned
        </span>
      );
    }
    if (profile.is_frozen) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-blue-500/20 text-blue-400 rounded-full">
          <Snowflake className="w-4 h-4" />
          Frozen
        </span>
      );
    }
    if (profile.is_verified) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
          <CheckCircle2 className="w-4 h-4" />
          Verified
        </span>
      );
    }
    if (profile.verification_status === "pending") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-amber-500/20 text-amber-400 rounded-full">
          <Clock className="w-4 h-4" />
          Verification Pending
        </span>
      );
    }
    if (profile.verification_status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-red-500/20 text-red-400 rounded-full">
          <XCircle className="w-4 h-4" />
          Verification Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-slate-700 text-slate-400 rounded-full">
        Unverified
      </span>
    );
  };

  const getSubscriptionBadge = (profile: Profile) => {
    if (profile.subscription_status === "pro") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-amber-500/20 text-amber-400 rounded-full">
          <Crown className="w-4 h-4" />
          PRO
        </span>
      );
    }
    if (profile.trial_status === "active") {
      const expiresAt = profile.trial_expires_at ? new Date(profile.trial_expires_at) : null;
      const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-purple-500/20 text-purple-400 rounded-full">
          <Sparkles className="w-4 h-4" />
          TRIAL ({daysLeft}d left)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-slate-700 text-slate-400 rounded-full">
        Free
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0099F7] animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">User not found</h2>
          <Link href="/admin/users" className="text-[#0099F7] hover:underline">
            Back to users
          </Link>
        </div>
      </div>
    );
  }

  const { profile, stats } = userData;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <div className="relative w-8 h-8">
                <Image
                  src="/verified-doctor-logo.svg"
                  alt="Verified.Doctor"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Link */}
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all users
        </Link>

        {/* Alert Banner if banned */}
        {profile.is_banned && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-400 font-medium">This user is banned</p>
                {profile.ban_reason && (
                  <p className="text-red-400/70 text-sm mt-1">Reason: {profile.ban_reason}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                  {profile.profile_photo_url ? (
                    <Image
                      src={profile.profile_photo_url}
                      alt={profile.full_name}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl font-medium">
                      {profile.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
                      <p className="text-slate-400">{profile.specialty || "No specialty"}</p>
                      <a
                        href={`/${profile.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#0099F7] hover:underline mt-1"
                      >
                        verified.doctor/{profile.handle}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(profile)}
                      {getSubscriptionBadge(profile)}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Clinic</p>
                      <p className="text-white">{profile.clinic_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Location</p>
                      <p className="text-white">{profile.clinic_location || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Experience</p>
                      <p className="text-white">
                        {profile.years_experience ? `${profile.years_experience} years` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Joined</p>
                      <p className="text-white">
                        {profile.created_at
                          ? new Date(profile.created_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Eye className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
                    <p className="text-slate-400 text-sm">Views (30d)</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <ThumbsUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{profile.recommendation_count || 0}</p>
                    <p className="text-slate-400 text-sm">Recommendations</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.connectionCount}</p>
                    <p className="text-slate-400 text-sm">Connections</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <MousePointer className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalActions}</p>
                    <p className="text-slate-400 text-sm">Actions (30d)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Send Admin Message */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-rose-500/20">
                  <MessageSquare className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Send Admin Message</h2>
                  <p className="text-slate-400 text-sm">
                    Message appears pinned in inbox + email notification is sent
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="message" className="text-slate-300">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message to this user..."
                    rows={4}
                    className="mt-1.5 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <Mail className="w-3 h-3" />
                    User will receive an email notification
                  </div>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sending}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Admin Message
                </Button>
              </div>
            </div>

            {/* Admin Action History */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-slate-700">
                  <History className="w-5 h-5 text-slate-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Admin Action History</h2>
              </div>

              {adminActions.length === 0 ? (
                <p className="text-slate-500 text-sm">No admin actions recorded for this user.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {adminActions.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg"
                    >
                      <div className="w-2 h-2 rounded-full bg-slate-500 mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium capitalize">
                          {action.action_type.replace(/_/g, " ")}
                        </p>
                        {typeof action.details?.reason === "string" && action.details.reason && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Reason: {action.details.reason}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(action.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Admin Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Admin Actions</h2>

              <div className="space-y-4">
                {/* Verification */}
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-white">Verification</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdminAction("verify")}
                      disabled={actionLoading === "verify" || profile.is_verified}
                      className="flex-1 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      {actionLoading === "verify" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Verify
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdminAction("unverify")}
                      disabled={actionLoading === "unverify" || !profile.is_verified}
                      className="flex-1 border-slate-600 text-slate-400 hover:bg-slate-700"
                    >
                      {actionLoading === "unverify" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Unverify
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Subscription */}
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-white">Subscription</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdminAction("grant_pro")}
                      disabled={actionLoading === "grant_pro" || profile.subscription_status === "pro"}
                      className="flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                    >
                      {actionLoading === "grant_pro" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-1" />
                          Grant Pro
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdminAction("revoke_pro")}
                      disabled={actionLoading === "revoke_pro" || profile.subscription_status !== "pro"}
                      className="flex-1 border-slate-600 text-slate-400 hover:bg-slate-700"
                    >
                      {actionLoading === "revoke_pro" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Revoke Pro"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Trial */}
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Trial</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      type="number"
                      value={trialDays}
                      onChange={(e) => setTrialDays(Number(e.target.value))}
                      min={1}
                      max={365}
                      className="w-20 h-8 bg-slate-800 border-slate-600 text-white text-sm"
                    />
                    <span className="text-sm text-slate-400">days</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdminAction("grant_trial", { trialDays })}
                      disabled={actionLoading === "grant_trial" || profile.trial_status === "active"}
                      className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                      {actionLoading === "grant_trial" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Gift className="w-4 h-4 mr-1" />
                          Grant Trial
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdminAction("revoke_trial")}
                      disabled={actionLoading === "revoke_trial" || profile.trial_status !== "active"}
                      className="flex-1 border-slate-600 text-slate-400 hover:bg-slate-700"
                    >
                      {actionLoading === "revoke_trial" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Revoke"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Freeze */}
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Snowflake className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Profile Visibility</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdminAction("freeze")}
                      disabled={actionLoading === "freeze" || !!profile.is_frozen || !!profile.is_banned}
                      className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                      {actionLoading === "freeze" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Snowflake className="w-4 h-4 mr-1" />
                          Freeze
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdminAction("unfreeze")}
                      disabled={actionLoading === "unfreeze" || !profile.is_frozen || !!profile.is_banned}
                      className="flex-1 border-slate-600 text-slate-400 hover:bg-slate-700"
                    >
                      {actionLoading === "unfreeze" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Unfreeze"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Ban */}
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Ban className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">Ban User</span>
                  </div>
                  {!profile.is_banned && (
                    <div className="mb-3">
                      <Input
                        type="text"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Reason for ban (optional)"
                        className="w-full h-8 bg-slate-800 border-slate-600 text-white text-sm placeholder:text-slate-500"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    {profile.is_banned ? (
                      <Button
                        size="sm"
                        onClick={() => handleAdminAction("unban")}
                        disabled={actionLoading === "unban"}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        {actionLoading === "unban" ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        Unban User
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAdminAction("ban", { reason: banReason })}
                        disabled={actionLoading === "ban"}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        {actionLoading === "ban" ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Ban className="w-4 h-4 mr-2" />
                        )}
                        Ban User
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">User Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">User ID</span>
                  <span className="text-white font-mono text-xs">{profile.user_id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Profile ID</span>
                  <span className="text-white font-mono text-xs">{profile.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Handle</span>
                  <span className="text-white">@{profile.handle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Created</span>
                  <span className="text-white flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
