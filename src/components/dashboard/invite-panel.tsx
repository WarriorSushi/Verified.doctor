"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  Loader2,
  Mail,
  Link2,
  Share2,
  MessageCircle,
  UserPlus,
  Sparkles,
  Gift,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InvitePanelProps {
  doctorName: string;
  currentConnectionCount: number;
}

export function InvitePanel({ doctorName, currentConnectionCount }: InvitePanelProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const createInvite = async (withEmail: boolean = false) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withEmail && email ? { email } : {}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invite");
      }

      setInviteUrl(data.inviteUrl);
      // Refresh the page to update the "Invites Sent" count
      router.refresh();
      if (withEmail) {
        // Check if email was actually sent successfully
        if (data.emailSent) {
          toast.success(`Invite sent to ${email}`);
        } else if (data.emailError) {
          // Email failed - show error but invite link still works
          toast.warning(`Invite created but email failed: ${data.emailError}. Share the link manually.`, {
            duration: 5000,
          });
          // Copy link to clipboard as fallback
          await navigator.clipboard.writeText(data.inviteUrl);
          toast.info("Invite link copied to clipboard!");
        } else {
          // Email not configured
          toast.warning("Email not configured. Share the link manually.");
          await navigator.clipboard.writeText(data.inviteUrl);
          toast.info("Invite link copied to clipboard!");
        }
        setEmail("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteUrl) {
      await createInvite();
      return;
    }
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = async () => {
    if (!inviteUrl) {
      await createInvite();
    }
    const url = inviteUrl || (await getNewInviteUrl());
    if (url) {
      const message = `Hey! I'm on Verified.Doctor - a platform for verified physicians. Join me and let's connect professionally: ${url}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      // Use location.href for better mobile compatibility (window.open can be blocked)
      window.location.href = whatsappUrl;
    }
  };

  const getNewInviteUrl = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (response.ok) {
        setInviteUrl(data.inviteUrl);
        return data.inviteUrl;
      }
    } catch {
      // Silent fail
    }
    return null;
  };

  const shareNative = async () => {
    if (!inviteUrl) {
      await createInvite();
    }
    const url = inviteUrl || (await getNewInviteUrl());
    if (url && navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Verified.Doctor",
          text: "Join the network of verified physicians",
          url: url,
        });
      } catch {
        // User cancelled or not supported
      }
    }
  };

  const nextMilestone = currentConnectionCount < 5 ? 5 :
                        currentConnectionCount < 10 ? 10 :
                        currentConnectionCount < 25 ? 25 :
                        currentConnectionCount < 50 ? 50 : 100;
  const toNextMilestone = nextMilestone - currentConnectionCount;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#0099F7]" />
            Grow Your Network
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Invite colleagues to expand your professional network
          </p>
        </div>
        {toNextMilestone > 0 && toNextMilestone <= 5 && (
          <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm">
            <Gift className="w-4 h-4" />
            {toNextMilestone} to next badge!
          </div>
        )}
      </div>

      {/* Quick Share Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Button
          variant="outline"
          className="flex-col h-auto py-4 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
          onClick={shareViaWhatsApp}
          disabled={isLoading}
        >
          <MessageCircle className="w-6 h-6 mb-1" />
          <span className="text-xs">WhatsApp</span>
        </Button>
        <Button
          variant="outline"
          className="flex-col h-auto py-4 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
          onClick={copyToClipboard}
          disabled={isLoading}
        >
          {copied ? (
            <Check className="w-6 h-6 mb-1 text-emerald-600" />
          ) : (
            <Link2 className="w-6 h-6 mb-1" />
          )}
          <span className="text-xs">{copied ? "Copied!" : "Copy Link"}</span>
        </Button>
        {"share" in navigator && (
          <Button
            variant="outline"
            className="flex-col h-auto py-4 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 transition-colors"
            onClick={shareNative}
            disabled={isLoading}
          >
            <Share2 className="w-6 h-6 mb-1" />
            <span className="text-xs">Share</span>
          </Button>
        )}
      </div>

      {/* Email Invite */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Mail className="w-4 h-4" />
          <span>Or send a personal invite via email</span>
        </div>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="colleague@hospital.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && email && createInvite(true)}
          />
          <Button
            onClick={() => createInvite(true)}
            disabled={isLoading || !email}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Benefit callout */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-3 bg-gradient-to-r from-[#0099F7]/5 to-transparent p-3 rounded-lg -mx-3">
        <Sparkles className="w-5 h-5 text-[#0099F7] shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-slate-900">Auto-connect on signup</p>
          <p className="text-slate-500">
            When your colleague joins, you&apos;ll be instantly connected. Both profiles get boosted!
          </p>
        </div>
      </div>
    </div>
  );
}
