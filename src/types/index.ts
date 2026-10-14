export type ProjectStatus =
  | "NOT_CONFIGURED"
  | "PENDING_VERIFICATION"
  | "HEALTHY"
  | "DEGRADED"
  | "CONNECTION_FAILED"
  | "AUTHENTICATION_ERROR"
  | "PAUSED_BY_USER"
  | "SUPABASE_PAUSED_CONFIRMED"
  | "SUPABASE_PAUSED_SUSPECTED"
  | "UNKNOWN";

export type ExecutionStatus =
  | "SUCCESS"
  | "FAILURE"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "AUTH_ERROR"
  | "PAUSED_CONFIRMED"
  | "INVALID_RESPONSE";

export interface User {
  id: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  projectRef: string;
  supabaseUrl: string;
  keyPreview: string;
  heartbeatMethod: string;
  status: ProjectStatus;
  enabled: boolean;
  intervalHours: number;
  nextRunAt: string | null;
  lastAttemptedAt: string | null;
  lastSuccessfulAt: string | null;
  lastLatencyMs: number | null;
  lastErrorCategory: string | null;
  lastErrorMessage: string | null;
  consecutiveFailures: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Execution {
  id: string;
  projectId: string;
  projectName: string;
  projectRef: string;
  triggerType: "SCHEDULED" | "MANUAL" | "RETRY";
  status: ExecutionStatus;
  httpStatusCode: number | null;
  latencyMs: number | null;
  errorCategory: string | null;
  errorDetails: string | null;
  responsePayloadSummary: string | null;
  executedAt: string;
}

export interface DashboardSummary {
  totalProjects: number;
  healthyProjects: number;
  failedProjects: number;
  pausedProjects: number;
  executions24h: number;
  successRate24h: number;
  averageLatencyMs: number;
  recentExecutions: Execution[];
  upcomingJobs: Array<{
    jobId: string;
    projectId: string;
    projectName: string;
    projectRef: string;
    scheduledFor: string;
  }>;
}

export interface ValidateCredentialsResponse {
  valid: boolean;
  status: string;
  httpStatusCode: number | null;
  latencyMs: number | null;
  message: string;
  errorCategory: string | null;
  payloadSummary: string | null;
}

export interface Alert {
  id: string;
  projectId: string | null;
  projectName: string;
  eventType: string;
  recipient: string;
  channel: string;
  subject: string;
  content: string;
  deliveryStatus: "SENT" | "FAILED" | "SKIPPED_NO_SMTP" | "SKIPPED_COOLDOWN";
  errorMessage: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  recipientEmail: string;
  notifyOnFailure: boolean;
  notifyOnRecovery: boolean;
  notifyOnWorkerOffline: boolean;
  failureThreshold: number;
  cooldownMinutes: number;
  smtpConfigured: boolean;
}

export interface WorkerNode {
  id: string;
  workerId: string;
  hostname: string | null;
  status: string;
  currentLoad: number;
  completedJobsCount: number;
  failedJobsCount: number;
  lastHeartbeatAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  timestamp: string;
}
