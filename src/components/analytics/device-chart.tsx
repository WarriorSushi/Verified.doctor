"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Tablet, Monitor } from "lucide-react";

interface DeviceBreakdown {
  mobile: number;
  tablet: number;
  desktop: number;
}

interface DeviceChartProps {
  deviceBreakdown: DeviceBreakdown;
}

const COLORS = ["#0099F7", "#8B5CF6", "#10B981"];

export function DeviceChart({ deviceBreakdown }: DeviceChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = deviceBreakdown.mobile + deviceBreakdown.tablet + deviceBreakdown.desktop;

  const data = [
    { name: "Mobile", value: deviceBreakdown.mobile, icon: Smartphone },
    { name: "Tablet", value: deviceBreakdown.tablet, icon: Tablet },
    { name: "Desktop", value: deviceBreakdown.desktop, icon: Monitor },
  ].filter(item => item.value > 0);

  const getPercentage = (value: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg font-semibold text-slate-800">
          Device Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-slate-500">
            No data available
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-[160px] w-[160px]">
              {!mounted ? (
                <div className="w-full h-full animate-pulse bg-slate-100 rounded-full" />
              ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={100}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                    formatter={(value) => [typeof value === "number" ? value.toLocaleString() : String(value), "Views"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              )}
            </div>
            <div className="flex-1 space-y-2">
              {data.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600">{item.name}</span>
                    <span className="ml-auto text-sm font-medium text-slate-800">
                      {getPercentage(item.value)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
