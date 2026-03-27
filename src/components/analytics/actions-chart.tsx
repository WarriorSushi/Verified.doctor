"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActionsBreakdown {
  saveContact: number;
  bookAppointment: number;
  sendInquiry: number;
  recommend: number;
}

interface ActionsChartProps {
  actionsBreakdown: ActionsBreakdown;
}

const COLORS = ["#0099F7", "#0D9488", "#10B981", "#F59E0B"];

export function ActionsChart({ actionsBreakdown }: ActionsChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0); return () => clearTimeout(timer);;
  }, []);

  const data = [
    { name: "Save Contact", value: actionsBreakdown.saveContact },
    { name: "Book Appt", value: actionsBreakdown.bookAppointment },
    { name: "Send Inquiry", value: actionsBreakdown.sendInquiry },
    { name: "Recommend", value: actionsBreakdown.recommend },
  ];

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg font-semibold text-slate-800">
          Actions Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[250px]">
          {!mounted ? (
            <div className="w-full h-full animate-pulse bg-slate-100 rounded" />
          ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#64748B" }}
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748B" }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                }}
                formatter={(value) => [typeof value === "number" ? value.toLocaleString() : String(value), "Count"]}
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                maxBarSize={30}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
