"use client";

import { useState } from "react";
import { ChevronDown, Eye, EyeOff, Info, Sparkles, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SectionWrapperProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  hasAI?: boolean;
  hasChanges?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
}

// Custom Toggle Switch Component
function VisibilityToggle({
  isVisible,
  onToggle,
}: {
  isVisible: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={isVisible}
        onClick={onToggle}
        className={cn(
          "relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
          isVisible
            ? "bg-gradient-to-r from-sky-400 to-sky-500 border-sky-400"
            : "bg-slate-200 border-slate-300 hover:bg-slate-300 hover:border-slate-400"
        )}
      >
        {/* Sliding Knob */}
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition-all duration-300 ease-out",
            isVisible
              ? "translate-x-[22px] bg-white"
              : "translate-x-0.5 bg-white"
          )}
        >
          {/* Inner icon on knob */}
          <span className="absolute inset-0 flex items-center justify-center">
            {isVisible ? (
              <Eye className="w-3 h-3 text-sky-500" />
            ) : (
              <EyeOff className="w-3 h-3 text-slate-400" />
            )}
          </span>
        </span>
      </button>

      {/* Label */}
      <div className="flex flex-col">
        <span
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            isVisible ? "text-sky-700" : "text-slate-600"
          )}
        >
          {isVisible ? "Visible on profile" : "Hidden from profile"}
        </span>
      </div>
    </div>
  );
}

export function SectionWrapper({
  title,
  description,
  icon,
  isVisible,
  onVisibilityChange,
  children,
  defaultOpen = false,
  badge,
  hasAI = false,
  hasChanges = false,
  isSaving = false,
  onSave,
}: SectionWrapperProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border-2 transition-all duration-300",
        isVisible
          ? "border-slate-200/80 shadow-sm"
          : "border-dashed border-slate-200"
      )}
    >
      {/* Header */}
      <div className="p-4 sm:p-5">
        {/* Top row: Icon, Title, Badge */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
              isVisible
                ? "bg-sky-50 text-sky-600"
                : "bg-slate-100 text-slate-400"
            )}
          >
            {icon}
          </div>

          {/* Title & Description */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={cn(
                  "font-semibold text-base sm:text-lg transition-colors duration-200",
                  isVisible ? "text-slate-900" : "text-slate-500"
                )}
              >
                {title}
              </h3>
              {hasAI && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-sky-100 to-teal-100 text-teal-700 rounded-md">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              )}
              {badge && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded-md uppercase tracking-wide">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p
                className={cn(
                  "text-sm mt-0.5 transition-colors duration-200 line-clamp-2",
                  isVisible ? "text-slate-500" : "text-slate-400"
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          {/* Visibility Toggle with Info */}
          <div className="flex items-center gap-2">
            <VisibilityToggle
              isVisible={isVisible}
              onToggle={() => onVisibilityChange(!isVisible)}
            />

            {/* Info tooltip */}
            <div className="relative">
              <button
                type="button"
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                aria-label="More info about visibility"
              >
                <Info className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-50"
                  >
                    <div className="bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg max-w-[200px] whitespace-normal">
                      <p>Toggle to show or hide this section on your public profile. Hidden sections are only visible to you.</p>
                      <div className="absolute -top-1 left-4 sm:left-auto sm:right-4 w-2 h-2 bg-slate-800 rotate-45" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98]",
              isOpen
                ? "bg-sky-50 text-sky-700 border border-sky-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
            )}
          >
            <span>{isOpen ? "Collapse" : "Edit"}</span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Content with animation */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "px-4 sm:px-5 pb-5 pt-4 border-t border-slate-100 transition-opacity duration-300",
                !isVisible && "opacity-50"
              )}
            >
              {/* Hidden indicator banner when section is hidden */}
              {!isVisible && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <EyeOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    This section is hidden from your public profile. Toggle above to make it visible.
                  </p>
                </motion.div>
              )}
              {children}

              {/* Inline save button - appears when there are unsaved changes */}
              {hasChanges && onSave && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-slate-100"
                >
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaving}
                    className={cn(
                      "w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                      isSaving
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-sky-500 hover:bg-sky-600 text-white active:scale-[0.98]"
                    )}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
