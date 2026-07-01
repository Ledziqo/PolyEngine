import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, Metric, Panel } from "@/components/ui";
import { topTraders, traderPositions } from "@/lib/demo-data";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default async function TraderDetailPage({
  params
}: {
  params: Promise<{ wallet: string }>;
}) {
  const { wallet } = await params;
  const trader = topTraders.find((item) => item.wallet === wallet);
  if (!trader) notFound();

  const positions = traderPositions.filter((position) => position[0] === trader.name);

  return (
    <AppShell>
      <Link href="/traders" className="text-sm text-cyanx">Back to leaderboard</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge tone="green">Copy score {trader.copyScore}</Badge>
          <h2 className="mt-4 text-4xl font-semibold">{trader.name}</h2>
          <p className="mt-2 text-slate-400">{trader.wallet}</p>
        </div>
        <Badge tone="violet">{trader.specialty}</Badge>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Monthly PnL" value={money(trader.pnl)} tone="green" />
        <Metric label="ROI" value={`${trader.roi}%`} tone="cyan" />
        <Metric label="Win rate" value={`${trader.winRate}%`} tone="violet" />
        <Metric label="Gain/loss" value={`${trader.gainLoss}x`} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel className="overflow-hidden">
          <h3 className="text-xl font-semibold">Active positions</h3>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-slate-500"><tr><th className="py-3">Market</th><th>Side</th><th>Size</th><th>Entry</th><th>Current</th><th>PnL</th><th>Status</th></tr></thead>
              <tbody>
                {(positions.length ? positions : traderPositions.slice(0, 2)).map(([_, market, side, size, entry, current, pnl, status]) => (
                  <tr key={market} className="border-t border-white/10">
                    <td className="py-4">{market}</td><td>{side}</td><td>{size}</td><td>{entry}</td><td>{current}</td><td className="text-greenx">{pnl}</td><td><Badge tone="cyan">{status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel>
          <h3 className="text-xl font-semibold">Copy analysis</h3>
          <p className="mt-4 leading-7 text-slate-300">
            This wallet ranks highly because performance is recent, position sizing is consistent, the gain/loss ratio is strong, and active exposure is concentrated in liquid markets.
          </p>
          <div className="mt-6 grid gap-3">
            <Badge tone="green">Strong consistency</Badge>
            <Badge tone="cyan">High liquidity entries</Badge>
            <Badge tone="violet">Specialist: {trader.specialty}</Badge>
            <Badge tone="amber">Review before copy</Badge>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
