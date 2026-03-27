"use client";

import { useState } from "react";
import { Download, MessageSquare, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SendInquiryDialog } from "./send-inquiry-dialog";
import { ShareCard } from "./share-card";
import { trackEvent } from "@/lib/analytics";

interface Profile {
  id: string;
  full_name: string;
  specialty: string | null;
  clinic_name: string | null;
  clinic_location: string | null;
  external_booking_url: string | null;
  handle: string;
  profile_photo_url?: string | null;
  is_verified?: boolean;
}

interface ThemeColors {
  background?: string;
  cardBorder?: string;
  primary?: string;
  text?: string;
}

interface ProfileActionsProps {
  profile: Profile;
  themeColors?: ThemeColors;
}

export function ProfileActions({ profile, themeColors }: ProfileActionsProps) {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl = `https://verified.doctor/${profile.handle}`;

  // Default colors that work with any theme
  const colors = {
    background: themeColors?.background || "#ffffff",
    border: themeColors?.cardBorder || "#e2e8f0",
    primary: themeColors?.primary || "#0099F7",
    text: themeColors?.text || "#1e293b",
  };

  const handleSaveContact = () => {
    // Track analytics event
    trackEvent({ profileId: profile.id, eventType: "click_save_contact" });

    // Generate vCard
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${profile.full_name}`,
      profile.specialty ? `TITLE:${profile.specialty}` : "",
      profile.clinic_name ? `ORG:${profile.clinic_name}` : "",
      profile.clinic_location ? `ADR:;;${profile.clinic_location};;;` : "",
      `URL:${profileUrl}`,
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.full_name.replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Contact saved to your device!");
  };


  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        style={{
          backgroundColor: colors.background,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <div className="max-w-lg mx-auto flex gap-2 sm:gap-3">
          <Button
            onClick={handleSaveContact}
            variant="outline"
            size="xl"
            className="flex-1 px-2 sm:px-4 transition-all duration-200 hover:scale-[1.02]"
            style={{
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: "transparent",
            }}
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Save Contact</span>
          </Button>
          <div className="shrink-0">
            <ShareCard
              profile={{
                full_name: profile.full_name,
                specialty: profile.specialty,
                handle: profile.handle,
                profile_photo_url: profile.profile_photo_url || null,
                is_verified: profile.is_verified ?? true,
                clinic_location: profile.clinic_location,
              }}
            />
          </div>
          <Button
            onClick={() => {
              trackEvent({ profileId: profile.id, eventType: "click_send_inquiry" });
              setIsInquiryOpen(true);
            }}
            size="xl"
            className="flex-1 px-2 sm:px-4 text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
            }}
          >
            <MessageSquare className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Send Inquiry</span>
          </Button>
        </div>
      </div>

      <SendInquiryDialog
        open={isInquiryOpen}
        onOpenChange={setIsInquiryOpen}
        profileId={profile.id}
        doctorName={profile.full_name}
      />
    </>
  );
}
