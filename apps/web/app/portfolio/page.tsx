import { AppShell } from "@/components/app-shell";
import { Metric, Panel } from "@/components/ui";
import { getPortfolio } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const portfolio = await getPortfolio() as any;
  const positions = portfolio.positions || [];

  return (
    <AppShell>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Balance" value={`$${Math.round(portfolio.balance || 0).toLocaleString()}`} tone="green" />
        <Metric label="Realized PnL" value={`$${Math.round(portfolio.realized_pnl || 0).toLocaleString()}`} tone="green" />
        <Metric label="Unrealized" value={`$${Math.round(portfolio.unrealized_pnl || 0).toLocaleString()}`} tone="cyan" />
        <Metric label="Exposure" value={`$${Math.round(portfolio.exposure || 0).toLocaleString()}`} tone="violet" />
      </div>
      <Panel className="mt-6">
        <h2 className="text-2xl font-semibold">Open paper positions</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-slate-500"><tr><th className="py-3">Market</th><th>Outcome</th><th>Size</th><th>Avg Fill</th><th>Current</th><th>PnL</th></tr></thead>
            <tbody>
              {positions.map((position: any) => (
                <tr key={position.id} className="border-t border-white/10"><td className="py-4">{position.market}</td><td>{position.outcome}</td><td>${Math.round(position.cost_basis)}</td><td>{position.avg_price.toFixed(2)}</td><td>{position.current_price.toFixed(2)}</td><td className={position.unrealized_pnl >= 0 ? "text-greenx" : "text-redx"}>{position.unrealized_pnl.toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
