"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { WAKEHARBOR_SQL_SCRIPT, INTERVAL_PRESETS } from "@/lib/constants";
import { fetchApi } from "@/lib/api";
import { ValidateCredentialsResponse, Project } from "@/types";
import {
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  Key,
  Code2,
  Terminal,
  Zap,
  Calendar,
  Sparkles,
  ShieldAlert,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export function AddProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form state
  const [name, setName] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [intervalHours, setIntervalHours] = useState(12);
  const [notes, setNotes] = useState("");

  // Validation & live test state
  const [copiedSql, setCopiedSql] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ValidateCredentialsResponse | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(WAKEHARBOR_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleLiveTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setFormError(null);

    try {
      const res = await fetchApi<ValidateCredentialsResponse>("/api/v1/projects/validate-credentials", {
        method: "POST",
        body: JSON.stringify({
          supabaseUrl: supabaseUrl.trim(),
          publishableKey: publishableKey.trim(),
        }),
      });
      setTestResult(res);
    } catch (err: any) {
      setFormError(err.message || "Failed to reach backend test service");
    } finally {
      setIsTesting(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const created = await fetchApi<Project>("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          supabaseUrl: supabaseUrl.trim(),
          publishableKey: publishableKey.trim(),
          intervalHours,
          notes: notes.trim() || undefined,
        }),
      });

      router.push(`/projects/${created.id}`);
    } catch (err: any) {
      setFormError(err.message || "Failed to register project");
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setFormError(null);
    if (step === 1) {
      if (!name.trim()) {
        setFormError("Please enter a descriptive project name");
        return;
      }
      if (!supabaseUrl.trim() || !supabaseUrl.toLowerCase().includes(".supabase.co")) {
        setFormError("Please enter a valid Supabase URL matching https://<ref>.supabase.co");
        return;
      }
    }
    if (step === 2) {
      if (!publishableKey.trim()) {
        setFormError("Please provide your publishable API key");
        return;
      }
    }
    if (step === 5) {
      if (!testResult || !testResult.valid) {
        setFormError("Please verify your heartbeat connection successfully before activating");
        return;
      }
    }
    setStep((prev) => Math.min(7, prev + 1));
  };

  const prevStep = () => {
    setFormError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const stepTitles = [
    "Project Information",
    "Publishable API Key",
    "SQL Heartbeat Function",
    "Deploy to Supabase",
    "Verify Heartbeat",
    "Monitoring Schedule",
    "Review & Activate",
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Progress Stepper */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>STEP {step} OF 7</span>
          <span className="text-emerald-400 font-semibold">{stepTitles[step - 1]}</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={`h-full rounded-full transition-all duration-300 ${
                s <= step ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>

      <Card className="border-slate-800 shadow-xl bg-slate-900/80">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
            <span>{stepTitles[step - 1]}</span>
          </CardTitle>
          <CardDescription>
            {step === 1 && "Specify your internal project identifier and official Supabase project URL."}
            {step === 2 && "Enter your project's client-safe publishable key. Never enter database passwords."}
            {step === 3 && "Copy the safe, read-only SQL function that WakeHarbor invokes for heartbeat monitoring."}
            {step === 4 && "Paste and execute the function inside your Supabase project's SQL Editor."}
            {step === 5 && "Execute a live database test to ensure the RPC function is reachable and functional."}
            {step === 6 && "Select how frequently WakeHarbor should send background heartbeats to your database."}
            {step === 7 && "Confirm your settings and start autonomous background heartbeat monitoring."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {formError && (
            <div className="flex items-start gap-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* STEP 1: Name & URL */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Project Display Name"
                placeholder="e.g. My Next.js Blog Database"
                value={name}
                onChange={(e) => setName(e.target.value)}
                helperText="An identifiable name to display in your WakeHarbor dashboard."
                autoFocus
              />

              <Input
                label="Supabase Project URL"
                placeholder="https://xyzprojectref.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                helperText="Your project URL from Supabase Project Settings > API. Must end in .supabase.co"
              />

              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-300">Where to find your URL:</p>
                <p>
                  In your Supabase dashboard, navigate to <strong>Project Settings</strong> &rarr; <strong>API</strong> &rarr; <strong>Project URL</strong>.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Publishable API Key */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-emerald-950/30 border border-emerald-800/40 p-3 text-xs text-emerald-300 flex items-start gap-2.5">
                <Key className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <strong className="block text-emerald-200">Security Guarantee:</strong>
                  WakeHarbor operates exclusively using non-privileged publishable keys (<code className="font-mono bg-emerald-900/40 px-1 py-0.5 rounded">sb_publishable_...</code> or legacy anon keys).
                  We never request or store database master passwords, service-role keys, or secret tokens.
                </div>
              </div>

              <Input
                label="Publishable API Key"
                type="password"
                placeholder="sb_publishable_..."
                value={publishableKey}
                onChange={(e) => setPublishableKey(e.target.value)}
                helperText="Found in Supabase Project Settings > API > Project API keys"
                autoFocus
              />

              <div className="text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Publishable Key vs Service-Role:</p>
                <p>
                  Publishable keys only have access to endpoints granted to <code className="font-mono bg-slate-800 px-1 py-0.5 rounded">anon</code>.
                  Your key is immediately encrypted at rest using AES-256-GCM.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Generated SQL */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Read-only SQL function definition:</span>
                <Button
                  size="sm"
                  variant={copiedSql ? "primary" : "secondary"}
                  onClick={handleCopySql}
                  type="button"
                >
                  {copiedSql ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSql ? "Copied SQL!" : "Copy SQL Script"}</span>
                </Button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300/90 overflow-x-auto selection:bg-emerald-500/30 leading-relaxed">
                  {WAKEHARBOR_SQL_SCRIPT}
                </pre>
              </div>

              <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Why this function is safe:</p>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  <li>Marked <code className="text-slate-200">STABLE</code> &amp; <code className="text-slate-200">SECURITY INVOKER</code>: cannot modify your tables or data.</li>
                  <li>Explicitly sets <code className="text-slate-200">search_path = &#39;&#39;</code>: immune to search path hijacking.</li>
                  <li>Returns only a simple server timestamp and status payload.</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 4: Deploy Instructions */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                    1
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-slate-200">Open your Supabase SQL Editor</p>
                    <p className="text-slate-400">
                      In the left sidebar of your Supabase dashboard, click on the <strong>SQL Editor</strong> icon.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                    2
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-slate-200">Create a New Query &amp; Paste</p>
                    <p className="text-slate-400">
                      Click <strong>New query</strong>, paste the copied SQL from Step 3 into the editor window.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                    3
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-slate-200">Run the Query</p>
                    <p className="text-slate-400">
                      Click the green <strong>Run</strong> button. You should see <em>Success. No rows returned</em>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button size="sm" variant="outline" onClick={handleCopySql} type="button">
                  {copiedSql ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSql ? "Copied SQL to clipboard!" : "Copy SQL again if needed"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Live Test */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                WakeHarbor will now execute a real, safe POST request to your Supabase RPC endpoint:
              </p>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-400 truncate">
                POST {supabaseUrl}/rest/v1/rpc/wakeharbor_heartbeat
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleLiveTest}
                  isLoading={isTesting}
                  type="button"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Execute Live Connection Test
                </Button>
              </div>

              {testResult && (
                <div
                  className={`p-4 rounded-xl border ${
                    testResult.valid
                      ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-200"
                      : "bg-rose-950/30 border-rose-800/60 text-rose-200"
                  } space-y-2 text-xs`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5">
                      {testResult.valid ? <Check className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-rose-400" />}
                      {testResult.valid ? "Database Connection Verified!" : "Verification Failed"}
                    </span>
                    {testResult.latencyMs !== null && (
                      <span className="font-mono text-[11px] opacity-80">{testResult.latencyMs} ms</span>
                    )}
                  </div>
                  <p className="text-slate-300">{testResult.message}</p>
                  {testResult.payloadSummary && (
                    <pre className="p-2 rounded bg-slate-950/80 font-mono text-[11px] text-slate-400 overflow-x-auto">
                      {testResult.payloadSummary}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Schedule */}
          {step === 6 && (
            <div className="space-y-4">
              <label className="block text-xs font-medium text-slate-300">
                Choose Scheduled Monitoring Frequency:
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                {INTERVAL_PRESETS.map((p) => {
                  const isSelected = intervalHours === p.hours;
                  return (
                    <div
                      key={p.hours}
                      onClick={() => setIntervalHours(p.hours)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-emerald-950/30 border-emerald-500 shadow-sm shadow-emerald-950/50"
                          : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100">{p.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <Input
                  label="Optional Notes / Description"
                  placeholder="e.g. Staging project for client demo"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 7: Review & Activate */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Project Name:</span>
                  <span className="font-semibold text-slate-200">{name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Supabase Endpoint:</span>
                  <span className="font-mono text-emerald-400">{supabaseUrl}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Heartbeat Interval:</span>
                  <span className="text-slate-200">Every {intervalHours} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Security & Encryption:</span>
                  <span className="text-emerald-400 font-semibold">AES-256-GCM Encrypted</span>
                </div>
              </div>

              <DisclaimerBanner />
            </div>
          )}
        </CardContent>

        <div className="flex items-center justify-between p-5 border-t border-slate-800/80 bg-slate-950/40 rounded-b-xl">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1 || isSubmitting}
            type="button"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          {step < 7 ? (
            <Button variant="primary" onClick={nextStep} type="button">
              Next Step
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              type="button"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Activate Autonomous Monitoring
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
