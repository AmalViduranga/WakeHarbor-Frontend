"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AddProjectWizard } from "@/components/projects/AddProjectWizard";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewProjectPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <NextLink
            href="/projects"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </NextLink>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Connect Supabase Project</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Step-by-step setup to provision your safe database heartbeat function.
            </p>
          </div>
        </div>

        <AddProjectWizard />
      </div>
    </AppLayout>
  );
}
