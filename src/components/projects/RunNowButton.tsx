"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Play } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Execution } from "@/types";

interface RunNowButtonProps {
  projectId: string;
  onExecuted?: (execution: Execution) => void;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "outline";
}

export function RunNowButton({
  projectId,
  onExecuted,
  size = "sm",
  variant = "secondary",
}: RunNowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const result = await fetchApi<Execution>(`/api/v1/projects/${projectId}/run`, {
        method: "POST",
      });
      setFeedback(result.status === "SUCCESS" ? "✓ Success" : "✗ Failed");
      if (onExecuted) onExecuted(result);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback("Error");
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={feedback === "✓ Success" ? "primary" : variant}
      size={size}
      isLoading={loading}
      onClick={handleRun}
      title="Execute safe heartbeat request now"
    >
      {!loading && !feedback && <Play className="h-3.5 w-3.5 fill-current" />}
      <span>{feedback || "Run Now"}</span>
    </Button>
  );
}
