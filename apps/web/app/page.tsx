import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight, Bot, BrainCircuit, RadioTower, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { Logo } from "@/components/logo";
import { TerminalPreview } from "@/components/terminal-preview";
import { Badge, Panel } from "@/components/ui";

type Feature = [string, string, ComponentType<{ className?: string }>];

const features: Feature[] = [
  ["Live market pulse", "Continuous Polymarket sync for prices, depth, liquidity, and expiry.", RadioTower],
  ["AI opportunity scoring", "Confidence, edge, fair probability, and skip reasons in one terminal.", BrainCircuit],
  ["Autonomous bot trading", "Let the engine scan, decide, and execute while the 1:1 simulator mirrors every move for testing.", Bot],
  ["Copy-wallet signals", "Track wallet activity and use it as signal context, not blind hype.", WalletCards],
  ["Risk firewall", "Exposure, spread, liquidity, and stale-data rules before every entry.", ShieldCheck],
  ["Easy + Fast Wins", "Separate views for highest-probability trades and soon-ending markets ranked by bot conviction.", Sparkles]
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-graphite text-white">
      <div className="fixed inset-0 terminal-grid opacity-30" />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Logo compact />
        <nav className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
          <a href="#engine" className="hover:text-white">Engine</a>
          <a href="#signals" className="hover:text-white">Signals</a>
          <a href="#access" className="hover:text-white">Access</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 sm:inline-flex">
            Login
          </Link>
          <Link href="/request-access" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-cyanx">
            Request access
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div>
          <Badge tone="cyan">Autonomous Polymarket trading engine</Badge>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            An AI bot built to trade Polymarket.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            PolyEngine scans live markets, ranks every outcome, tracks sharp wallets, and runs bot trades while a 1:1 simulator lets you test the exact strategy before capital goes live.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/request-access" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyanx px-6 py-3 font-semibold text-black shadow-glow hover:bg-white">
              Request access <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 font-semibold text-white hover:bg-white/5">
              Login
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              ["24/7", "Autonomous bot"],
              ["Real + Sim", "Trading modes"],
              ["Live", "Wallet intelligence"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-2xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <TerminalPreview />
      </section>

      <section id="engine" className="relative z-10 border-y border-white/10 bg-black/20 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-violet-300">The brain</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">A 24/7 Python engine behind a polished Next.js terminal.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, text, Icon]) => (
              <Panel key={title}>
                <Icon className="h-6 w-6 text-cyanx" />
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section id="signals" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            ["Easy Wins", "The bot's highest-probability opportunities, ranked by confidence, fair probability, edge, liquidity, and spread."],
            ["Fast Wins", "Soon-ending markets ranked by bot liking, probability, edge, timing, and execution quality."],
            ["Live Bot Log", "Every scan, skip, entry, exit, risk block, and API issue written in plain English."]
          ].map(([title, text]) => (
            <Panel key={title}>
              <p className="signal-text text-2xl font-semibold">{title}</p>
              <p className="mt-4 leading-7 text-slate-300">{text}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section id="access" className="relative z-10 px-4 pb-20 sm:px-6 lg:px-8">
        <Panel className="mx-auto max-w-5xl text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-cyanx">Private MVP</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">Request access before the engine opens.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-300">
            Request access to the private bot terminal. Run real execution when configured, and use the 1:1 simulator to test every strategy before scaling.
          </p>
          <Link href="/request-access" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-cyanx">
            Request access
          </Link>
        </Panel>
      </section>
    </main>
  );
}
