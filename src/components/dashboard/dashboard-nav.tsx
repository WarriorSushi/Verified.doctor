"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, MessageSquare, Users, BarChart3 } from "lucide-react";

interface DashboardNavProps {
  unreadCount: number;
  pendingConnectionsCount?: number;
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, tourId: "nav-overview" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, badgeKey: "messages", tourId: "nav-messages" },
  { href: "/dashboard/connections", label: "Connections", icon: Users, badgeKey: "connections", tourId: "nav-connections" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, tourId: "nav-analytics" },
];

export function DashboardNav({ unreadCount, pendingConnectionsCount = 0 }: DashboardNavProps) {
  const pathname = usePathname();

  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === "messages") return unreadCount;
    if (badgeKey === "connections") return pendingConnectionsCount;
    return 0;
  };

  return (
    <nav className="border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-2 sm:px-6">
        {/* Mobile: Icon + tiny label stacked, evenly distributed */}
        {/* Desktop: Horizontal with icon + label inline */}
        <div className="flex justify-around sm:justify-start sm:gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            const badgeCount = getBadgeCount(item.badgeKey);

            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.tourId}
                className={cn(
                  // Mobile: flex-col with icon on top, label below
                  // Desktop: flex-row inline
                  "relative flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 font-medium border-b-2 -mb-px transition-colors",
                  isActive
                    ? "border-[#0099F7] text-[#0099F7]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 sm:w-4 sm:h-4" />
                  {/* Badge on mobile - positioned on icon */}
                  {badgeCount > 0 && (
                    <span className="sm:hidden absolute -top-1.5 -right-1.5 px-1 py-0.5 text-[9px] font-bold bg-red-500 text-white rounded-full min-w-[14px] text-center leading-none">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-sm whitespace-nowrap">{item.label}</span>
                {/* Badge on desktop - inline */}
                {badgeCount > 0 && (
                  <span className="hidden sm:inline-flex ml-1 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[18px] text-center">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
