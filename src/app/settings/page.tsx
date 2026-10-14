"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { fetchApi } from "@/lib/api";
import { WorkerNode } from "@/types";
import { formatTimeAgo, formatDateTime } from "@/lib/utils";
import {
  Settings,
  ShieldCheck,
  Server,
  Lock,
  Moon,
  Sun,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Worker nodes
  const [workers, setWorkers] = useState<WorkerNode[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  const loadWorkers = async () => {
    try {
      const data = await fetchApi<WorkerNode[]>("/api/v1/settings/workers");
      setWorkers(data);
    } catch (err) {
      console.error("Failed to load worker nodes", err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  useEffect(() => {
    loadWorkers();
    const interval = setInterval(loadWorkers, 15000);
    return () => clearInterval(interval);
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      await fetchApi("/api/v1/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-2 border-b border-slate-800">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-400" />
            <span>Application Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administrator credentials, interface preferences, and background worker telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security & Password */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-sm">Administrator Security</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Update credentials for administrator account: {user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-3.5">
                {passwordError && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{passwordError}</span>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>Password updated successfully!</span>
                  </div>
                )}

                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <Button variant="primary" size="sm" type="submit" isLoading={passwordLoading}>
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Interface & Preferences */}
          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-sm">Appearance &amp; Theme</CardTitle>
                <CardDescription className="text-xs">
                  Customize the interface theme for infrastructure monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                      {theme === "dark" ? (
                        <Moon className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Sun className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        {theme === "dark" ? "Dark Theme (Active)" : "Light Theme"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {theme === "dark" ? "Dark mode optimized for OLED and developer setups" : "Light background mode"}
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={toggleTheme}>
                    Toggle Theme
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-sm">Data Retention &amp; Pruning</CardTitle>
                <CardDescription className="text-xs">
                  Automated maintenance policies for execution logs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Execution Log Retention:</span>
                  <span className="font-mono text-emerald-400 font-semibold">30 Days</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Pruning Schedule:</span>
                  <span className="font-mono text-slate-200">Daily at 02:00 AM UTC</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Worker Telemetry Section */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-sm">Heartbeat Worker Nodes Telemetry</CardTitle>
              </div>
              <span className="text-xs font-mono text-emerald-400">AUTO-REFRESHING</span>
            </div>
            <CardDescription className="text-xs">
              Autonomous background processes executing Supabase RPC heartbeats and reporting liveness signals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingWorkers ? (
              <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading worker telemetry...</div>
            ) : workers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">Worker ID</th>
                      <th className="py-2.5 px-3 font-medium">Hostname</th>
                      <th className="py-2.5 px-3 font-medium">Status</th>
                      <th className="py-2.5 px-3 font-medium">Current Concurrency</th>
                      <th className="py-2.5 px-3 font-medium">Completed Jobs</th>
                      <th className="py-2.5 px-3 font-medium">Failed Jobs</th>
                      <th className="py-2.5 px-3 font-medium">Last Health Signal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {workers.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-100">{w.workerId}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{w.hostname || "localhost"}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              w.status === "ONLINE"
                                ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                                : "bg-rose-950/60 text-rose-400 border-rose-800"
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-200">{w.currentLoad}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400">{w.completedJobsCount}</td>
                        <td className="py-2.5 px-3 font-mono text-rose-400">{w.failedJobsCount}</td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {formatTimeAgo(w.lastHeartbeatAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                No active heartbeat workers currently reporting. Start the heartbeat-worker process to begin autonomous execution.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
