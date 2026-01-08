"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Check,
  QrCode,
  UserPlus,
  ArrowRight,
  Copy,
  Sparkles,
  X,
  MessageCircle,
  Link2,
  Users,
  AlertCircle,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handle = searchParams.get("handle") || "";

  const [emails, setEmails] = useState(["", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [invitesSent, setInvitesSent] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const profileUrl = `https://verified.doctor/${handle}`;

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const validEmails = emails.filter((email) => {
    // Simple email validation
    return email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  });

  const sendInvites = async () => {
    if (validEmails.length === 0) {
      setError("Please enter at least one valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Send invites for each valid email
      const results = await Promise.all(
        validEmails.map((email) =>
          fetch("/api/invites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim() }),
          })
        )
      );

      // Check if all succeeded
      const allSucceeded = results.every((r) => r.ok);

      if (!allSucceeded) {
        throw new Error("Some invites failed to send");
      }

      setInvitesSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invites");
    } finally {
      setIsLoading(false);
    }
  };

  const copyProfileUrl = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToDashboard = () => {
    // Set flag to auto-trigger guided tour on dashboard
    localStorage.setItem("verified_doctor_show_tour", "true");
    router.push("/dashboard");
  };

  const handleSkipClick = () => {
    setShowSkipDialog(true);
  };

  const generateInviteLink = async () => {
    if (inviteLink) return inviteLink;

    setIsGeneratingLink(true);
    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.inviteCode) {
        const link = `https://verified.doctor/sign-up?invite=${data.inviteCode}`;
        setInviteLink(link);
        return link;
      }
    } catch (err) {
      console.error("Failed to generate invite link:", err);
    } finally {
      setIsGeneratingLink(false);
    }
    return null;
  };

  const copyInviteLink = async () => {
    const link = await generateInviteLink();
    if (link) {
      await navigator.clipboard.writeText(link);
      setInviteLinkCopied(true);
      setTimeout(() => setInviteLinkCopied(false), 2000);
    }
  };

  const shareViaWhatsApp = async () => {
    const link = await generateInviteLink();
    if (link) {
      const message = `🎉 *You're invited to Verified.Doctor!*

I just joined and wanted to share my exclusive invite with you.

✨ It's like a blue checkmark for doctors - build your verified professional profile.

👉 Join using my invite: ${link}

We'll be automatically connected when you sign up!`;
      const encodedMessage = encodeURIComponent(message);

      // Use Web Share API if available (works best on mobile)
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Join me on Verified.Doctor",
            text: message,
          });
          return;
        } catch {
          // User cancelled or share failed, fall back to WhatsApp
        }
      }

      // For mobile devices, use whatsapp:// protocol which opens the app directly
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        // This opens WhatsApp app directly and shows contact picker
        window.location.href = `whatsapp://send?text=${encodedMessage}`;
      } else {
        // Desktop - open WhatsApp Web
        window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, "_blank");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Background elements */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#A4FDFF]/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10">
            <Image
              src="/verified-doctor-logo.svg"
              alt="Verified.Doctor"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">
            verified<span className="text-[#0099F7]">.doctor</span>
          </span>
        </Link>

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          {/* Celebration Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 sm:px-8 py-6 sm:py-8 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-white/20 rounded-full flex items-center justify-center"
            >
              <Check className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </motion.div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">
              Your Profile is Live!
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base">
              Patients can now find you at
            </p>
            <div className="mt-2 inline-flex items-center gap-2 bg-white/20 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2">
              <span className="font-mono text-sm sm:text-base">
                verified.doctor/{handle}
              </span>
              <button onClick={copyProfileUrl} className="p-1 hover:bg-white/20 rounded">
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* QR Code Preview */}
          <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 sm:p-3 rounded-xl border border-slate-200 shadow-sm">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(profileUrl)}`}
                  alt="QR Code"
                  width={80}
                  height={80}
                  className="sm:w-[100px] sm:h-[100px]"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm sm:text-base mb-1">
                  <QrCode className="w-4 h-4 text-[#0099F7]" />
                  Your QR Code is Ready
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Display this in your clinic for patients to scan and save your contact.
                </p>
              </div>
            </div>
          </div>

          {/* Invite Section */}
          {!invitesSent ? (
            <div className="px-5 sm:px-8 py-5 sm:py-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0099F7] to-[#0080CC] flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800 text-sm sm:text-base">
                    Invite Your Colleagues
                  </h2>
                  <p className="text-xs text-slate-500">
                    Build your professional network
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mb-4">
                Doctors with strong networks get more visibility. Invite colleagues and you&apos;ll automatically be connected!
              </p>

              {/* Quick Share Buttons - WhatsApp & Copy Link */}
              <div className="flex gap-3 mb-5">
                <Button
                  onClick={shareViaWhatsApp}
                  disabled={isGeneratingLink}
                  className="flex-1 h-11 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-sm shadow-lg shadow-[#25D366]/20"
                >
                  {isGeneratingLink ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-2" />
                  )}
                  WhatsApp
                </Button>
                <Button
                  onClick={copyInviteLink}
                  disabled={isGeneratingLink}
                  variant="outline"
                  className={`flex-1 h-11 font-semibold text-sm border-slate-300 hover:bg-slate-50 ${inviteLinkCopied ? "border-emerald-300 bg-emerald-50" : ""}`}
                >
                  {isGeneratingLink ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : inviteLinkCopied ? (
                    <Check className="w-4 h-4 mr-2 text-emerald-500" />
                  ) : (
                    <Link2 className="w-4 h-4 mr-2" />
                  )}
                  {inviteLinkCopied ? "Copied!" : "Copy Link"}
                </Button>
              </div>

              {/* Copy success helper text */}
              {inviteLinkCopied && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-emerald-600 text-center mb-3"
                >
                  ✓ Link copied! Now paste and send it to a colleague
                </motion.p>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">or send via email</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Email Inputs */}
              <div className="space-y-3">
                {emails.map((email, index) => (
                  <div key={index} className="relative">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      placeholder={`colleague${index + 1}@hospital.com`}
                      className="h-10 sm:h-11 text-sm sm:text-base pr-8"
                    />
                    {email && (
                      <button
                        onClick={() => updateEmail(index, "")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <p className="mt-3 text-xs sm:text-sm text-red-500">{error}</p>
              )}

              <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={sendInvites}
                  disabled={isLoading || validEmails.length === 0}
                  className="flex-1 h-10 sm:h-11 bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white font-semibold text-sm sm:text-base"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Send {validEmails.length > 0 ? `${validEmails.length} ` : ""}Invite{validEmails.length !== 1 ? "s" : ""}
                </Button>
                <Button
                  onClick={handleSkipClick}
                  variant="outline"
                  className="h-10 sm:h-11 text-sm sm:text-base text-slate-500"
                >
                  Skip for now <span className="text-slate-400 ml-1">(go to dashboard)</span>
                </Button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-5 sm:px-8 py-5 sm:py-6 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-emerald-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">
                Invites Sent!
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                We&apos;ve sent invitations to {validEmails.length} colleague{validEmails.length !== 1 ? "s" : ""}. You&apos;ll be automatically connected when they join.
              </p>
              <Button
                onClick={goToDashboard}
                className="h-10 sm:h-11 bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white font-semibold text-sm sm:text-base"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Tip */}
        <p className="mt-6 text-center text-xs sm:text-sm text-slate-500">
          Tip: Complete your verification to get the{" "}
          <span className="text-[#0099F7] font-medium">verified badge</span> on your profile.
        </p>
      </div>

      {/* Skip Confirmation Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">
              Before You Go...
            </DialogTitle>
            <DialogDescription className="text-center space-y-3 pt-2">
              <p className="text-slate-600">
                Doctors with <span className="font-semibold text-slate-800">more connections</span> appear more credible to patients.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 text-left">
                <p className="text-sm text-slate-700 mb-2">
                  When colleagues join through your invite:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">You&apos;re automatically connected</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">Your connection count increases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">Your profile ranks higher in search</span>
                  </li>
                </ul>
              </div>
              <p className="text-xs text-slate-500 italic">
                Top doctors on our platform have 20+ connections
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
            <Button
              onClick={() => setShowSkipDialog(false)}
              className="flex-1 h-11 bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white font-semibold"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              I&apos;ll Invite Colleagues
            </Button>
            <Button
              onClick={goToDashboard}
              variant="ghost"
              className="flex-1 h-11 text-slate-500 hover:text-slate-700"
            >
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SuccessFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0099F7] mx-auto mb-4" />
        <p className="text-slate-600">Loading...</p>
      </div>
    </div>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
