import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return "Never";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatTimeAgo(isoString: string | null | undefined): string {
  if (!isoString) return "Never";
  try {
    const d = new Date(isoString);
    const diffSeconds = Math.floor((Date.now() - d.getTime()) / 1000);

    if (diffSeconds < 60) return `${Math.max(1, diffSeconds)}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  } catch {
    return isoString;
  }
}
