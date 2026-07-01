import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Metric, Panel } from "@/components/ui";
import { marketSections, sectionMarkets } from "@/lib/demo-data";

export default function MarketSectionsPage() {
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
            <p className="mt-2 text-slate-400">Category-level intelligence for browsing, scanning, and routing the paper bot.</p>
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
                <Badge tone={section.pulse.startsWith("+3") || section.pulse.startsWith("+2") ? "green" : "cyan"}>{section.pulse}</Badge>
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
                <tr key={market.market} className="border-t border-white/10">
                  <td className="py-4"><Badge tone="violet">{market.section}</Badge></td>
                  <td className="font-medium">{market.market}</td>
                  <td>{market.price}</td>
                  <td className={market.change.startsWith("+") ? "text-greenx" : "text-redx"}>{market.change}</td>
                  <td>{market.liquidity}</td>
                  <td>{market.volume}</td>
                  <td>{market.confidence}%</td>
                  <td>{market.whale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
