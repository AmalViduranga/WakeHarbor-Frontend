"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Execution } from "@/types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface HealthTrendChartProps {
  executions: Execution[];
}

export function HealthTrendChart({ executions }: HealthTrendChartProps) {
  // Format execution history chronologically for chart
  const chartData = [...executions]
    .reverse()
    .map((e) => {
      const time = new Date(e.executedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return {
        time,
        latency: e.latencyMs || 0,
        status: e.status,
        isSuccess: e.status === "SUCCESS" ? 1 : 0,
        project: e.projectName,
      };
    });

  if (chartData.length === 0) {
    return (
      <Card className="p-8 text-center text-xs text-slate-500 border-slate-800 bg-slate-900/40">
        No execution data available yet. Connect a project to begin charting latency and heartbeat health.
      </Card>
    );
  }

  return (
    <Card className="border-slate-800 bg-slate-900/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Database RPC Response Latency</CardTitle>
            <CardDescription className="text-xs">Real-time roundtrip response time (ms) for recent heartbeats</CardDescription>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
            LIVE METRICS
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} unit="ms" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 shadow-xl text-xs space-y-1">
                        <p className="font-semibold text-slate-200">{data.project}</p>
                        <p className="text-emerald-400 font-mono">Latency: {data.latency} ms</p>
                        <p className="text-slate-400">Status: {data.status}</p>
                        <p className="text-slate-500 text-[10px]">{data.time}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="latency"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#latencyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
