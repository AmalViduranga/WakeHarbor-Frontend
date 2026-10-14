"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { RunNowButton } from "@/components/projects/RunNowButton";
import { RotateKeyModal } from "@/components/projects/RotateKeyModal";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { fetchApi } from "@/lib/api";
import { Project, Execution, PageResponse } from "@/types";
import { formatTimeAgo, formatDateTime } from "@/lib/utils";
import { EXECUTION_STATUS_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import NextLink from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  KeyRound,
  Play,
  Pause,
  Trash2,
  Clock,
  Zap,
  Activity,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "";
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [rotateModalOpen, setRotateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingState, setIsTogglingState] = useState(false);

  const loadProjectData = async () => {
    try {
      const [projData, execData] = await Promise.all([
        fetchApi<Project>(`/api/v1/projects/${projectId}`),
        fetchApi<PageResponse<Execution>>(`/api/v1/projects/${projectId}/executions?size=15`),
      ]);
      setProject(projData);
      setExecutions(execData.content);
    } catch (err) {
      console.error("Failed to load project details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const handlePauseResume = async () => {
    if (!project) return;
    setIsTogglingState(true);
    const action = project.enabled ? "pause" : "resume";
    try {
      await fetchApi(`/api/v1/projects/${project.id}/${action}`, { method: "POST" });
      await loadProjectData();
    } catch (err) {
      console.error("Failed to toggle state", err);
    } finally {
      setIsTogglingState(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await fetchApi(`/api/v1/projects/${projectId}`, { method: "DELETE" });
      router.push("/projects");
    } catch (err) {
      console.error("Failed to delete project", err);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-slate-800 rounded-lg" />
          <div className="h-44 bg-slate-900 rounded-xl" />
          <div className="h-64 bg-slate-900 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-16 space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-100">Project Not Found</h2>
          <NextLink href="/projects">
            <Button variant="secondary" size="sm">Back to Projects</Button>
          </NextLink>
        </div>
      </AppLayout>
    );
  }

  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.UNKNOWN;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <NextLink
              href="/projects"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </NextLink>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">{project.name}</h1>
                <ProjectStatusBadge status={project.status} />
              </div>
              <p className="font-mono text-xs text-slate-400 mt-0.5">{project.projectRef}.supabase.co</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePauseResume}
              isLoading={isTogglingState}
            >
              {project.enabled ? (
                <>
                  <Pause className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                  <span>Resume</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotateModalOpen(true)}
            >
              <KeyRound className="h-3.5 w-3.5 mr-1 text-slate-400" />
              <span>Rotate Key</span>
            </Button>

            <RunNowButton
              projectId={project.id}
              onExecuted={() => loadProjectData()}
              size="sm"
              variant="primary"
            />

            <Button
              variant="ghost"
              size="sm"
              className="text-rose-400 hover:bg-rose-950/40"
              onClick={() => setDeleteModalOpen(true)}
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <DisclaimerBanner />

        {/* Overview Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs text-slate-400 font-medium">Monitoring Interval</span>
            <p className="text-xl font-bold text-slate-100 mt-1">Every {project.intervalHours} hours</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Scheduled in PostgreSQL</span>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs text-slate-400 font-medium">Last Response Latency</span>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {project.lastLatencyMs !== null ? `${project.lastLatencyMs} ms` : "—"}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {project.lastAttemptedAt ? formatTimeAgo(project.lastAttemptedAt) : "Never attempted"}
            </span>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs text-slate-400 font-medium">Next Scheduled Run</span>
            <p className="text-xl font-bold text-slate-100 mt-1">
              {project.nextRunAt ? new Date(project.nextRunAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {project.nextRunAt ? formatDateTime(project.nextRunAt) : "Monitoring inactive"}
            </span>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs text-slate-400 font-medium">Consecutive Failures</span>
            <p className={`text-xl font-bold mt-1 ${project.consecutiveFailures > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {project.consecutiveFailures}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {project.consecutiveFailures === 0 ? "Normal operation" : "Failures exceeding alert threshold"}
            </span>
          </Card>
        </div>

        {/* Diagnostic Status Box if in degraded / error state */}
        {project.status !== "HEALTHY" && (
          <Card className="border-rose-900/50 bg-rose-950/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <span>Operational Diagnostic: {statusConfig.label}</span>
            </div>
            <p className="text-xs text-slate-300">
              {project.lastErrorMessage || statusConfig.description}
            </p>
            {project.lastErrorCategory && (
              <span className="inline-block text-[10px] font-mono bg-rose-900/40 text-rose-300 px-2 py-0.5 rounded border border-rose-800/60">
                CATEGORY: {project.lastErrorCategory}
              </span>
            )}
          </Card>
        )}

        {/* Configuration Information Card */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-sm">Connection Configuration</CardTitle>
            <CardDescription className="text-xs">Secure connection parameters and masked credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Supabase RPC Endpoint:</span>
                <span className="font-mono text-slate-200 break-all">
                  {project.supabaseUrl}/rest/v1/rpc/wakeharbor_heartbeat
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Encrypted Publishable Key:</span>
                <span className="font-mono text-emerald-400 font-semibold">{project.keyPreview}</span>
                <span className="text-[10px] text-slate-500 block">AES-256-GCM encrypted in database</span>
              </div>
            </div>

            {project.notes && (
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Project Notes:</span>
                <p className="text-slate-300">{project.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Execution History Table */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-sm">Heartbeat Execution History</CardTitle>
              </div>
              <span className="text-xs text-slate-400 font-mono">Last 15 executions</span>
            </div>
            <CardDescription className="text-xs">
              Chronological log of database RPC calls executed by the heartbeat worker
            </CardDescription>
          </CardHeader>
          <CardContent>
            {executions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">Status</th>
                      <th className="py-2.5 px-3 font-medium">Trigger</th>
                      <th className="py-2.5 px-3 font-medium">Latency</th>
                      <th className="py-2.5 px-3 font-medium">HTTP Code</th>
                      <th className="py-2.5 px-3 font-medium">Executed Time</th>
                      <th className="py-2.5 px-3 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {executions.map((e) => {
                      const cfg = EXECUTION_STATUS_CONFIG[e.status] || {
                        label: e.status,
                        color: "text-slate-400",
                        bg: "bg-slate-800",
                        border: "border-slate-700",
                      };
                      return (
                        <tr key={e.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                            >
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{e.triggerType}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-200">
                            {e.latencyMs !== null ? `${e.latencyMs} ms` : "—"}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                            {e.httpStatusCode || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                            {formatDateTime(e.executedAt)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                            {e.errorDetails || e.responsePayloadSummary || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                No executions recorded yet. Click <strong>Run Now</strong> above to trigger a test run.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rotate Key Modal */}
        <RotateKeyModal
          isOpen={rotateModalOpen}
          onClose={() => setRotateModalOpen(false)}
          projectId={project.id}
          projectName={project.name}
          onSuccess={() => loadProjectData()}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Supabase Project"
          description={`Are you sure you want to remove "${project.name}"?`}
        >
          <div className="space-y-4 text-xs text-slate-300">
            <p>
              This will permanently delete the project configuration, encrypted API credentials, scheduled job leases,
              and historical execution logs from WakeHarbor.
            </p>
            <p className="text-slate-400">
              Note: This action does not touch your actual Supabase database or remove the SQL function.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
                Yes, Delete Project
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
