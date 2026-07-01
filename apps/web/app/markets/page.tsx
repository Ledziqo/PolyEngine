import { AppShell } from "@/components/app-shell";
import { Badge, Panel, RatingBadge } from "@/components/ui";
import { getMarkets } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";
const num = (value: unknown) => Number(value || 0);

export default async function MarketsPage() {
  const markets = await getMarkets();

  return (
    <AppShell>
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Markets</h2>
            <p className="mt-2 text-slate-400">Real Polymarket data will stream here from the Python engine.</p>
          </div>
          <input placeholder="Search markets" className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyanx sm:w-72" />
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="text-slate-500"><tr><th className="py-3">Market</th><th>Rating</th><th>Preferred pick</th><th>Bot action</th><th>Type</th><th>Price</th><th>Fair</th><th>Edge</th><th>Confidence</th><th>Liquidity</th><th>Spread</th><th>Status</th></tr></thead>
            <tbody>
              {markets.map((item) => {
                const best = item.best_outcome;
                return (
                <tr key={item.id || item.question} className="border-t border-white/10">
                  <td className="py-4 font-medium"><Link href={`/markets/${item.id || 1}`} className="hover:text-cyanx">{item.question}</Link></td>
                  <td><RatingBadge rating={item.rating} /></td>
                  <td className="font-semibold text-cyanx">{item.preferred_pick || best?.name || "-"}</td>
                  <td><Badge tone={item.bot_action === "Enter" ? "green" : item.bot_action === "Skip" ? "red" : "violet"}>{item.bot_action || "Watch"}</Badge></td>
                  <td>{item.outcomes && item.outcomes.length > 2 ? "Multi" : "Yes/No"}</td>
                  <td>{best ? num(best.price).toFixed(2) : "-"}</td>
                  <td>{best ? `${Math.round(num(best.fair_probability) * 100)}%` : "-"}</td>
                  <td className={num(best?.edge) >= 0 ? "text-greenx" : "text-redx"}>{best ? `${(num(best.edge) * 100).toFixed(1)}%` : "-"}</td>
                  <td>{num(best?.confidence)}%</td>
                  <td>${Math.round(item.liquidity || best?.liquidity || 0).toLocaleString()}</td>
                  <td>{best ? `${(num(best.spread) * 100).toFixed(1)}%` : "-"}</td>
                  <td><Badge tone="green">Live</Badge></td>
                </tr>
              )})}
              {!markets.length && (
                <tr>
                  <td colSpan={12} className="py-8 text-slate-400">
                    No real Polymarket markets synced yet. Open Settings and run Sync Polymarket Data, or wait for the VPS worker.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
