"use client";

import { useState } from "react";
import { Copy, Check, Loader2, Mail, Link2, UserPlus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InviteDialogProps {
  trigger?: React.ReactNode;
}

export function InviteDialog({ trigger }: InviteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const createInvite = async (withEmail: boolean) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withEmail ? { email } : {}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invite");
      }

      setInviteUrl(data.inviteUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    if (!inviteUrl) return;

    const message = `🎉 *You're invited to Verified.Doctor!*

I wanted to share my exclusive invite with you.

✨ It's like a blue checkmark for doctors - build your verified professional profile.

👉 Join using my invite: ${inviteUrl}

We'll be automatically connected when you sign up!`;
    const encodedMessage = encodeURIComponent(message);

    // For mobile devices, use whatsapp:// protocol
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `whatsapp://send?text=${encodedMessage}`;
    } else {
      window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, "_blank");
    }
  };

  const resetDialog = () => {
    setEmail("");
    setInviteUrl("");
    setError("");
    setCopied(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetDialog();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Colleague
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a Colleague</DialogTitle>
          <DialogDescription>
            When they sign up, you&apos;ll automatically be connected.
          </DialogDescription>
        </DialogHeader>

        {!inviteUrl ? (
          <div className="space-y-6 pt-4">
            {/* Option 1: Email invite */}
            <div className="space-y-3">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Send via Email
              </Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  onClick={() => createInvite(true)}
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Send"
                  )}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            {/* Option 2: Copy link */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Get Invite Link
              </Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => createInvite(false)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Link2 className="w-4 h-4 mr-2" />
                )}
                Generate Link
              </Button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <Check className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-emerald-700">
                Invite created successfully!
              </span>
            </div>

            <div className="space-y-2">
              <Label>Share this link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={inviteUrl}
                  className="font-mono text-sm"
                />
                <Button onClick={copyToClipboard} variant="outline">
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-emerald-600">
                  ✓ Copied! Paste and send to a colleague
                </p>
              )}
            </div>

            {/* Quick share options */}
            <div className="flex gap-2">
              <Button
                onClick={shareViaWhatsApp}
                className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share via WhatsApp
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              When your colleague signs up using this link, you&apos;ll be
              automatically connected.
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={resetDialog}
            >
              Create Another Invite
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
