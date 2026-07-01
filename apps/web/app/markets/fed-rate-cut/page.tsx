import { AppShell } from "@/components/app-shell";
import { Badge, Panel } from "@/components/ui";

export default function MarketDetailPage() {
  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel>
          <Badge tone="green">Live market detail</Badge>
          <h2 className="mt-4 text-3xl font-semibold">Fed rate cut by September?</h2>
          <p className="mt-3 text-slate-400">Binary market with tight spread, strong liquidity, and active order-book movement.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ["YES", "0.42", "+16.0% edge", "green"],
              ["NO", "0.59", "-4.2% edge", "red"]
            ].map(([outcome, price, edge, tone]) => (
              <div key={outcome} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-slate-500">{outcome}</p>
                <p className="mt-3 text-4xl font-semibold">{price}</p>
                <p className={tone === "green" ? "mt-2 text-greenx" : "mt-2 text-redx"}>{edge}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <h3 className="text-xl font-semibold">AI explanation</h3>
          <p className="mt-4 leading-7 text-slate-300">
            The engine likes YES because fair probability is materially above market price, order book depth can absorb the planned paper entry, and expiry is close enough for useful feedback without being dangerously immediate.
          </p>
          <div className="mt-6 grid gap-3">
            <Badge tone="green">Confidence 87%</Badge>
            <Badge tone="cyan">Liquidity $182.4k</Badge>
            <Badge tone="violet">Spread 1.2%</Badge>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
