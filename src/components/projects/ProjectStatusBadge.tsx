import React from "react";
import { ProjectStatus } from "@/types";
import { STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  showDot?: boolean;
  className?: string;
}

export function ProjectStatusBadge({ status, showDot = true, className }: ProjectStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.UNKNOWN;

  return (
    <span
      title={config.description}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        config.bg,
        config.color,
        config.border,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            config.dot,
            status === "HEALTHY" && "animate-pulse"
          )}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
