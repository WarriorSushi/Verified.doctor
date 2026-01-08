"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, MessageSquare, Users, BarChart3, Crown } from "lucide-react";

interface MobileBottomNavProps {
  unreadCount: number;
  pendingConnectionsCount?: number;
}

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home, tourId: "mobile-nav-home" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, badgeKey: "messages", tourId: "mobile-nav-messages" },
  { href: "/dashboard/connections", label: "Connections", icon: Users, badgeKey: "connections", tourId: "mobile-nav-connections" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, tourId: "mobile-nav-analytics" },
  { href: "/dashboard/upgrade", label: "Pro", icon: Crown, tourId: "mobile-nav-upgrade", isPro: true },
];

export function MobileBottomNav({ unreadCount, pendingConnectionsCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname();

  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === "messages") return unreadCount;
    if (badgeKey === "connections") return pendingConnectionsCount;
    return 0;
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_16px_rgba(0,0,0,0.1)]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex justify-around items-stretch h-[60px] px-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const badgeCount = getBadgeCount(item.badgeKey);
          const isPro = "isPro" in item && item.isPro;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.tourId}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 mx-0.5 my-1.5 rounded-xl transition-all",
                isPro
                  ? isActive
                    ? "bg-amber-50 text-amber-600"
                    : "text-amber-500 active:bg-amber-50 active:text-amber-600"
                  : isActive
                    ? "bg-sky-50 text-sky-600"
                    : "text-slate-400 active:bg-slate-100 active:text-slate-600"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-6 h-6 transition-all",
                  isPro
                    ? isActive ? "stroke-[2.5] text-amber-600" : "stroke-[1.8] text-amber-500"
                    : isActive ? "stroke-[2.5] text-sky-600" : "stroke-[1.8] text-slate-400"
                )} />
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 px-1 py-0.5 text-[9px] font-bold bg-red-500 text-white rounded-full min-w-[16px] text-center leading-none shadow-sm">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-semibold tracking-tight",
                isPro
                  ? isActive ? "text-amber-600" : "text-amber-500"
                  : isActive ? "text-sky-600" : "text-slate-400"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
