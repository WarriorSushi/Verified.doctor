"use client";

import { ReactNode } from "react";
import { TourProvider, TourOverlay } from "@/components/tour";

export function DashboardClientWrapper({ children }: { children: ReactNode }) {
  return (
    <TourProvider>
      {children}
      <TourOverlay />
    </TourProvider>
  );
}
