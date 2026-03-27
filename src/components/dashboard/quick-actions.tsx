"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Pencil,
  ExternalLink,
  Share2,
  QrCode,
  Check,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeDesigner } from "./qr-code-designer";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  handle: string;
  profileName: string;
  specialty: string | null;
}

export function QuickActions({ handle, profileName, specialty }: QuickActionsProps) {
  const [copied, setCopied] = useState(false);

  const shareProfile = async () => {
    const url = `https://verified.doctor/${handle}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileName} - Verified Doctor`,
          text: `Check out ${profileName}'s profile on Verified.Doctor`,
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Profile link copied!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  const actions = [
    {
      label: "Edit Profile",
      icon: Pencil,
      href: "/dashboard/profile-builder",
      color: "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100",
    },
    {
      label: "View Public",
      icon: ExternalLink,
      href: `/${handle}`,
      external: true,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
    },
    {
      label: "Share Profile",
      icon: copied ? Check : Share2,
      onClick: shareProfile,
      color: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
    },
    {
      label: "QR Code",
      icon: QrCode,
      isQR: true,
      color: "bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {actions.map((action) => {
        const Icon = action.icon;

        if (action.isQR) {
          return (
            <QRCodeDesigner
              key={action.label}
              handle={handle}
              doctorName={profileName}
              specialty={specialty}
              trigger={
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border transition-all ${action.color} w-full cursor-pointer`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-[10px] sm:text-xs font-medium leading-tight text-center">{action.label}</span>
                </motion.button>
              }
            />
          );
        }

        if (action.onClick) {
          return (
            <motion.button
              key={action.label}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className={`flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border transition-all ${action.color}`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs font-medium leading-tight text-center">{action.label}</span>
            </motion.button>
          );
        }

        if (action.external) {
          return (
            <motion.a
              key={action.label}
              whileTap={{ scale: 0.95 }}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border transition-all ${action.color}`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs font-medium leading-tight text-center">{action.label}</span>
            </motion.a>
          );
        }

        return (
          <Link key={action.label} href={action.href!}>
            <motion.div
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border transition-all ${action.color}`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs font-medium leading-tight text-center">{action.label}</span>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
