import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Metric, Panel } from "@/components/ui";
import { topTraders, traderPositions } from "@/lib/demo-data";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function TradersPage() {
  return (
    <AppShell>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Traders tracked" value="12,480" tone="cyan" />
        <Metric label="Top monthly PnL" value={money(topTraders[0].pnl)} tone="green" />
        <Metric label="Best copy score" value={`${Math.max(...topTraders.map((t) => t.copyScore))}`} tone="violet" />
        <Metric label="Open whale value" value="$3.13M" tone="amber" />
      </div>

      <Panel className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Top Traders</h2>
            <p className="mt-2 text-slate-400">PnL, ROI, win rate, active positions, and PolyEngine Copy Score.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Daily", "Weekly", "Monthly", "All-time"].map((filter) => (
              <Badge key={filter} tone={filter === "Monthly" ? "cyan" : "violet"}>{filter}</Badge>
            ))}
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="text-slate-500">
              <tr><th className="py-3">Rank</th><th>Trader</th><th>PnL</th><th>ROI</th><th>Volume</th><th>Win rate</th><th>G/L</th><th>Positions</th><th>Active value</th><th>Copy score</th><th>Specialty</th></tr>
            </thead>
            <tbody>
              {topTraders.map((trader) => (
                <tr key={trader.wallet} className="border-t border-white/10">
                  <td className="py-4 text-slate-400">#{trader.rank}</td>
                  <td>
                    <Link href={`/traders/${trader.wallet}`} className="font-medium text-white hover:text-cyanx">{trader.name}</Link>
                    <p className="text-xs text-slate-500">{trader.wallet}</p>
                  </td>
                  <td className="text-greenx">{money(trader.pnl)}</td>
                  <td>{trader.roi}%</td>
                  <td>{money(trader.volume)}</td>
                  <td>{trader.winRate}%</td>
                  <td>{trader.gainLoss}x</td>
                  <td>{trader.positions}</td>
                  <td>{money(trader.activeValue)}</td>
                  <td><Badge tone={trader.copyScore > 90 ? "green" : "cyan"}>{trader.copyScore}</Badge></td>
                  <td>{trader.specialty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel className="mt-6 overflow-hidden">
        <h2 className="text-xl font-semibold">Current positions being tracked</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-slate-500"><tr><th className="py-3">Trader</th><th>Market</th><th>Side</th><th>Size</th><th>Entry</th><th>Current</th><th>PnL</th><th>Status</th></tr></thead>
            <tbody>
              {traderPositions.map(([trader, market, side, size, entry, current, pnl, status]) => (
                <tr key={`${trader}-${market}`} className="border-t border-white/10">
                  <td className="py-4">{trader}</td><td>{market}</td><td>{side}</td><td>{size}</td><td>{entry}</td><td>{current}</td><td className="text-greenx">{pnl}</td><td><Badge tone="cyan">{status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
