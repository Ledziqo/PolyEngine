import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight, Bot, BrainCircuit, CheckCircle2, RadioTower, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { Logo } from "@/components/logo";
import { TerminalPreview } from "@/components/terminal-preview";

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
    <main className="min-h-screen overflow-hidden bg-[#f6f8fb] text-[#071018]">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(9,16,24,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(9,16,24,0.045)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_20%_15%,rgba(22,217,227,0.20),transparent_32rem),radial-gradient(circle_at_82%_12%,rgba(124,58,237,0.16),transparent_30rem)]" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Logo compact />
        <nav className="hidden items-center gap-8 rounded-full border border-slate-200 bg-white/70 px-5 py-3 text-sm font-medium text-slate-600 shadow-sm backdrop-blur md:flex">
          <a href="#engine" className="hover:text-slate-950">Engine</a>
          <a href="#signals" className="hover:text-slate-950">Signals</a>
          <a href="#access" className="hover:text-slate-950">Access</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:border-slate-300 sm:inline-flex">
            Login
          </Link>
          <Link href="/request-access" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 hover:bg-cyanx hover:text-black">
            Request access
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-12 px-4 pb-14 pt-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyanx/25 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-cyanx shadow-[0_0_18px_rgba(22,217,227,0.9)]" />
            Autonomous Polymarket trading engine
          </div>
          <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-tight text-slate-950 sm:text-7xl lg:text-8xl">
            A private AI trading desk for Polymarket.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            PolyEngine scans live markets, ranks every outcome, tracks sharp wallets, and runs bot trades while a 1:1 simulator lets you test the exact strategy before capital goes live.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/request-access" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 font-semibold text-white shadow-xl shadow-slate-950/15 hover:bg-cyanx hover:text-black">
              Request access <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-950 shadow-sm hover:border-slate-300">
              Login
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ["24/7", "Autonomous bot"],
              ["Real + Sim", "Trading modes"],
              ["Live", "Wallet intelligence"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <p className="text-2xl font-semibold text-slate-950">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-cyanx/20 via-violetx/10 to-greenx/20 blur-2xl" />
          <div className="relative rounded-[2rem] border border-slate-200 bg-slate-950 p-2 shadow-2xl shadow-slate-950/25">
            <TerminalPreview />
          </div>
        </div>
      </section>

      <section id="engine" className="relative z-10 border-y border-slate-200 bg-white/70 px-4 py-20 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violetx">The brain</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-5xl">A 24/7 Python engine behind a polished trading terminal.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-500">Built as a private operating system for market scanning, execution discipline, wallet intelligence, and strategy simulation.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, text, Icon]) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyanx">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="signals" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyanx">Signal layers</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-5xl">Separate the obvious from the executable.</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            ["Easy Wins", "The bot's highest-probability opportunities, ranked by confidence, fair probability, edge, liquidity, and spread."],
            ["Fast Wins", "Soon-ending markets ranked by bot liking, probability, edge, timing, and execution quality."],
            ["Live Bot Log", "Every scan, skip, entry, exit, risk block, and API issue written in plain English."]
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-greenx" />
              <p className="mt-5 text-2xl font-semibold text-slate-950">{title}</p>
              <p className="mt-4 leading-7 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="access" className="relative z-10 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-center text-white shadow-2xl shadow-slate-950/15 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyanx">Private access</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">Request access before the engine opens.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-300">
            Request access to the private bot terminal. Run real execution when configured, and use the 1:1 simulator to test every strategy before scaling.
          </p>
          <Link href="/request-access" className="mt-8 inline-flex rounded-full bg-cyanx px-6 py-3 font-semibold text-black hover:bg-white">
            Request access <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
