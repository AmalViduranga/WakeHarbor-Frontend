"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Database,
  PlusCircle,
  History,
  Bell,
  Settings,
  BookOpen,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Anchor,
  ShieldCheck,
} from "lucide-react";
import NextLink from "next/link";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: Database },
    { label: "Add Project", href: "/projects/new", icon: PlusCircle },
    { label: "Activity History", href: "/history", icon: History },
    { label: "Alerts", href: "/alerts", icon: Bell },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Documentation", href: "/docs", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <NextLink href="/" className="flex items-center gap-2.5 font-semibold text-slate-100">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Anchor className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight">WakeHarbor</span>
            <span className="text-[10px] block text-emerald-400/90 font-mono -mt-0.5">DEV MONITOR</span>
          </div>
        </NextLink>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col shrink-0 md:sticky md:top-0 md:h-screen z-30 transition-all",
          mobileMenuOpen ? "block fixed inset-0 top-16 bg-slate-950 z-50 p-4" : "hidden md:flex"
        )}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 hidden md:flex items-center justify-between">
          <NextLink href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-xs">
              <Anchor className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white">WakeHarbor</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono">MVP</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Keep dev active, intelligently</p>
            </div>
          </NextLink>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Platform Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <NextLink
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                <span>{item.label}</span>
              </NextLink>
            );
          })}
        </nav>

        {/* User profile & footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 space-y-2">
          {user && (
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 truncate">{user.email}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block pl-5">ADMINISTRATOR</span>
              </div>

              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:border-rose-900 border border-transparent transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">{children}</div>
      </main>
    </div>
  );
}
