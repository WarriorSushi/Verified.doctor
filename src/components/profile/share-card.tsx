"use client";

import { useState, useRef, useCallback } from "react";
import {
  Share2,
  Download,
  Copy,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QRCode from "qrcode";

interface ShareCardProps {
  profile: {
    full_name: string;
    specialty: string | null;
    handle: string;
    profile_photo_url: string | null;
    is_verified: boolean;
    clinic_location: string | null;
  };
}

const CARD_W = 600;
const CARD_H = 340;

/**
 * Generates a beautiful share card image using Canvas API.
 * Returns a Blob (image/png).
 */
async function generateCardBlob(
  profile: ShareCardProps["profile"]
): Promise<Blob> {
  const profileUrl = `https://verified.doctor/${profile.handle}`;
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W * 2; // 2x for retina
  canvas.height = CARD_H * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  // ── Background ──
  // Solid white background
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  roundRect(ctx, 0, 0, CARD_W, CARD_H, 20);
  ctx.fill();

  // Subtle top accent bar
  ctx.fillStyle = "#0099F7";
  ctx.beginPath();
  roundRectTop(ctx, 0, 0, CARD_W, 6, 20);
  ctx.fill();

  // ── Profile Photo / Initials ──
  const photoX = 40;
  const photoY = 40;
  const photoR = 44;

  if (profile.profile_photo_url) {
    try {
      const img = await loadImage(profile.profile_photo_url);
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX + photoR, photoY + photoR, photoR, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, photoX, photoY, photoR * 2, photoR * 2);
      ctx.restore();
    } catch {
      drawInitials(ctx, profile.full_name, photoX, photoY, photoR);
    }
  } else {
    drawInitials(ctx, profile.full_name, photoX, photoY, photoR);
  }

  // ── Verified badge (overlay on photo) ──
  if (profile.is_verified) {
    const bx = photoX + photoR * 2 - 14;
    const by = photoY + photoR * 2 - 14;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(bx + 10, by + 10, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0099F7";
    ctx.beginPath();
    ctx.arc(bx + 10, by + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    // Checkmark
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx + 5, by + 10);
    ctx.lineTo(bx + 9, by + 14);
    ctx.lineTo(bx + 16, by + 7);
    ctx.stroke();
  }

  // ── Name ──
  const textX = photoX + photoR * 2 + 24;
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(truncateText(ctx, profile.full_name, CARD_W - textX - 180), textX, 70);

  // ── Specialty ──
  if (profile.specialty) {
    ctx.fillStyle = "#0099F7";
    ctx.font = "500 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(truncateText(ctx, profile.specialty, CARD_W - textX - 180), textX, 95);
  }

  // ── Location ──
  if (profile.clinic_location) {
    ctx.fillStyle = "#64748b";
    ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(
      "📍 " + truncateText(ctx, profile.clinic_location, CARD_W - textX - 180),
      textX,
      118
    );
  }

  // ── QR Code ──
  const qrSize = 100;
  const qrX = CARD_W - qrSize - 30;
  const qrY = 30;
  try {
    const qrDataUrl = await QRCode.toDataURL(profileUrl, {
      width: qrSize * 2,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
    const qrImg = await loadImage(qrDataUrl);
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch {
    // QR generation failed, skip
  }

  // ── Divider ──
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 156);
  ctx.lineTo(CARD_W - 40, 156);
  ctx.stroke();

  // ── URL ──
  ctx.fillStyle = "#0099F7";
  ctx.font = "600 16px 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace";
  ctx.fillText(`verified.doctor/${profile.handle}`, 40, 190);

  // ── Tagline ──
  ctx.fillStyle = "#94a3b8";
  ctx.font = "400 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Scan the QR code or visit the link above", 40, 215);

  // ── Footer branding ──
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  roundRectBottom(ctx, 0, CARD_H - 70, CARD_W, 70, 20);
  ctx.fill();

  // Separator line at footer top
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, CARD_H - 70);
  ctx.lineTo(CARD_W, CARD_H - 70);
  ctx.stroke();

  // Logo text
  ctx.fillStyle = "#0f172a";
  ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("verified", 40, CARD_H - 38);
  ctx.fillStyle = "#0099F7";
  ctx.fillText(".doctor", 40 + ctx.measureText("verified").width, CARD_H - 38);

  // Tagline
  ctx.fillStyle = "#94a3b8";
  ctx.font = "400 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Your Digital Identity, Verified.", 40, CARD_H - 18);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to generate image"))),
      "image/png",
      1
    );
  });
}

