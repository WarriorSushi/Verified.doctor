"use client";

import { ReactNode } from "react";
import { TourProvider, TourOverlay } from "@/components/tour";
import { SubscriptionProvider } from "@/components/subscription/use-subscription";

export function DashboardClientWrapper({ children }: { children: ReactNode }) {
  return (
    <SubscriptionProvider>
      <TourProvider>
        {children}
        <TourOverlay />
      </TourProvider>
    </SubscriptionProvider>
  );
}
