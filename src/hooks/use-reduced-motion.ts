"use client";

import { useState, useEffect } from "react";

/**
 * Hook that returns true if the user prefers reduced motion.
 * Respects the `prefers-reduced-motion: reduce` media query.
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = setTimeout(() => setPrefersReduced(mql.matches), 0);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}
