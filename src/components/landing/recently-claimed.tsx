"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck } from "lucide-react";

const recentHandles = [
  "priya",
  "sharma",
  "patel",
  "gupta",
  "mehta",
  "reddy",
  "khan",
  "singh",
  "kumar",
  "das",
];

export function RecentlyClaimed() {
  const [displayedHandles, setDisplayedHandles] = useState<string[]>(
    recentHandles.slice(0, 3)
  );
  const indexRef = useRef(3);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = indexRef.current % recentHandles.length;
      indexRef.current = indexRef.current + 1;

      setDisplayedHandles((prev) => {
        const newHandles = [...prev.slice(1), recentHandles[nextIndex]];
        return newHandles;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-6 border-y border-slate-100 bg-slate-50/50">
      <div className="max-w-xl mx-auto px-4">
        <div className="flex items-center justify-center gap-2.5 text-sm">
          <span className="flex items-center gap-1.5 text-slate-500">
            <BadgeCheck className="w-4 h-4 text-sky-500" />
            <span className="font-medium">Recently claimed</span>
          </span>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {displayedHandles.map((handle, index) => (
                <motion.span
                  key={`${handle}-${index}`}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 text-sm font-mono whitespace-nowrap"
                >
                  <span className="text-slate-300 mr-0.5">/</span>
                  {handle}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
