"use client";

import { useState, useRef } from "react";
import { QrCode, Download, Printer, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface QRDesign {
  id: string;
  name: string;
  bgColor: string;
  fgColor: string;
  frameColor: string;
  textColor: string;
  accentColor: string;
}

const qrDesigns: QRDesign[] = [
  {
    id: "classic",
    name: "Classic",
    bgColor: "#FFFFFF",
    fgColor: "#000000",
    frameColor: "#0099F7",
    textColor: "#1E293B",
    accentColor: "#0099F7",
  },
  {
    id: "midnight",
    name: "Midnight",
    bgColor: "#1E293B",
    fgColor: "#FFFFFF",
    frameColor: "#3B82F6",
    textColor: "#FFFFFF",
    accentColor: "#60A5FA",
  },
  {
    id: "emerald",
    name: "Emerald",
    bgColor: "#ECFDF5",
    fgColor: "#065F46",
    frameColor: "#10B981",
    textColor: "#065F46",
    accentColor: "#34D399",
  },
  {
    id: "sunset",
    name: "Sunset",
    bgColor: "#FFF7ED",
    fgColor: "#9A3412",
    frameColor: "#F97316",
    textColor: "#9A3412",
    accentColor: "#FB923C",
  },
  {
    id: "ocean",
    name: "Ocean",
    bgColor: "#F0FDFA",
    fgColor: "#134E4A",
    frameColor: "#0D9488",
    textColor: "#134E4A",
    accentColor: "#2DD4BF",
  },
  {
    id: "minimal",
    name: "Minimal",
    bgColor: "#FFFFFF",
    fgColor: "#374151",
    frameColor: "#E5E7EB",
    textColor: "#6B7280",
    accentColor: "#9CA3AF",
  },
];

interface QRCodeDesignerProps {
  handle: string;
  doctorName: string;
  specialty?: string | null;
  trigger?: React.ReactNode;
}

export function QRCodeDesigner({ handle, doctorName, specialty, trigger }: QRCodeDesignerProps) {
  const [selectedDesign, setSelectedDesign] = useState<QRDesign>(qrDesigns[0]);
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const profileUrl = `https://verified.doctor/${handle}`;

  const generateQRCodeUrl = (size: number, bgColor: string, fgColor: string) => {
    const bg = bgColor.replace("#", "");
    const fg = fgColor.replace("#", "");
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(profileUrl)}&bgcolor=${bg}&color=${fg}&margin=1`;
  };

  const downloadQRCard = async (format: "png" | "pdf") => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Card dimensions (optimized for print)
    const cardWidth = 400;
    const cardHeight = 500;
    canvas.width = cardWidth;
    canvas.height = cardHeight;

    const design = selectedDesign;

    // Background
    ctx.fillStyle = design.bgColor;
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    // Frame border
    ctx.strokeStyle = design.frameColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, cardWidth - 32, cardHeight - 32);

    // Inner accent line
    ctx.strokeStyle = design.accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, cardWidth - 48, cardHeight - 48);

    // Load and draw QR code
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";

    await new Promise<void>((resolve) => {
      qrImg.onload = () => {
        // QR code position (centered, upper portion)
        const qrSize = 220;
        const qrX = (cardWidth - qrSize) / 2;
        const qrY = 60;

        // QR background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        resolve();
      };
      qrImg.src = generateQRCodeUrl(220, "FFFFFF", design.fgColor.replace("#", ""));
    });

    // "Scan to connect" text
    ctx.fillStyle = design.textColor;
    ctx.font = "bold 18px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scan to connect with", cardWidth / 2, 320);

    // Doctor name
    ctx.fillStyle = design.frameColor;
    ctx.font = "bold 24px Inter, system-ui, sans-serif";
    ctx.fillText(doctorName, cardWidth / 2, 355);

    // Specialty (if available)
    if (specialty) {
      ctx.fillStyle = design.textColor;
      ctx.font = "16px Inter, system-ui, sans-serif";
      ctx.fillText(specialty, cardWidth / 2, 385);
    }

    // Profile URL
    ctx.fillStyle = design.accentColor;
    ctx.font = "14px monospace";
    ctx.fillText(`verified.doctor/${handle}`, cardWidth / 2, 430);

    // Verified.Doctor branding
    ctx.fillStyle = design.textColor;
    ctx.globalAlpha = 0.6;
    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.fillText("Verified.Doctor", cardWidth / 2, 465);
    ctx.globalAlpha = 1;

    if (format === "png") {
      // Download as PNG
      const link = document.createElement("a");
      link.download = `qr-card-${handle}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } else {
      // Download as PDF (using canvas to PDF conversion)
      const imgData = canvas.toDataURL("image/png");

      // Create a simple PDF using browser's print functionality
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>QR Code - ${doctorName}</title>
            <style>
              @page { size: 4in 5in; margin: 0; }
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
              img { max-width: 100%; height: auto; }
              @media print {
                body { margin: 0; }
                img { width: 4in; height: 5in; }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" />
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-xs">
            <QrCode className="w-3.5 h-3.5 mr-1.5" />
            QR Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#0099F7]" />
            Download QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Preview */}
          <div
            className="relative mx-auto rounded-xl overflow-hidden shadow-lg"
            style={{
              width: 200,
              height: 250,
              backgroundColor: selectedDesign.bgColor,
              border: `4px solid ${selectedDesign.frameColor}`,
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              {/* QR Code */}
              <div className="bg-white p-2 rounded-lg mb-3">
                <img
                  src={generateQRCodeUrl(100, "FFFFFF", selectedDesign.fgColor.replace("#", ""))}
                  alt="QR Code Preview"
                  width={100}
                  height={100}
                />
              </div>

              {/* Text */}
              <p
                className="text-[10px] font-medium mb-0.5"
                style={{ color: selectedDesign.textColor }}
              >
                Scan to connect with
              </p>
              <p
                className="text-xs font-bold truncate max-w-full px-2"
                style={{ color: selectedDesign.frameColor }}
              >
                {doctorName}
              </p>
              {specialty && (
                <p
                  className="text-[9px] truncate max-w-full px-2"
                  style={{ color: selectedDesign.textColor }}
                >
                  {specialty}
                </p>
              )}
              <p
                className="text-[8px] font-mono mt-2"
                style={{ color: selectedDesign.accentColor }}
              >
                verified.doctor/{handle}
              </p>
            </div>
          </div>

          {/* Design Selector */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Choose Design</p>
            <div className="grid grid-cols-6 gap-2">
              {qrDesigns.map((design) => (
                <button
                  key={design.id}
                  onClick={() => setSelectedDesign(design)}
                  className={`relative aspect-square rounded-lg border-2 transition-all ${
                    selectedDesign.id === design.id
                      ? "border-[#0099F7] ring-2 ring-[#0099F7]/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  style={{ backgroundColor: design.bgColor }}
                  title={design.name}
                >
                  <div
                    className="absolute inset-2 rounded"
                    style={{
                      border: `2px solid ${design.frameColor}`,
                      backgroundColor: design.bgColor,
                    }}
                  />
                  {selectedDesign.id === design.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#0099F7] rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1.5 text-center">{selectedDesign.name}</p>
          </div>

          {/* Download Options */}
          <div className="flex gap-2">
            <Button
              onClick={() => downloadQRCard("png")}
              className="flex-1 bg-[#0099F7] hover:bg-[#0080CC]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
            <Button
              onClick={() => downloadQRCard("pdf")}
              variant="outline"
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Print and display in your clinic for patients to scan
          </p>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
