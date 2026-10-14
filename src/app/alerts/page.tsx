"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { fetchApi } from "@/lib/api";
import { Alert, NotificationPreferences, PageResponse } from "@/types";
import { formatDateTime } from "@/lib/utils";
import {
  Bell,
  Mail,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ServerOff,
  Settings,
  Send,
  Info,
} from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);
  const [notifyOnRecovery, setNotifyOnRecovery] = useState(true);
  const [failureThreshold, setFailureThreshold] = useState(2);
  const [cooldownMinutes, setCooldownMinutes] = useState(60);

  const loadData = async () => {
    try {
      const [alertsRes, prefsRes] = await Promise.all([
        fetchApi<PageResponse<Alert>>("/api/v1/alerts?size=25"),
        fetchApi<NotificationPreferences>("/api/v1/alerts/preferences"),
      ]);
      setAlerts(alertsRes.content);
      setPrefs(prefsRes);

      setEmailEnabled(prefsRes.emailEnabled);
      setRecipientEmail(prefsRes.recipientEmail || "");
      setNotifyOnFailure(prefsRes.notifyOnFailure);
      setNotifyOnRecovery(prefsRes.notifyOnRecovery);
      setFailureThreshold(prefsRes.failureThreshold);
      setCooldownMinutes(prefsRes.cooldownMinutes);
    } catch (err) {
      console.error("Failed to load alerts data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    setSaveSuccess(false);

    try {
      const updated = await fetchApi<NotificationPreferences>("/api/v1/alerts/preferences", {
        method: "PUT",
        body: JSON.stringify({
          emailEnabled,
          recipientEmail: recipientEmail.trim(),
          notifyOnFailure,
          notifyOnRecovery,
          notifyOnWorkerOffline: true,
          failureThreshold,
          cooldownMinutes,
        }),
      });
      setPrefs(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update preferences", err);
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-emerald-400" />
              <span>Incident &amp; Recovery Alerts</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real incident events, failure notifications, and SMTP channel configuration.
            </p>
          </div>
        </div>

        {/* SMTP Status Notice */}
        {prefs && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
              prefs.smtpConfigured
                ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
                : "bg-slate-900 border-slate-800 text-slate-300"
            }`}
          >
            <Mail className={`h-4 w-4 shrink-0 mt-0.5 ${prefs.smtpConfigured ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="font-semibold block text-slate-100">
                SMTP Notification Channel Status:{" "}
                <span className={prefs.smtpConfigured ? "text-emerald-400" : "text-amber-400"}>
                  {prefs.smtpConfigured ? "Active & Configured" : "Disabled (External SMTP Not Configured)"}
                </span>
              </span>
              <p className="text-slate-400 mt-0.5">
                {prefs.smtpConfigured
                  ? "Outgoing alert emails will be dispatched to the recipient specified below when failure thresholds are breached."
                  : "All incident and recovery events are recorded and displayed in the audit log below. To enable external email dispatch, provide SMTP_HOST and credentials in your deployment environment."}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Alerts Feed (2 Cols) */}
          <div className="lg:col-span-2">
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-sm">Alert Event History</CardTitle>
                <CardDescription className="text-xs">
                  Generated incident and resolution signals across monitored projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading alerts...</div>
                ) : alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                            {alert.eventType === "FAILURE" ? (
                              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                            ) : alert.eventType === "RECOVERY" ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            ) : (
                              <ServerOff className="h-4 w-4 text-amber-400 shrink-0" />
                            )}
                            <span>{alert.subject}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {formatDateTime(alert.createdAt)}
                          </span>
                        </div>

                        <p className="text-slate-300 whitespace-pre-line leading-relaxed">{alert.content}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                          <span>Recipient: {alert.recipient}</span>
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                              alert.deliveryStatus === "SENT"
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800"
                                : alert.deliveryStatus === "SKIPPED_NO_SMTP"
                                ? "bg-slate-800 text-slate-400"
                                : "bg-rose-950 text-rose-400"
                            }`}
                          >
                            {alert.deliveryStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                    No alert events recorded. All projects are operating within normal parameters.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preferences Configuration (1 Col) */}
          <div>
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-emerald-400" />
                  <CardTitle className="text-sm">Notification Rules</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Alert thresholds, cooldown timers, and recipient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
                  <Input
                    label="Recipient Email Address"
                    type="email"
                    placeholder="admin@wakeharbor.local"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    helperText="Alert notifications will be sent to this address."
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="block font-medium text-slate-300">Failure Alert Threshold</label>
                    <select
                      value={failureThreshold}
                      onChange={(e) => setFailureThreshold(Number(e.target.value))}
                      className="w-full text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-200 py-2 px-3 focus:outline-none focus:border-emerald-500"
                    >
                      <option value={1}>1 consecutive failure (Immediate)</option>
                      <option value={2}>2 consecutive failures (Recommended)</option>
                      <option value={3}>3 consecutive failures (High tolerance)</option>
                      <option value={5}>5 consecutive failures</option>
                    </select>
                    <p className="text-[11px] text-slate-400">
                      Suppresses alerts until the specified number of failed attempts occur.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-medium text-slate-300">Cooldown Window (Anti-Spam)</label>
                    <select
                      value={cooldownMinutes}
                      onChange={(e) => setCooldownMinutes(Number(e.target.value))}
                      className="w-full text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-200 py-2 px-3 focus:outline-none focus:border-emerald-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>60 minutes (1 hour - Recommended)</option>
                      <option value={240}>4 hours</option>
                    </select>
                    <p className="text-[11px] text-slate-400">
                      Minimum duration before sending a duplicate failure alert for the same project.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifyOnRecovery}
                        onChange={(e) => setNotifyOnRecovery(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-slate-300">Send resolution alert when project recovers</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailEnabled}
                        onChange={(e) => setEmailEnabled(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-slate-300">Enable email notifications (Requires SMTP)</span>
                    </label>
                  </div>

                  {saveSuccess && (
                    <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs text-center font-medium">
                      ✓ Preferences saved successfully!
                    </div>
                  )}

                  <Button variant="primary" size="sm" className="w-full mt-2" type="submit" isLoading={savingPrefs}>
                    Save Preferences
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
