"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { fetchApi } from "@/lib/api";
import { KeyRound, ShieldAlert } from "lucide-react";

interface RotateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onSuccess: () => void;
}

export function RotateKeyModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  onSuccess,
}: RotateKeyModalProps) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError("Please enter the new publishable key");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await fetchApi(`/api/v1/projects/${projectId}/rotate-key`, {
        method: "POST",
        body: JSON.stringify({ publishableKey: key.trim() }),
      });
      setKey("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rotate Project API Key"
      description={`Update the encrypted publishable key for ${projectName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-amber-950/30 border border-amber-800/40 p-3 text-xs text-amber-300 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            Provide your updated <code className="font-mono bg-amber-900/40 px-1 py-0.5 rounded">sb_publishable_...</code> key.
            Never provide service-role keys or database passwords. The key will be encrypted using AES-256-GCM.
          </div>
        </div>

        <Input
          label="New Publishable API Key"
          type="password"
          placeholder="sb_publishable_..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
          error={error || undefined}
          autoFocus
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            <KeyRound className="h-3.5 w-3.5 mr-1" />
            Save & Re-encrypt
          </Button>
        </div>
      </form>
    </Modal>
  );
}
