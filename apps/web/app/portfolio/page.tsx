import { AppShell } from "@/components/app-shell";
import { Metric, Panel } from "@/components/ui";

export default function PortfolioPage() {
  return (
    <AppShell>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Balance" value="$10,291" tone="green" />
        <Metric label="Realized PnL" value="+$184" tone="green" />
        <Metric label="Unrealized" value="+$107" tone="cyan" />
        <Metric label="Win rate" value="64%" tone="violet" />
      </div>
      <Panel className="mt-6">
        <h2 className="text-2xl font-semibold">Open paper positions</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-slate-500"><tr><th className="py-3">Market</th><th>Outcome</th><th>Size</th><th>Avg Fill</th><th>Current</th><th>PnL</th></tr></thead>
            <tbody>
              <tr className="border-t border-white/10"><td className="py-4">Fed rate cut by September?</td><td>YES</td><td>$48</td><td>0.42</td><td>0.45</td><td className="text-greenx">+$3.43</td></tr>
              <tr className="border-t border-white/10"><td className="py-4">BTC above $120k Friday?</td><td>NO</td><td>$36</td><td>0.63</td><td>0.65</td><td className="text-greenx">+$1.14</td></tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
