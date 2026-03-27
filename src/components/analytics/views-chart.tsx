"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DailyStat {
  date: string;
  views: number;
  uniqueViews: number;
  verifiedDoctorViews: number;
  actions: number;
}

interface ViewsChartProps {
  dailyStats: DailyStat[];
}

export function ViewsChart({ dailyStats }: ViewsChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0); return () => clearTimeout(timer);;
  }, []);

  // Format date for display
  const formattedData = dailyStats.map(stat => ({
    ...stat,
    date: new Date(stat.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    }),
  }));

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg font-semibold text-slate-800">
          Profile Views Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[300px]">
          {!mounted ? (
            <div className="w-full h-full animate-pulse bg-slate-100 rounded" />
          ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0099F7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0099F7" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDoctor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748B" }}
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748B" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="Total Views"
                stroke="#0099F7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViews)"
              />
              <Area
                type="monotone"
                dataKey="uniqueViews"
                name="Unique Visitors"
                stroke="#0D9488"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorUnique)"
              />
              <Area
                type="monotone"
                dataKey="verifiedDoctorViews"
                name="Doctor Views"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDoctor)"
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
