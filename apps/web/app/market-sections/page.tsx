import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Metric, Panel } from "@/components/ui";
import { getMarketSections, getMarkets } from "@/lib/api";

export const dynamic = "force-dynamic";
const num = (value: unknown) => Number(value || 0);

export default async function MarketSectionsPage() {
  const [marketSections, markets] = await Promise.all([getMarketSections(), getMarkets()]);
  const sectionMarkets = markets.slice(0, 8);

  return (
    <AppShell>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Sections tracked" value={String(marketSections.length)} tone="cyan" />
        <Metric label="Hot categories" value="6" tone="green" />
        <Metric label="Breaking pulse" value="+31%" tone="violet" />
        <Metric label="Whale categories" value="4" tone="amber" />
      </div>

      <Panel className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Polymarket sections</h2>
            <p className="mt-2 text-slate-400">Category-level intelligence for browsing, scanning, and routing the bot.</p>
          </div>
          <Badge tone="cyan">Live taxonomy ready</Badge>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {marketSections.map((section) => (
            <Link
              key={section.slug}
              href={`/market-sections/${section.slug}`}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-cyanx/50 hover:bg-cyanx/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{section.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{section.signal}</p>
                </div>
                <Badge tone={String(section.pulse || "").startsWith("+3") || String(section.pulse || "").startsWith("+2") ? "green" : "cyan"}>{section.pulse || "Live"}</Badge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <span className="text-slate-500">Markets</span><span className="text-right">{section.markets}</span>
                <span className="text-slate-500">Volume</span><span className="text-right">{section.volume}</span>
              </div>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel className="mt-6 overflow-hidden">
        <h2 className="text-xl font-semibold">Cross-section movers</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-slate-500">
              <tr><th className="py-3">Section</th><th>Market</th><th>Price</th><th>Move</th><th>Liquidity</th><th>Volume</th><th>Confidence</th><th>Whale signal</th></tr>
            </thead>
            <tbody>
              {sectionMarkets.map((market) => (
                <tr key={market.id || market.question} className="border-t border-white/10">
                  <td className="py-4"><Badge tone="violet">{market.section}</Badge></td>
                  <td className="font-medium">{market.question}</td>
                  <td>{market.best_outcome ? num(market.best_outcome.price).toFixed(2) : "-"}</td>
                  <td className={num(market.best_outcome?.edge) >= 0 ? "text-greenx" : "text-redx"}>{market.best_outcome ? `${(num(market.best_outcome.edge) * 100).toFixed(1)}%` : "-"}</td>
                  <td>${Math.round(market.liquidity || 0).toLocaleString()}</td>
                  <td>${Math.round(market.volume || 0).toLocaleString()}</td>
                  <td>{market.best_outcome?.confidence || 0}%</td>
                  <td>{market.preferred_pick || "-"}</td>
                </tr>
              ))}
              {!sectionMarkets.length && <tr><td colSpan={8} className="py-8 text-slate-400">No section movers yet. Sync live markets first.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}

