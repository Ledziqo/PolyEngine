import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Metric, Panel } from "@/components/ui";
import { getOpportunities, getSectionMarkets } from "@/lib/api";

export const dynamic = "force-dynamic";
const num = (value: unknown) => Number(value || 0);

export default async function MarketSectionDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [fallbackRows, opportunities] = await Promise.all([getSectionMarkets(slug), getOpportunities()]);
  const sectionName = slug.replace("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <AppShell>
      <Link href="/market-sections" className="text-sm text-cyanx">Back to sections</Link>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label={`${sectionName} volume`} value={`$${Math.round(fallbackRows.reduce((sum, item) => sum + num(item.volume), 0)).toLocaleString()}`} tone="cyan" />
        <Metric label="Markets" value={String(fallbackRows.length)} tone="violet" />
        <Metric label="Strong/Best" value={String(fallbackRows.filter((item) => ["Strong", "Best"].includes(item.rating)).length)} tone="green" />
        <Metric label="Signal" value="Live" tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel className="overflow-hidden">
          <h2 className="text-2xl font-semibold">{sectionName} markets</h2>
          <p className="mt-2 text-slate-400">Top opportunities, odds movers, liquidity, and whale flow inside this category.</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="text-slate-500"><tr><th className="py-3">Market</th><th>Price</th><th>Move</th><th>Liquidity</th><th>Volume</th><th>AI</th><th>Wallet flow</th></tr></thead>
              <tbody>
                {fallbackRows.map((market) => (
                  <tr key={market.id || market.question} className="border-t border-white/10">
                    <td className="py-4 font-medium">{market.question}</td>
                    <td>{market.best_outcome ? num(market.best_outcome.price).toFixed(2) : "-"}</td>
                    <td className={num(market.best_outcome?.edge) >= 0 ? "text-greenx" : "text-redx"}>{market.best_outcome ? `${(num(market.best_outcome.edge) * 100).toFixed(1)}%` : "-"}</td>
                    <td>${Math.round(market.liquidity || 0).toLocaleString()}</td>
                    <td>${Math.round(market.volume || 0).toLocaleString()}</td>
                    <td>{market.best_outcome?.confidence || 0}%</td>
                    <td>{market.preferred_pick || "-"}</td>
                  </tr>
                ))}
                {!fallbackRows.length && <tr><td colSpan={7} className="py-8 text-slate-400">No markets synced for this section yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <h3 className="text-xl font-semibold">Best AI setups</h3>
          <div className="mt-5 grid gap-3">
            {opportunities.slice(0, 3).map((item) => (
              <div key={item.market} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{item.market}</p>
                  <Badge tone={item.confidence > 80 ? "green" : "amber"}>{item.confidence}%</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-400">{item.why}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

