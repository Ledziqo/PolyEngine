import { AppShell } from "@/components/app-shell";
import { Badge, Panel } from "@/components/ui";
import { markets } from "@/lib/demo-data";

export default function MarketsPage() {
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
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-slate-500"><tr><th className="py-3">Market</th><th>Type</th><th>Price</th><th>Liquidity</th><th>Spread</th><th>Status</th></tr></thead>
            <tbody>
              {markets.map(([market, type, price, liquidity, spread, status]) => (
                <tr key={market} className="border-t border-white/10">
                  <td className="py-4 font-medium">{market}</td><td>{type}</td><td>{price}</td><td>{liquidity}</td><td>{spread}</td><td><Badge tone={status === "Live" ? "green" : "amber"}>{status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
