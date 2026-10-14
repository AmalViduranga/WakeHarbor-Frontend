import React from "react";
import { Execution } from "@/types";
import { EXECUTION_STATUS_CONFIG } from "@/lib/constants";
import { formatTimeAgo } from "@/lib/utils";
import NextLink from "next/link";
import { Clock, ExternalLink } from "lucide-react";

interface RecentExecutionsTableProps {
  executions: Execution[];
}

export function RecentExecutionsTable({ executions }: RecentExecutionsTableProps) {
  if (executions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
        No background execution logs recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-2.5 px-3 font-medium">Project</th>
            <th className="py-2.5 px-3 font-medium">Status</th>
            <th className="py-2.5 px-3 font-medium">Type</th>
            <th className="py-2.5 px-3 font-medium">Latency</th>
            <th className="py-2.5 px-3 font-medium">HTTP Code</th>
            <th className="py-2.5 px-3 font-medium">Executed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {executions.map((e) => {
            const statusConfig = EXECUTION_STATUS_CONFIG[e.status] || {
              label: e.status,
              color: "text-slate-400",
              bg: "bg-slate-800",
              border: "border-slate-700",
            };

            return (
              <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-slate-100">
                  <NextLink
                    href={`/projects/${e.projectId}`}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>{e.projectName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({e.projectRef})</span>
                  </NextLink>
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                  >
                    {statusConfig.label}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{e.triggerType}</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-200">
                  {e.latencyMs !== null ? `${e.latencyMs} ms` : "—"}
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                  {e.httpStatusCode ? e.httpStatusCode : "—"}
                </td>
                <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1" title={e.executedAt}>
                    <Clock className="h-3 w-3 text-slate-400" />
                    {formatTimeAgo(e.executedAt)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
