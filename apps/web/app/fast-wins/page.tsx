import { AppShell } from "@/components/app-shell";
import { Badge, Panel, RatingBadge } from "@/components/ui";
import { getOpportunities } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function FastWinsPage() {
  const opportunities = await getOpportunities("fast");

  return (
    <AppShell>
      <Panel>
        <h2 className="text-2xl font-semibold">Fast Wins</h2>
        <p className="mt-2 text-slate-400">Soon-ending markets ranked by bot liking, probability, timing, and execution quality.</p>
        <div className="mt-6 grid gap-4">
          {opportunities.slice(0, 10).map((item) => (
            <div key={item.market} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{item.market}</h3>
                <div className="flex gap-2"><RatingBadge rating={item.rating} /><Badge tone="green">{item.confidence}%</Badge><Badge tone="amber">Fast</Badge></div>
              </div>
              <p className="mt-3 text-slate-400">{item.why}</p>
              <div className="mt-4 text-sm text-slate-300">Preferred pick: <b className="text-cyanx">{item.name}</b></div>
            </div>
          ))}
          {!opportunities.length && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-slate-400">
              No Fast Wins yet. The engine needs real soon-ending markets with strong enough probability and execution quality.
            </div>
          )}
        </div>
      </Panel>
    </AppShell>
  );
}
