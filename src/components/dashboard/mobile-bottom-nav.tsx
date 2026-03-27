"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Home, MessageSquare, Users, BarChart3, Crown, ExternalLink } from "lucide-react";

interface MobileBottomNavProps {
  unreadCount: number;
  pendingConnectionsCount?: number;
  profileHandle: string;
}

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home, tourId: "mobile-nav-home" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, badgeKey: "messages", tourId: "mobile-nav-messages" },
  { href: "/dashboard/connections", label: "Network", icon: Users, badgeKey: "connections", tourId: "mobile-nav-connections" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, tourId: "mobile-nav-analytics" },
  { href: "/dashboard/upgrade", label: "Pro", icon: Crown, tourId: "mobile-nav-upgrade", isPro: true },
] as const;

export function MobileBottomNav({ unreadCount, pendingConnectionsCount = 0, profileHandle }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [tappedItem, setTappedItem] = useState<string | null>(null);

  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === "messages") return unreadCount;
    if (badgeKey === "connections") return pendingConnectionsCount;
    return 0;
  };

  const handleTap = useCallback((href: string) => {
    setTappedItem(href);
    setTimeout(() => setTappedItem(null), 200);
  }, []);

  return (
    <>
      <Link
        href={`/${profileHandle}`}
        target="_blank"
        className="sm:hidden fixed right-4 bottom-20 z-[60] inline-flex items-center gap-2 rounded-full bg-[#0099F7] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,153,247,0.35)] active:scale-95 transition-transform"
      >
        <ExternalLink className="w-4 h-4" />
        View Profile
      </Link>

      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex justify-around items-stretch h-[62px] px-1">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            const badgeCount = getBadgeCount("badgeKey" in item ? item.badgeKey : undefined);
            const isPro = "isPro" in item && item.isPro;
            const isTapped = tappedItem === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.tourId}
                onClick={() => handleTap(item.href)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 flex-1 mx-0.5 my-1.5 rounded-xl transition-all duration-150",
                  isPro
                    ? isActive
                      ? "bg-amber-50 text-amber-600"
                      : "text-amber-500 active:bg-amber-50/80"
                    : isActive
                      ? "bg-sky-50 text-sky-600"
                      : "text-slate-400 active:bg-slate-50"
                )}
              >
                <AnimatePresence>
                  {isTapped && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0.4 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={cn(
                        "absolute w-8 h-8 rounded-full",
                        isPro ? "bg-amber-200" : "bg-sky-200"
                      )}
                    />
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className={cn(
                      "absolute -top-1.5 w-5 h-0.5 rounded-full",
                      isPro ? "bg-amber-500" : "bg-[#0099F7]"
                    )}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <div className="relative z-10">
                  <motion.div
                    animate={isTapped ? { scale: [1, 0.85, 1.1, 1] } : {}}
                    transition={{ duration: 0.25 }}
                  >
                    <Icon
                      className={cn(
                        "w-[22px] h-[22px] transition-all duration-150",
                        isPro
                          ? isActive ? "stroke-[2.5] text-amber-600" : "stroke-[1.8] text-amber-500"
                          : isActive ? "stroke-[2.5] text-sky-600" : "stroke-[1.8] text-slate-400"
                      )}
                    />
                  </motion.div>
                  {badgeCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2.5 px-1 py-0.5 text-[8px] font-bold bg-red-500 text-white rounded-full min-w-[16px] text-center leading-none shadow-sm ring-2 ring-white"
                    >
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </motion.span>
                  )}
                </div>

                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-tight z-10 transition-colors duration-150",
                    isPro
                      ? isActive ? "text-amber-600" : "text-amber-500"
                      : isActive ? "text-sky-600" : "text-slate-400"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
