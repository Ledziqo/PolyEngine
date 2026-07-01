import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Metric, Panel } from "@/components/ui";
import { getCopySignals, getTraders } from "@/lib/api";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export const dynamic = "force-dynamic";

export default async function TradersPage() {
  const [traderPayload, traderPositions] = await Promise.all([getTraders() as any, getCopySignals() as any]);
  const traders = Array.isArray(traderPayload.traders) ? traderPayload.traders : [];

  return (
    <AppShell>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Traders tracked" value="12,480" tone="cyan" />
        <Metric label="Top monthly PnL" value={money(traders[0]?.pnl || 0)} tone="green" />
        <Metric label="Best copy score" value={`${Math.max(0, ...traders.map((t: any) => t.copy_score || 0))}`} tone="violet" />
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
              {traders.map((trader: any) => (
                <tr key={trader.wallet} className="border-t border-white/10">
                  <td className="py-4 text-slate-400">#{trader.rank}</td>
                  <td>
                    <Link href={`/traders/${trader.wallet}`} className="font-medium text-white hover:text-cyanx">{trader.name}</Link>
                    <p className="text-xs text-slate-500">{trader.wallet}</p>
                  </td>
                  <td className="text-greenx">{money(trader.pnl)}</td>
                  <td>{trader.roi}%</td>
                  <td>{money(trader.volume)}</td>
                  <td>{trader.win_rate}%</td>
                  <td>{trader.gain_loss}x</td>
                  <td>{trader.positions || "-"}</td>
                  <td>{money(trader.active_value)}</td>
                  <td><Badge tone={trader.copy_score > 90 ? "green" : "cyan"}>{trader.copy_score}</Badge></td>
                  <td>{trader.source_quality}</td>
                </tr>
              ))}
              {!traders.length && <tr><td colSpan={11} className="py-8 text-slate-400">No trader leaderboard data yet. Add Bitquery/API credentials or run trader sync.</td></tr>}
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
              {traderPositions.map((signal: any) => (
                <tr key={`${signal.trader}-${signal.market}`} className="border-t border-white/10">
                  <td className="py-4">{signal.trader}</td><td>{signal.market}</td><td>{signal.side}</td><td>{signal.size}</td><td>{signal.entry}</td><td>{signal.current}</td><td className="text-greenx">{signal.pnl || "-"}</td><td><Badge tone="cyan">{signal.status}</Badge></td>
                </tr>
              ))}
              {!traderPositions.length && <tr><td colSpan={8} className="py-8 text-slate-400">No copy signals yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
