"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { fetchApi } from "@/lib/api";
import { Execution, Project, ExecutionStatus, PageResponse } from "@/types";
import { EXECUTION_STATUS_CONFIG } from "@/lib/constants";
import { formatDateTime, formatTimeAgo } from "@/lib/utils";
import NextLink from "next/link";
import {
  History,
  Filter,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Code2,
} from "lucide-react";

export default function HistoryPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inspectExecution, setInspectExecution] = useState<Execution | null>(null);

  const loadData = async (page = 0) => {
    setLoading(true);
    try {
      let endpoint = `/api/v1/executions?page=${page}&size=20`;
      if (selectedProjectId) endpoint += `&projectId=${selectedProjectId}`;
      if (selectedStatus) endpoint += `&status=${selectedStatus}`;

      const [execRes, projRes] = await Promise.all([
        fetchApi<PageResponse<Execution>>(endpoint),
        fetchApi<PageResponse<Project>>("/api/v1/projects?size=100"),
      ]);

      setExecutions(execRes.content);
      setCurrentPage(execRes.page);
      setTotalPages(execRes.totalPages);
      setTotalElements(execRes.totalElements);
      setProjects(projRes.content);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(0);
  }, [selectedProjectId, selectedStatus]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <History className="h-6 w-6 text-emerald-400" />
              <span>Activity History</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Searchable, immutable execution trail of background database heartbeats.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => loadData(currentPage)}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            <span>Refresh Logs</span>
          </Button>
        </div>

        {/* Filter Toolbar */}
        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-1/3">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Filter by Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-300 py-2 px-3 focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.projectRef})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-1/3">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Filter by Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-300 py-2 px-3 focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Execution Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILURE">Failure</option>
                <option value="TIMEOUT">Timeout</option>
                <option value="RATE_LIMITED">Rate Limited</option>
                <option value="AUTH_ERROR">Authentication Error</option>
                <option value="PAUSED_CONFIRMED">Project Paused</option>
                <option value="INVALID_RESPONSE">Invalid Response Payload</option>
              </select>
            </div>

            <div className="w-full sm:w-auto sm:ml-auto self-end">
              <span className="text-xs text-slate-400 font-mono">
                Total executions: <strong className="text-slate-200">{totalElements}</strong>
              </span>
            </div>
          </div>
        </Card>

        {/* History Table */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
                Loading execution history records...
              </div>
            ) : executions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-medium">Project</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium">Trigger</th>
                      <th className="py-3 px-4 font-medium">Latency</th>
                      <th className="py-3 px-4 font-medium">HTTP Code</th>
                      <th className="py-3 px-4 font-medium">Executed At</th>
                      <th className="py-3 px-4 font-medium text-right">Diagnostic</th>
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
                        <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-200">
                            <NextLink
                              href={`/projects/${e.projectId}`}
                              className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                            >
                              <span>{e.projectName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({e.projectRef})</span>
                            </NextLink>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                            >
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{e.triggerType}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-200">
                            {e.latencyMs !== null ? `${e.latencyMs} ms` : "—"}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                            {e.httpStatusCode || "—"}
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {formatDateTime(e.executedAt)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInspectExecution(e)}
                              className="text-[11px] text-slate-400 hover:text-slate-200"
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500">
                No execution logs found matching the selected filter.
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-800 text-xs">
                <span className="text-slate-400">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => loadData(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage + 1 >= totalPages}
                    onClick={() => loadData(currentPage + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diagnostic Inspection Modal */}
        {inspectExecution && (
          <Modal
            isOpen={true}
            onClose={() => setInspectExecution(null)}
            title="Heartbeat Execution Diagnostic"
            description={`Log ID: ${inspectExecution.id}`}
            maxWidth="lg"
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Project:</span>
                  <span className="font-semibold text-slate-200">{inspectExecution.projectName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status:</span>
                  <span className="font-semibold text-emerald-400">{inspectExecution.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">HTTP Status:</span>
                  <span className="font-mono text-slate-200">{inspectExecution.httpStatusCode || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Roundtrip Latency:</span>
                  <span className="font-mono text-slate-200">{inspectExecution.latencyMs} ms</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Trigger:</span>
                  <span className="font-mono text-slate-200">{inspectExecution.triggerType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Executed At:</span>
                  <span className="text-slate-200">{formatDateTime(inspectExecution.executedAt)}</span>
                </div>
              </div>

              {inspectExecution.errorCategory && (
                <div className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-lg text-rose-300 space-y-1">
                  <span className="font-semibold block">Error Category: {inspectExecution.errorCategory}</span>
                  <p>{inspectExecution.errorDetails}</p>
                </div>
              )}

              {inspectExecution.responsePayloadSummary && (
                <div className="space-y-1.5">
                  <span className="text-slate-400 block font-medium">Response Payload Summary:</span>
                  <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300/90 overflow-x-auto">
                    {inspectExecution.responsePayloadSummary}
                  </pre>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <Button variant="secondary" size="sm" onClick={() => setInspectExecution(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
