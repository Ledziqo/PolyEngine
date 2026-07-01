import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Panel, RatingBadge } from "@/components/ui";
import { getMarkets } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const markets = await getMarkets();
  const market = markets.find((item) => String(item.id) === id) || markets[0];
  const outcomes = market?.outcomes || [];
  const breakdown = market?.score_breakdown || market?.best_outcome?.score_breakdown || {};

  return (
    <AppShell>
      <Link href="/markets" className="text-sm text-cyanx">Back to markets</Link>
      <div className="mt-4 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel>
          <div className="flex flex-wrap gap-2">
            <Badge tone="green">Live market detail</Badge>
            <RatingBadge rating={market?.rating || "Watch"} />
            <Badge tone="cyan">Preferred {market?.preferred_pick || market?.best_outcome?.name || "-"}</Badge>
          </div>
          <h2 className="mt-4 text-3xl font-semibold">{market?.question || "Market unavailable"}</h2>
          <p className="mt-3 text-slate-400">Section: {market?.section || "trending"} | Liquidity ${Math.round(market?.liquidity || 0).toLocaleString()} | Volume ${Math.round(market?.volume || 0).toLocaleString()}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {outcomes.map((outcome) => (
              <div key={outcome.id || outcome.name} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">{outcome.name}</p>
                  <RatingBadge rating={outcome.rating} />
                </div>
                <p className="mt-3 text-4xl font-semibold">{outcome.price.toFixed(2)}</p>
                <p className={(outcome.edge || 0) >= 0 ? "mt-2 text-greenx" : "mt-2 text-redx"}>{(outcome.edge * 100).toFixed(1)}% edge</p>
                <p className="mt-2 text-sm text-slate-400">{outcome.confidence}% confidence | {(outcome.spread * 100).toFixed(1)}% spread</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <h3 className="text-xl font-semibold">Engine explanation</h3>
          <p className="mt-4 leading-7 text-slate-300">
            PolyEngine prefers {market?.preferred_pick || "the highest-rated outcome"} because it currently has the strongest blend of confidence, edge, liquidity, spread, depth, and risk score. The bot only enters this market if the rating passes the active risk mode.
          </p>
          <div className="mt-6 grid gap-3">
            <Badge tone="green">Action {market?.bot_action || "Watch"}</Badge>
            <Badge tone="cyan">Preferred {market?.preferred_pick || "-"}</Badge>
            <Badge tone="violet">Rating {market?.rating || "Watch"}</Badge>
          </div>
        </Panel>
      </div>
      <Panel className="mt-6">
        <h3 className="text-xl font-semibold">Score breakdown</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(breakdown).map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-cyanx to-violetx" style={{ width: `${Math.min(100, Number(value))}%` }} />
              </div>
              <p className="mt-2 text-sm text-slate-300">{Number(value).toFixed(1)}/100</p>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}