// ── Canvas helpers ──

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawInitials(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  r: number
) {
  ctx.fillStyle = "#e0f2fe";
  ctx.beginPath();
  ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0284c7";
  ctx.font = `bold ${r * 0.8}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  ctx.fillText(initials, x + r, y + r);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (ctx.measureText(truncated + "…").width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "…";
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function roundRectTop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function roundRectBottom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y);
}

// ── WhatsApp SVG icon (inline) ──
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ── Main ShareCard Component ──

export function ShareCard({ profile }: ShareCardProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const blobRef = useRef<Blob | null>(null);

  const profileUrl = `https://verified.doctor/${profile.handle}`;

  const generate = useCallback(async () => {
    if (blobRef.current) return; // already generated
    setGenerating(true);
    try {
      const blob = await generateCardBlob(profile);
      blobRef.current = blob;
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Share card generation failed:", err);
      toast.error("Failed to generate share card");
    } finally {
      setGenerating(false);
    }
  }, [profile]);

  const handleOpen = () => {
    setOpen(true);
    generate();
  };

  const handleDownload = () => {
    if (!blobRef.current) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blobRef.current);
    a.download = `Dr-${profile.full_name.replace(/\s+/g, "-")}-Verified-Doctor.png`;
    a.click();
    toast.success("Card downloaded!");
  };

  const handleWhatsApp = () => {
    const text = `Check out ${profile.full_name}'s verified profile on Verified.Doctor: ${profileUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outline"
        size="sm"
        className="gap-2 text-[#0099F7] border-[#0099F7]/30 hover:bg-[#0099F7]/5"
      >
        <Share2 className="w-4 h-4" />
        Share Card
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg">Share Profile Card</DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Preview */}
            <div className="bg-slate-100 rounded-xl p-3 flex items-center justify-center min-h-[200px]">
              {generating ? (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm">Generating card…</span>
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile Share Card"
                  className="w-full rounded-lg shadow-sm"
                />
              ) : null}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={handleDownload}
                disabled={!previewUrl}
                variant="outline"
                className="flex flex-col items-center gap-1.5 h-auto py-3 text-xs font-medium"
              >
                <Download className="w-5 h-5 text-slate-600" />
                Download
              </Button>
              <Button
                onClick={handleWhatsApp}
                variant="outline"
                className="flex flex-col items-center gap-1.5 h-auto py-3 text-xs font-medium"
              >
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                WhatsApp
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex flex-col items-center gap-1.5 h-auto py-3 text-xs font-medium"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-600" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>

            {/* Native share (mobile) */}
            {typeof navigator !== "undefined" && "share" in navigator && (
              <Button
                onClick={async () => {
                  const shareData: ShareData = {
                    title: `${profile.full_name} | Verified.Doctor`,
                    text: `Check out ${profile.full_name}'s verified profile`,
                    url: profileUrl,
                  };
                  // If we have the image blob, share it too
                  if (blobRef.current) {
                    try {
                      const file = new File(
                        [blobRef.current],
                        `Dr-${profile.full_name.replace(/\s+/g, "-")}.png`,
                        { type: "image/png" }
                      );
                      if (navigator.canShare?.({ files: [file] })) {
                        shareData.files = [file];
                      }
                    } catch {
                      // File sharing not supported, share without
                    }
                  }
                  try {
                    await navigator.share(shareData);
                  } catch (err) {
                    if ((err as Error).name !== "AbortError") {
                      toast.error("Sharing failed");
                    }
                  }
                }}
                className="w-full bg-[#0099F7] hover:bg-[#0088E0] text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                More Sharing Options
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
