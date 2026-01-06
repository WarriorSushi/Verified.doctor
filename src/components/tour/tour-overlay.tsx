"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTour } from "./tour-provider";

const MOBILE_BREAKPOINT = 640; // sm breakpoint

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
  const [isMobile, setIsMobile] = useState(false);
  const [actualPlacement, setActualPlacement] = useState<"top" | "bottom" | "left" | "right">("bottom");
  const observerRef = useRef<MutationObserver | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get the correct target selector based on device
  const getTargetSelector = useCallback(() => {
    if (!step) return null;
    if (isMobile && step.mobileTarget) {
      return step.mobileTarget;
    }
    return step.target;
  }, [step, isMobile]);

  // Get the correct placement based on device
  const getPlacement = useCallback(() => {
    if (!step) return "bottom";
    if (isMobile && step.mobilePlacement) {
      return step.mobilePlacement;
    }
    return step.placement;
  }, [step, isMobile]);

  // Smart tooltip positioning that never goes off-screen
  const calculateTooltipPosition = useCallback((rect: DOMRect, placement: "top" | "bottom" | "left" | "right") => {
    const padding = 12;
    const tooltipWidth = isMobile ? Math.min(300, window.innerWidth - 32) : 340;
    const tooltipHeight = 220; // Estimated max height
    const spotlightPadding = 8;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;
    let finalPlacement = placement;

    // Calculate initial position based on placement
    const positions = {
      top: {
        top: rect.top - spotlightPadding - tooltipHeight - padding,
        left: rect.left + rect.width / 2 - tooltipWidth / 2,
      },
      bottom: {
        top: rect.bottom + spotlightPadding + padding,
        left: rect.left + rect.width / 2 - tooltipWidth / 2,
      },
      left: {
        top: rect.top + rect.height / 2 - tooltipHeight / 2,
        left: rect.left - spotlightPadding - tooltipWidth - padding,
      },
      right: {
        top: rect.top + rect.height / 2 - tooltipHeight / 2,
        left: rect.right + spotlightPadding + padding,
      },
    };

    // Try preferred placement first
    top = positions[placement].top;
    left = positions[placement].left;

    // Check if placement works, if not find alternative
    const fitsTop = positions.top.top >= padding;
    const fitsBottom = positions.bottom.top + tooltipHeight <= viewportHeight - padding;
    const fitsLeft = positions.left.left >= padding;
    const fitsRight = positions.right.left + tooltipWidth <= viewportWidth - padding;

    // If preferred doesn't fit, try alternatives
    if (placement === "top" && !fitsTop) {
      if (fitsBottom) {
        top = positions.bottom.top;
        left = positions.bottom.left;
        finalPlacement = "bottom";
      }
    } else if (placement === "bottom" && !fitsBottom) {
      if (fitsTop) {
        top = positions.top.top;
        left = positions.top.left;
        finalPlacement = "top";
      }
    } else if (placement === "left" && !fitsLeft) {
      if (fitsRight) {
        top = positions.right.top;
        left = positions.right.left;
        finalPlacement = "right";
      } else if (fitsTop) {
        top = positions.top.top;
        left = positions.top.left;
        finalPlacement = "top";
      } else {
        top = positions.bottom.top;
        left = positions.bottom.left;
        finalPlacement = "bottom";
      }
    } else if (placement === "right" && !fitsRight) {
      if (fitsLeft) {
        top = positions.left.top;
        left = positions.left.left;
        finalPlacement = "left";
      } else if (fitsTop) {
        top = positions.top.top;
        left = positions.top.left;
        finalPlacement = "top";
      } else {
        top = positions.bottom.top;
        left = positions.bottom.left;
        finalPlacement = "bottom";
      }
    }

    // Final boundary checks for horizontal
    if (left < padding) left = padding;
    if (left + tooltipWidth > viewportWidth - padding) {
      left = viewportWidth - tooltipWidth - padding;
    }

    // Final boundary checks for vertical
    if (top < padding) {
      top = padding;
    }
    if (top + tooltipHeight > viewportHeight - padding) {
      top = viewportHeight - tooltipHeight - padding;
    }

    setActualPlacement(finalPlacement);
    setTooltipPosition({ top, left });
  }, [isMobile]);

  // Find and track target element
  useEffect(() => {
    if (!isActive || !step) return;

    const findTarget = () => {
      const selector = getTargetSelector();
      if (!selector) return;

      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        calculateTooltipPosition(rect, getPlacement());

        // Scroll element into view if needed
        const viewportHeight = window.innerHeight;
        const elementCenter = rect.top + rect.height / 2;
        if (elementCenter < 100 || elementCenter > viewportHeight - 100) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        setTargetRect(null);
      }
    };

    // Initial find with small delay for DOM to settle
    const initialTimeout = setTimeout(findTarget, 100);

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
      clearTimeout(initialTimeout);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      window.removeEventListener("scroll", findTarget, true);
      window.removeEventListener("resize", findTarget);
    };
  }, [isActive, step, currentStep, getTargetSelector, getPlacement, calculateTooltipPosition]);

  if (!isActive) return null;

  const tooltipWidth = isMobile ? Math.min(300, window.innerWidth - 32) : 340;

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
            <linearGradient id="spotlight-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0099F7" />
              <stop offset="100%" stopColor="#00D4AA" />
            </linearGradient>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(15, 23, 42, 0.85)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Animated spotlight ring */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute rounded-xl pointer-events-none"
            style={{
              left: targetRect.left - 8,
              top: targetRect.top - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              background: "linear-gradient(135deg, rgba(0, 153, 247, 0.2), rgba(0, 212, 170, 0.2))",
              border: "2px solid",
              borderImage: "linear-gradient(135deg, #0099F7, #00D4AA) 1",
              boxShadow: "0 0 0 4px rgba(0, 153, 247, 0.15), 0 0 30px rgba(0, 153, 247, 0.3), inset 0 0 20px rgba(0, 153, 247, 0.1)",
            }}
          >
            {/* Pulse animation */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              animate={{
                boxShadow: [
                  "0 0 0 0px rgba(0, 153, 247, 0.4)",
                  "0 0 0 8px rgba(0, 153, 247, 0)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        {targetRect && step && (
          <motion.div
            ref={tooltipRef}
            key={currentStep}
            initial={{ opacity: 0, y: actualPlacement === "top" ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed z-[9999] bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              width: tooltipWidth,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-[#0099F7] via-[#00D4AA] to-[#0099F7]" />

            <div className="p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0099F7] to-[#00D4AA] flex items-center justify-center shadow-lg shadow-sky-500/20">
                    <MapPin className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Step {currentStep + 1} of {steps.length}
                    </span>
                  </div>
                </div>
                <button
                  onClick={skipTour}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Content */}
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl mb-2 leading-tight">
                {step.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5 mb-4">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? "bg-gradient-to-r from-[#0099F7] to-[#00D4AA] w-6"
                        : index < currentStep
                        ? "bg-[#0099F7] w-1.5"
                        : "bg-slate-200 w-1.5"
                    }`}
                    initial={index === currentStep ? { width: 6 } : {}}
                    animate={index === currentStep ? { width: 24 } : {}}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={skipTour}
                  className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Skip tour
                </button>
                <div className="flex gap-2">
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                      className="h-9 px-3 text-sm font-medium border-slate-200 hover:bg-slate-50"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={isLastStep ? endTour : nextStep}
                    className="h-9 px-4 text-sm font-semibold bg-gradient-to-r from-[#0099F7] to-[#0088E0] hover:from-[#0088E0] hover:to-[#0077CC] shadow-lg shadow-sky-500/25 transition-all hover:shadow-sky-500/40"
                  >
                    {isLastStep ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Done
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Skip Confirmation Dialog - Higher z-index than everything */}
      <AnimatePresence>
        {showSkipDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSkipDialog(false)}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="fixed z-[10001] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Gradient accent */}
              <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />

              <div className="p-5 sm:p-6">
                {/* Icon */}
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
                  Skip the tour?
                </h3>
                <p className="text-sm text-slate-600 text-center mb-6 leading-relaxed">
                  No worries! You can restart anytime from your{" "}
                  <span className="font-semibold text-slate-800">profile menu</span>{" "}
                  → <span className="font-semibold text-[#0099F7]">&quot;Take a Tour&quot;</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Button
                    variant="outline"
                    onClick={() => setShowSkipDialog(false)}
                    className="flex-1 h-11 font-semibold border-slate-200 hover:bg-slate-50"
                  >
                    Continue Tour
                  </Button>
                  <Button
                    onClick={confirmSkip}
                    className="flex-1 h-11 font-semibold bg-slate-900 hover:bg-slate-800"
                  >
                    Skip for Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
