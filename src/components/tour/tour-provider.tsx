"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DASHBOARD_TOUR_STEPS, TourStep } from "./tour-steps";

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  hasCompletedTour: boolean;
  showSkipDialog: boolean;
  setShowSkipDialog: (show: boolean) => void;
  confirmSkip: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

const TOUR_COMPLETED_KEY = "verified_doctor_tour_completed";
const SHOW_TOUR_KEY = "verified_doctor_show_tour";

export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if tour was completed on mount
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
    setHasCompletedTour(completed === "true");
    setIsInitialized(true);
  }, []);

  // Auto-start tour after onboarding
  useEffect(() => {
    if (!isInitialized) return;

    const shouldShowTour = localStorage.getItem(SHOW_TOUR_KEY);
    if (shouldShowTour === "true" && !hasCompletedTour && pathname === "/dashboard") {
      localStorage.removeItem(SHOW_TOUR_KEY);
      // Small delay to let the dashboard render
      setTimeout(() => {
        startTour();
      }, 500);
    }
  }, [isInitialized, hasCompletedTour, pathname]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    // Navigate to dashboard if not already there
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
  }, [pathname, router]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    setHasCompletedTour(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < DASHBOARD_TOUR_STEPS.length - 1) {
      const nextStepData = DASHBOARD_TOUR_STEPS[currentStep + 1];

      // Navigate if step requires different route
      if (nextStepData.route && pathname !== nextStepData.route) {
        router.push(nextStepData.route);
        // Small delay to let the page render before moving to next step
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, 300);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      endTour();
    }
  }, [currentStep, pathname, router, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const prevStepData = DASHBOARD_TOUR_STEPS[currentStep - 1];

      // Navigate if step requires different route
      if (prevStepData.route && pathname !== prevStepData.route) {
        router.push(prevStepData.route);
        setTimeout(() => {
          setCurrentStep((prev) => prev - 1);
        }, 300);
      } else {
        setCurrentStep((prev) => prev - 1);
      }
    }
  }, [currentStep, pathname, router]);

  const skipTour = useCallback(() => {
    setShowSkipDialog(true);
  }, []);

  const confirmSkip = useCallback(() => {
    setShowSkipDialog(false);
    setIsActive(false);
    setCurrentStep(0);
    // Don't mark as completed so they can try again
  }, []);

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        steps: DASHBOARD_TOUR_STEPS,
        startTour,
        endTour,
        nextStep,
        prevStep,
        skipTour,
        hasCompletedTour,
        showSkipDialog,
        setShowSkipDialog,
        confirmSkip,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within TourProvider");
  }
  return context;
}
