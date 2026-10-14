import { ProjectStatus, ExecutionStatus } from "@/types";

export const WAKEHARBOR_SQL_SCRIPT = `CREATE OR REPLACE FUNCTION public.wakeharbor_heartbeat()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'ok', true,
    'server_time', now()
  );
$$;

REVOKE ALL
ON FUNCTION public.wakeharbor_heartbeat()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.wakeharbor_heartbeat()
TO anon;`;

export const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; bg: string; border: string; dot: string; description: string }
> = {
  HEALTHY: {
    label: "Healthy",
    color: "text-emerald-400",
    bg: "bg-emerald-950/40",
    border: "border-emerald-800/50",
    dot: "bg-emerald-500",
    description: "Database RPC heartbeat verified and executing normally.",
  },
  PENDING_VERIFICATION: {
    label: "Pending Verification",
    color: "text-amber-400",
    bg: "bg-amber-950/40",
    border: "border-amber-800/50",
    dot: "bg-amber-500",
    description: "Project registered; initial verification heartbeat pending.",
  },
  DEGRADED: {
    label: "Degraded",
    color: "text-amber-400",
    bg: "bg-amber-950/40",
    border: "border-amber-800/50",
    dot: "bg-amber-500",
    description: "Experienced transient failure or high response latency.",
  },
  CONNECTION_FAILED: {
    label: "Connection Failed",
    color: "text-rose-400",
    bg: "bg-rose-950/40",
    border: "border-rose-800/50",
    dot: "bg-rose-500",
    description: "Unable to reach database endpoint after repeated attempts.",
  },
  AUTHENTICATION_ERROR: {
    label: "Authentication Error",
    color: "text-rose-400",
    bg: "bg-rose-950/40",
    border: "border-rose-800/50",
    dot: "bg-rose-500",
    description: "Publishable API key was rejected or lacks execute permission.",
  },
  PAUSED_BY_USER: {
    label: "Monitoring Paused",
    color: "text-slate-400",
    bg: "bg-slate-900/60",
    border: "border-slate-800",
    dot: "bg-slate-500",
    description: "Heartbeat scheduling has been paused by the project owner.",
  },
  SUPABASE_PAUSED_CONFIRMED: {
    label: "Supabase Paused",
    color: "text-purple-400",
    bg: "bg-purple-950/40",
    border: "border-purple-800/50",
    dot: "bg-purple-500",
    description: "Confirmed paused project response from provider gateway.",
  },
  SUPABASE_PAUSED_SUSPECTED: {
    label: "Suspected Paused",
    color: "text-purple-400",
    bg: "bg-purple-950/40",
    border: "border-purple-800/50",
    dot: "bg-purple-500",
    description: "Provider gateway returned 5xx / 52x gateway errors.",
  },
  NOT_CONFIGURED: {
    label: "Not Configured",
    color: "text-slate-400",
    bg: "bg-slate-900/60",
    border: "border-slate-800",
    dot: "bg-slate-500",
    description: "Project setup incomplete or credentials missing.",
  },
  UNKNOWN: {
    label: "Unknown",
    color: "text-slate-400",
    bg: "bg-slate-900/60",
    border: "border-slate-800",
    dot: "bg-slate-500",
    description: "Operational status could not be determined.",
  },
};

export const EXECUTION_STATUS_CONFIG: Record<
  ExecutionStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  SUCCESS: { label: "Success", color: "text-emerald-400", bg: "bg-emerald-950/40", border: "border-emerald-800/40" },
  FAILURE: { label: "Failed", color: "text-rose-400", bg: "bg-rose-950/40", border: "border-rose-800/40" },
  TIMEOUT: { label: "Timed Out", color: "text-amber-400", bg: "bg-amber-950/40", border: "border-amber-800/40" },
  RATE_LIMITED: { label: "Rate Limited", color: "text-amber-400", bg: "bg-amber-950/40", border: "border-amber-800/40" },
  AUTH_ERROR: { label: "Auth Error", color: "text-rose-400", bg: "bg-rose-950/40", border: "border-rose-800/40" },
  PAUSED_CONFIRMED: { label: "Project Paused", color: "text-purple-400", bg: "bg-purple-950/40", border: "border-purple-800/40" },
  INVALID_RESPONSE: { label: "Invalid Payload", color: "text-amber-400", bg: "bg-amber-950/40", border: "border-amber-800/40" },
};

export const INTERVAL_PRESETS = [
  { hours: 6, label: "Every 6 Hours", desc: "High activity — recommended for frequently used dev databases" },
  { hours: 12, label: "Every 12 Hours (Recommended)", desc: "Optimal balance — keeps active safely under Supabase 7-day rule" },
  { hours: 24, label: "Every 24 Hours", desc: "Low traffic — minimal requests while sustaining daily activity" },
];
