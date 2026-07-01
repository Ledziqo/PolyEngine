import { AppShell } from "@/components/app-shell";
import { Badge, Panel } from "@/components/ui";
import { getCopySignals } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CopySignalsPage() {
  const traderPositions = await getCopySignals() as any[];

  return (
    <AppShell>
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Copy Signals</h2>
            <p className="mt-2 text-slate-400">Wallet-derived signals for the bot. These are signals, not automatic live-money copies.</p>
          </div>
          <Badge tone="green">Paper-only</Badge>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {traderPositions.map((signal) => {
            return (
              <div key={`${signal.trader}-${signal.market}`} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{signal.market}</h3>
                    <p className="mt-1 text-sm text-slate-400">{signal.trader} bought {signal.side} with {signal.size} exposure</p>
                  </div>
                  <Badge tone={(signal.copy_score || 0) > 90 ? "green" : "cyan"}>Copy {signal.copy_score || 75}</Badge>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <span className="text-slate-500">Entry <b className="text-white">{signal.entry}</b></span>
                  <span className="text-slate-500">Current <b className="text-white">{signal.current}</b></span>
                  <span className="text-slate-500">Source <b className="text-greenx">{signal.source_quality}</b></span>
                  <span className="text-slate-500">Status <b className="text-white">{signal.status}</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </AppShell>
  );
}

