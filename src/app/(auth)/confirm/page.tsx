import type { Metadata } from "next";
import { ConfirmHandler } from "@/components/auth/confirm-handler";

// This page should not be indexed - it's a transient confirmation page
export const metadata: Metadata = {
  title: "Confirming Your Email",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConfirmPage() {
  return <ConfirmHandler />;
}
