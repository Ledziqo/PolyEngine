import { AppShell } from "@/components/app-shell";
import { Badge, Panel } from "@/components/ui";
import { opportunities } from "@/lib/demo-data";

export default function OpportunitiesPage() {
  return (
    <AppShell>
      <Panel className="overflow-hidden">
        <h2 className="text-2xl font-semibold">AI Opportunities</h2>
        <p className="mt-2 text-slate-400">Ranked by edge, confidence, spread, and liquidity.</p>
        <div className="mt-6 grid gap-4">
          {opportunities.map((item) => (
            <div key={item.market} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{item.market}</h3>
                  <p className="mt-2 text-sm text-slate-400">{item.why}</p>
                </div>
                <Badge tone={item.confidence > 80 ? "green" : "amber"}>{item.grade}</Badge>
              </div>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-5">
                <span>Outcome <b>{item.outcome}</b></span>
                <span>Price <b>{item.price}</b></span>
                <span>Fair <b>{Math.round(item.fair * 100)}%</b></span>
                <span>Edge <b className="text-greenx">+{item.edge}%</b></span>
                <span>Confidence <b>{item.confidence}%</b></span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
