import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function DisclaimerBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3.5 text-xs text-slate-400",
        className
      )}
    >
      <Info className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
      <div>
        <span className="font-semibold text-slate-300">Operational Notice: </span>
        WakeHarbor scheduled heartbeats produce verifiable user-space database activity. Supabase establishes its own
        internal criteria for evaluating Free Plan dormancy, and WakeHarbor does not claim or guarantee that automated
        heartbeats will permanently prevent provider-side project pauses.
      </div>
    </div>
  );
}
