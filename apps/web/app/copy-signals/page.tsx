import { AppShell } from "@/components/app-shell";
import { Badge, Panel } from "@/components/ui";
import { topTraders, traderPositions } from "@/lib/demo-data";

export default function CopySignalsPage() {
  return (
    <AppShell>
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Copy Signals</h2>
            <p className="mt-2 text-slate-400">Wallet-derived signals for the paper bot. These are signals, not automatic live-money copies.</p>
          </div>
          <Badge tone="green">Paper-only</Badge>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {traderPositions.map(([traderName, market, side, size, entry, current, pnl, status]) => {
            const trader = topTraders.find((item) => item.name === traderName);
            return (
              <div key={`${traderName}-${market}`} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{market}</h3>
                    <p className="mt-1 text-sm text-slate-400">{traderName} bought {side} with {size} exposure</p>
                  </div>
                  <Badge tone={(trader?.copyScore || 0) > 90 ? "green" : "cyan"}>Copy {trader?.copyScore || 75}</Badge>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <span className="text-slate-500">Entry <b className="text-white">{entry}</b></span>
                  <span className="text-slate-500">Current <b className="text-white">{current}</b></span>
                  <span className="text-slate-500">PnL <b className="text-greenx">{pnl}</b></span>
                  <span className="text-slate-500">Status <b className="text-white">{status}</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </AppShell>
  );
}
