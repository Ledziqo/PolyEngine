import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, Metric, Panel } from "@/components/ui";
import { marketSections, sectionMarkets, opportunities } from "@/lib/demo-data";

export default async function MarketSectionDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = marketSections.find((item) => item.slug === slug);
  if (!section) notFound();

  const rows = sectionMarkets.filter((item) => item.section === section.name);
  const fallbackRows = rows.length ? rows : sectionMarkets.slice(0, 3);

  return (
    <AppShell>
      <Link href="/market-sections" className="text-sm text-cyanx">Back to sections</Link>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label={`${section.name} volume`} value={section.volume} tone="cyan" />
        <Metric label="Markets" value={String(section.markets)} tone="violet" />
        <Metric label="Pulse" value={section.pulse} tone="green" />
        <Metric label="Signal" value={section.signal} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel className="overflow-hidden">
          <h2 className="text-2xl font-semibold">{section.name} markets</h2>
          <p className="mt-2 text-slate-400">Top opportunities, odds movers, liquidity, and whale flow inside this category.</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="text-slate-500"><tr><th className="py-3">Market</th><th>Price</th><th>Move</th><th>Liquidity</th><th>Volume</th><th>AI</th><th>Wallet flow</th></tr></thead>
              <tbody>
                {fallbackRows.map((market) => (
                  <tr key={market.market} className="border-t border-white/10">
                    <td className="py-4 font-medium">{market.market}</td>
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
