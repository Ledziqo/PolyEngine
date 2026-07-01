import { AppShell } from "@/components/app-shell";
import { Badge, Panel, RatingBadge } from "@/components/ui";
import { getOpportunities } from "@/lib/api";
const ratingOrder = ["Avoid", "Weak", "Watch", "Good", "Strong", "Best"];
const num = (value: unknown) => Number(value || 0);

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities();
  const ranked = [...opportunities].sort((a, b) => ratingOrder.indexOf(b.rating) - ratingOrder.indexOf(a.rating) || b.confidence - a.confidence);

  return (
    <AppShell>
      <Panel className="overflow-hidden">
        <h2 className="text-2xl font-semibold">AI Opportunities</h2>
        <p className="mt-2 text-slate-400">Ranked by edge, confidence, spread, and liquidity.</p>
        <div className="mt-6 grid gap-4">
          {ranked.map((item) => (
            <div key={item.market} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{item.market}</h3>
                  <p className="mt-2 text-sm text-slate-400">{item.why}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <RatingBadge rating={item.rating} />
                  <Badge tone={item.bot_action === "Enter" ? "green" : "violet"}>{item.bot_action}</Badge>
                </div>
              </div>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-5">
                <span>Pick <b className="text-cyanx">{item.name}</b></span>
                <span>Price <b>{num(item.price).toFixed(2)}</b></span>
                <span>Fair <b>{Math.round(num(item.fair_probability) * 100)}%</b></span>
                <span>Edge <b className="text-greenx">{(num(item.edge) * 100).toFixed(1)}%</b></span>
                <span>Confidence <b>{num(item.confidence)}%</b></span>
              </div>
            </div>
          ))}
          {!ranked.length && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-slate-400">
              No real AI opportunities yet. Sync Polymarket markets/order books first, then run scoring.
            </div>
          )}
        </div>
      </Panel>
    </AppShell>
  );
}
