"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { WAKEHARBOR_SQL_SCRIPT } from "@/lib/constants";
import {
  BookOpen,
  Copy,
  Check,
  ShieldCheck,
  HelpCircle,
  Database,
  Code2,
  Terminal,
  AlertTriangle,
} from "lucide-react";

export default function DocsPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WAKEHARBOR_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const troubleshootingItems = [
    {
      category: "FUNCTION_NOT_FOUND (HTTP 404 / PGRST202)",
      cause: "The SQL function wakeharbor_heartbeat() has not been created in the public schema.",
      solution: "Open your Supabase SQL Editor, paste the SQL function below, and click Run. Ensure the schema is public.",
    },
    {
      category: "PERMISSION_DENIED (HTTP 403)",
      cause: "The anon role does not have execute permission on the SQL function.",
      solution: "Run 'GRANT EXECUTE ON FUNCTION public.wakeharbor_heartbeat() TO anon;' in your Supabase SQL Editor.",
    },
    {
      category: "AUTHENTICATION_FAILED (HTTP 401 / PGRST301)",
      cause: "The publishable API key is invalid, truncated, or belongs to a different Supabase project.",
      solution: "Navigate to Project Settings > API in Supabase. Copy the Publishable API key and use 'Rotate Key' in WakeHarbor.",
    },
    {
      category: "RATE_LIMITED (HTTP 429)",
      cause: "Supabase or an intermediate gateway throttled incoming requests due to high request volume.",
      solution: "WakeHarbor automatically applies exponential backoff. Increase monitoring interval to 12 or 24 hours.",
    },
    {
      category: "PROJECT_PAUSED (HTTP 503 / 521 / 524)",
      cause: "Supabase has paused the project due to previous dormancy or maintenance.",
      solution: "Log in to the Supabase web dashboard and click 'Restore project'. Once active, WakeHarbor will resume healthy heartbeats.",
    },
    {
      category: "SSRF_REJECTED (HTTP 400)",
      cause: "Target URL does not match a verified *.supabase.co host, uses non-standard ports, or points to private IP space.",
      solution: "Ensure your project URL strictly follows the format 'https://<project-ref>.supabase.co'.",
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="pb-2 border-b border-slate-800">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-400" />
            <span>Integration Guide &amp; Technical Reference</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Learn how WakeHarbor communicates with Supabase, security guarantees, and troubleshooting solutions.
          </p>
        </div>

        <DisclaimerBanner />

        {/* Section 1: How it Works */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-sm">How WakeHarbor Works</CardTitle>
            <CardDescription className="text-xs">
              Lightweight read-only database activity via PostgreSQL Remote Procedure Calls (RPC)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              Supabase Free Plan projects require user database activity over a 7-day rolling window to remain active.
              WakeHarbor creates scheduled, lightweight database transactions by invoking an isolated SQL function through
              the standard PostgREST RPC interface:
            </p>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300">
              POST https://&lt;project-ref&gt;.supabase.co/rest/v1/rpc/wakeharbor_heartbeat
            </div>

            <p>
              When the PostgREST gateway receives this request, it opens a real transaction with PostgreSQL, executes the
              function, and returns the current server timestamp. This produces genuine database query activity without
              modifying tables or incurring heavy CPU usage.
            </p>
          </CardContent>
        </Card>

        {/* Section 2: SQL Function */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Safe Heartbeat SQL Function</CardTitle>
                <CardDescription className="text-xs">Copy and execute once in your Supabase SQL Editor</CardDescription>
              </div>
              <Button size="sm" variant={copied ? "primary" : "secondary"} onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied!" : "Copy SQL"}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
              {WAKEHARBOR_SQL_SCRIPT}
            </pre>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-200">1. STABLE &amp; Read-Only</span>
                <p className="text-slate-400">Guarantees zero write operations against your database tables or sequences.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-200">2. SECURITY INVOKER</span>
                <p className="text-slate-400">Runs under the limited privileges of the anon role with empty search path.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-200">3. Non-Privileged</span>
                <p className="text-slate-400">No service-role keys or database superuser passwords ever required.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Troubleshooting Guide */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-sm">Troubleshooting Matrix</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Diagnostic explanations and remediation steps for observed error categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {troubleshootingItems.map((item) => (
              <div
                key={item.category}
                className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="font-bold text-slate-200">{item.category}</span>
                </div>
                <p className="text-slate-400 pl-5.5">
                  <strong className="text-slate-300">Cause:</strong> {item.cause}
                </p>
                <p className="text-emerald-400/90 pl-5.5">
                  <strong className="text-slate-300">Remediation:</strong> {item.solution}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
