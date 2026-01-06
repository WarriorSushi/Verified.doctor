"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTour } from "./tour-provider";

export function TourOverlay() {
  const {
    isActive,
    steps,
    currentStep,
    nextStep,
    prevStep,
    skipTour,
    endTour,
    showSkipDialog,
    setShowSkipDialog,
    confirmSkip,
  } = useTour();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const observerRef = useRef<MutationObserver | null>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Find and track target element
  useEffect(() => {
    if (!isActive || !step) return;

    const findTarget = () => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        calculateTooltipPosition(rect, step.placement);
      } else {
        setTargetRect(null);
      }
    };

    // Initial find
    findTarget();

    // Watch for DOM changes
    observerRef.current = new MutationObserver(findTarget);
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Also update on scroll/resize
    window.addEventListener("scroll", findTarget, true);
    window.addEventListener("resize", findTarget);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      window.removeEventListener("scroll", findTarget, true);
      window.removeEventListener("resize", findTarget);
    };
  }, [isActive, step, currentStep]);

  const calculateTooltipPosition = (rect: DOMRect, placement: string) => {
    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180;

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        break;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < padding) left = padding;
    if (left + tooltipWidth > viewportWidth - padding) {
      left = viewportWidth - tooltipWidth - padding;
    }
    if (top < padding) top = rect.bottom + padding;
    if (top + tooltipHeight > viewportHeight - padding) {
      top = rect.top - tooltipHeight - padding;
    }

    setTooltipPosition({ top, left });
  };

  if (!isActive) return null;

  return (
    <>
      {/* Overlay with spotlight */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full pointer-events-auto">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Spotlight ring */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute border-2 border-[#0099F7] rounded-xl pointer-events-none"
            style={{
              left: targetRect.left - 8,
              top: targetRect.top - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: "0 0 0 4px rgba(0, 153, 247, 0.3), 0 0 20px rgba(0, 153, 247, 0.2)",
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        {targetRect && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-[320px]"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-sky-600">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <button
                onClick={skipTour}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <h3 className="font-semibold text-slate-900 text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">{step.description}</p>

            {/* Progress bar */}
            <div className="w-full h-1 bg-slate-100 rounded-full mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={skipTour}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Skip tour
              </button>
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    className="h-9"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={isLastStep ? endTour : nextStep}
                  className="h-9 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700"
                >
                  {isLastStep ? "Finish" : "Next"}
                  {!isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Confirmation Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Skip the tour?</DialogTitle>
            <DialogDescription className="pt-2">
              No worries! You can restart the guided tour anytime by clicking on your profile picture
              in the top right corner and selecting <strong>&quot;Take a Tour&quot;</strong> from the menu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowSkipDialog(false)}
              className="flex-1 sm:flex-none"
            >
              Continue Tour
            </Button>
            <Button
              onClick={confirmSkip}
              className="flex-1 sm:flex-none"
            >
              Skip for Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
