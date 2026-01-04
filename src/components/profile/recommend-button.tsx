"use client";

import { useState } from "react";
import { ThumbsUp, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

interface RecommendButtonProps {
  profileId: string;
}

export function RecommendButton({ profileId }: RecommendButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already">("idle");

  const handleRecommend = async () => {
    // Track click event
    trackEvent({ profileId, eventType: "click_recommend" });
    setStatus("loading");

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });

      const data = await response.json();

      if (data.alreadyRecommended) {
        setStatus("already");
        toast.info("You've already recommended this doctor");
      } else {
        // Track successful recommendation
        trackEvent({ profileId, eventType: "recommendation_given" });
        setStatus("success");
        toast.success("Thank you for your recommendation!");
      }
    } catch {
      setStatus("idle");
      toast.error("Failed to submit recommendation");
    }
  };

  if (status === "success") {
    return (
      <Button
        disabled
        className="bg-emerald-500 text-white hover:bg-emerald-500"
      >
        <Check className="w-5 h-5 mr-2" />
        Thank you for your recommendation!
      </Button>
    );
  }

  if (status === "already") {
    return (
      <Button disabled variant="outline">
        <Check className="w-5 h-5 mr-2" />
        You&apos;ve already recommended
      </Button>
    );
  }

  return (
    <Button
      onClick={handleRecommend}
      disabled={status === "loading"}
      className="bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white px-8"
    >
      {status === "loading" ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <ThumbsUp className="w-5 h-5 mr-2" />
          I Recommend This Doctor
        </>
      )}
    </Button>
  );
}
