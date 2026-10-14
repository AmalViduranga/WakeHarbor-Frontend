"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCards } from "@/components/dashboard/StatCards";
import { HealthTrendChart } from "@/components/dashboard/HealthTrendChart";
import { RecentExecutionsTable } from "@/components/dashboard/RecentExecutionsTable";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fetchApi } from "@/lib/api";
import { DashboardSummary } from "@/types";
import NextLink from "next/link";
import { Plus, RefreshCw, Calendar, ArrowRight, Activity, Database } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = async () => {
    try {
      const data = await fetchApi<DashboardSummary>("/api/v1/dashboard/summary");
      setSummary(data);
    } catch (err) {
      console.error("Failed to load dashboard summary", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSummary();
    const interval = setInterval(loadSummary, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSummary();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Overview</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous heartbeat scheduling, response latency, and Supabase connection health.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={refreshing}
              title="Refresh live metrics"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              <span>Refresh</span>
            </Button>

            <NextLink href="/projects/new">
              <Button variant="primary" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Connect Project</span>
              </Button>
            </NextLink>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <DisclaimerBanner />

        {/* KPI Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-slate-900/60 rounded-xl border border-slate-800" />
            ))}
          </div>
        ) : summary ? (
          <StatCards summary={summary} />
        ) : null}

        {/* Latency Trend Chart & Upcoming Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {summary && <HealthTrendChart executions={summary.recentExecutions} />}
          </div>

          <div>
            <Card className="h-full border-slate-800 bg-slate-900/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <CardTitle className="text-sm">Upcoming Scheduled Runs</CardTitle>
                  </div>
                  <NextLink
                    href="/history"
                    className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ArrowRight className="h-3 w-3" />
                  </NextLink>
                </div>
                <CardDescription className="text-xs">
                  Autonomous background jobs queued in PostgreSQL
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary && summary.upcomingJobs.length > 0 ? (
                  <div className="space-y-2.5">
                    {summary.upcomingJobs.map((job) => (
                      <div
                        key={job.jobId}
                        className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="overflow-hidden">
                          <p className="font-semibold text-slate-200 truncate">{job.projectName}</p>
                          <span className="font-mono text-[10px] text-slate-400">{job.projectRef}</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400 shrink-0">
                          {new Date(job.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                    No pending scheduled jobs. Connect a project to begin autonomous monitoring.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Executions Section */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-sm">Recent Heartbeat Outcomes</CardTitle>
              </div>
              <NextLink
                href="/history"
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-medium"
              >
                <span>Full execution log</span>
                <ArrowRight className="h-3 w-3" />
              </NextLink>
            </div>
            <CardDescription className="text-xs">
              Live audit trail of database function executions performed by the heartbeat worker
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary && <RecentExecutionsTable executions={summary.recentExecutions} />}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
