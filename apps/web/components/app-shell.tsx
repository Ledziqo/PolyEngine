"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bot,
  Crown,
  Gauge,
  History,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
  Sparkles,
  Target,
  Users,
  Zap
} from "lucide-react";
import { Logo } from "./logo";

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Markets", "/markets", BarChart3],
  ["Market Sections", "/market-sections", Gauge],
  ["AI Opportunities", "/opportunities", Sparkles],
  ["Easy Wins", "/easy-wins", Target],
  ["Fast Wins", "/fast-wins", Zap],
  ["Top Traders", "/traders", Crown],
  ["Copy Signals", "/copy-signals", Users],
  ["Portfolio", "/portfolio", LineChart],
  ["Trade History", "/history", History],
  ["Live Bot Log", "/bot-log", Bot],
  ["Settings", "/settings", Settings]
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-graphite text-white">
      <div className="fixed inset-0 terminal-grid opacity-35" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="glass sticky top-0 z-20 flex w-full flex-col gap-5 border-x-0 border-t-0 p-4 lg:h-screen lg:w-72 lg:border-y-0 lg:border-l-0">
          <div className="flex items-center justify-between">
            <Logo compact />
            <div className="rounded-full border border-greenx/30 bg-greenx/10 px-3 py-1 text-xs text-greenx">LIVE</div>
          </div>
          <nav className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {nav.map(([label, href, Icon]) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex min-w-fit items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-cyanx/15 text-cyanx shadow-glow"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:block">
            <div className="flex items-center gap-2 text-sm text-white">
              <Activity className="h-4 w-4 text-cyanx" />
              Engine Pulse
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              24/7 paper bot, live scoring, and Polymarket sync once the VPS engine is connected.
            </p>
          </div>
        </aside>
        <section className="relative flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-white/10 bg-graphite/70 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyanx">PolyEngine Terminal</p>
                <h1 className="text-lg font-semibold text-white sm:text-2xl">AI paper-trading command center</h1>
              </div>
              <Link href="/api/auth/logout" className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
            </div>
          </header>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
