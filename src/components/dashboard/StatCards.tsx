import React from "react";
import { Card } from "@/components/ui/Card";
import { DashboardSummary } from "@/types";
import { Database, CheckCircle2, AlertTriangle, PauseCircle, Activity, Zap } from "lucide-react";

interface StatCardsProps {
  summary: DashboardSummary;
}

export function StatCards({ summary }: StatCardsProps) {
  const stats = [
    {
      label: "Connected Projects",
      value: summary.totalProjects,
      desc: "Monitored databases",
      icon: Database,
      color: "text-blue-400",
      bg: "bg-blue-950/40 border-blue-800/40",
    },
    {
      label: "Healthy Projects",
      value: summary.healthyProjects,
      desc: "RPC heartbeat verified",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-950/40 border-emerald-800/40",
    },
    {
      label: "Failing / Degraded",
      value: summary.failedProjects,
      desc: "Require attention",
      icon: AlertTriangle,
      color: summary.failedProjects > 0 ? "text-rose-400" : "text-slate-400",
      bg: summary.failedProjects > 0 ? "bg-rose-950/40 border-rose-800/40" : "bg-slate-900 border-slate-800",
    },
    {
      label: "Paused Monitoring",
      value: summary.pausedProjects,
      desc: "Paused by owner",
      icon: PauseCircle,
      color: "text-slate-400",
      bg: "bg-slate-900/60 border-slate-800",
    },
    {
      label: "24h Executions",
      value: summary.executions24h,
      desc: "Autonomous runs",
      icon: Activity,
      color: "text-teal-400",
      bg: "bg-teal-950/40 border-teal-800/40",
    },
    {
      label: "24h Success Rate",
      value: `${summary.successRate24h}%`,
      desc: summary.averageLatencyMs > 0 ? `Avg latency: ${summary.averageLatencyMs}ms` : "Live heartbeat metrics",
      icon: Zap,
      color: summary.successRate24h >= 95 ? "text-emerald-400" : "text-amber-400",
      bg: summary.successRate24h >= 95 ? "bg-emerald-950/40 border-emerald-800/40" : "bg-amber-950/40 border-amber-800/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4 border-slate-800 bg-slate-900/70 hover:border-slate-700/80 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{stat.label}</span>
              <div className={`p-1.5 rounded-lg border ${stat.bg} ${stat.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-bold tracking-tight text-slate-100">{stat.value}</span>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{stat.desc}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
