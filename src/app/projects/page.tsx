"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { RunNowButton } from "@/components/projects/RunNowButton";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { fetchApi } from "@/lib/api";
import { Project, ProjectStatus, PageResponse } from "@/types";
import { formatTimeAgo, formatDateTime } from "@/lib/utils";
import NextLink from "next/link";
import {
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Clock,
  ExternalLink,
  RotateCw,
  Database,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      let endpoint = "/api/v1/projects?size=50";
      if (search.trim()) endpoint += `&search=${encodeURIComponent(search.trim())}`;
      if (statusFilter) endpoint += `&status=${statusFilter}`;

      const res = await fetchApi<PageResponse<Project>>(endpoint);
      setProjects(res.content);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProjects();
  };

  const handlePauseResume = async (project: Project) => {
    setActionLoading(project.id);
    const action = project.enabled ? "pause" : "resume";
    try {
      await fetchApi(`/api/v1/projects/${project.id}/${action}`, { method: "POST" });
      await loadProjects();
    } catch (err) {
      console.error("Failed to toggle project state", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Database className="h-6 w-6 text-emerald-400" />
              <span>Supabase Projects</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage configured projects, monitoring frequencies, and heartbeat verification states.
            </p>
          </div>

          <NextLink href="/projects/new">
            <Button variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Connect New Project</span>
            </Button>
          </NextLink>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects by name or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/80"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-300 py-2 px-3 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Health Statuses</option>
              <option value="HEALTHY">Healthy</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="DEGRADED">Degraded</option>
              <option value="CONNECTION_FAILED">Connection Failed</option>
              <option value="AUTHENTICATION_ERROR">Authentication Error</option>
              <option value="PAUSED_BY_USER">Paused By User</option>
              <option value="SUPABASE_PAUSED_CONFIRMED">Supabase Paused</option>
            </select>
          </div>
        </div>

        {/* Projects Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-slate-900/60 rounded-xl border border-slate-800" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Card
                key={p.id}
                className="border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="overflow-hidden">
                      <NextLink
                        href={`/projects/${p.id}`}
                        className="text-sm font-bold text-slate-100 hover:text-emerald-400 transition-colors truncate block"
                      >
                        {p.name}
                      </NextLink>
                      <span className="font-mono text-[11px] text-slate-400 block truncate">
                        {p.projectRef}.supabase.co
                      </span>
                    </div>
                    <ProjectStatusBadge status={p.status} />
                  </div>

                  {/* Metadata items */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Frequency:</span>
                      <span className="text-slate-200 font-medium">Every {p.intervalHours}h</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Latency:</span>
                      <span className="text-slate-200 font-mono">
                        {p.lastLatencyMs !== null ? `${p.lastLatencyMs} ms` : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Last Run:</span>
                      <span className="text-slate-200" title={p.lastAttemptedAt || ""}>
                        {formatTimeAgo(p.lastAttemptedAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Next Run:</span>
                      <span className="text-emerald-400 font-mono">
                        {p.nextRunAt ? new Date(p.nextRunAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                    </div>
                  </div>

                  {p.lastErrorMessage && p.status !== "HEALTHY" && (
                    <div className="p-2 rounded bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-300 truncate">
                      {p.lastErrorMessage}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <NextLink
                    href={`/projects/${p.id}`}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="h-3 w-3" />
                  </NextLink>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePauseResume(p)}
                      isLoading={actionLoading === p.id}
                      title={p.enabled ? "Pause scheduled runs" : "Resume scheduled runs"}
                    >
                      {p.enabled ? (
                        <>
                          <Pause className="h-3 w-3 mr-1 text-slate-400" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1 text-emerald-400" />
                          <span>Resume</span>
                        </>
                      )}
                    </Button>

                    <RunNowButton
                      projectId={p.id}
                      onExecuted={() => loadProjects()}
                      size="sm"
                      variant="secondary"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">No projects found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {search || statusFilter
                  ? "No Supabase projects match your search criteria. Try resetting your filter."
                  : "Connect your first Supabase project to schedule automatic database heartbeats."}
              </p>
            </div>
            <NextLink href="/projects/new">
              <Button variant="primary" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Connect Supabase Project</span>
              </Button>
            </NextLink>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
