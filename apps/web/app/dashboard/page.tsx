import { AppShell } from "@/components/app-shell";
import { BotControls } from "@/components/bot-controls";
import { Badge, Metric, Panel, RatingBadge } from "@/components/ui";
import { getLiveStatus, getLogs, getOpportunities, getPortfolio } from "@/lib/api";
import { pnlCurve } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [status, portfolio, botLogs, opportunities] = await Promise.all([getLiveStatus(), getPortfolio(), getLogs(), getOpportunities()]);
  const bot = (status as any).bot || {};

  return (
    <AppShell>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Paper balance" value={`$${Math.round((portfolio as any).balance || 0).toLocaleString()}`} tone="green" />
        <Metric label="Open exposure" value={`$${Math.round((portfolio as any).exposure || 0).toLocaleString()}`} tone="cyan" />
        <Metric label="Open positions" value={String((status as any).open_positions || 0)} tone="violet" />
        <Metric label="Markets watched" value={String((status as any).markets || 0)} tone="amber" />
      </div>
      <Panel className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Bot control</p>
            <h2 className="mt-1 text-2xl font-semibold">{bot.enabled ? "Automatic bot is on" : "Automatic bot is paused"}</h2>
            <p className="mt-2 text-sm text-slate-400">{bot.message || "Waiting for engine status."}</p>
          </div>
          <BotControls />
        </div>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Risk mode <b className="text-cyanx">{bot.risk_mode || "Balanced"}</b></div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Minimum entry <b className="text-greenx">{bot.minimum_rating || "Strong"}</b></div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Live-money trading <b className="text-redx">Disabled</b></div>
        </div>
      </Panel>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Portfolio</p>
              <h2 className="mt-1 text-xl font-semibold">Intraday PnL</h2>
            </div>
            <Badge tone="green">+2.91%</Badge>
          </div>
          <div className="mt-6 flex h-72 items-end gap-3 rounded-2xl border border-white/10 bg-black/20 p-5">
            {pnlCurve.map((point) => {
              const height = Math.max(16, ((point.value - 9900) / 450) * 100);
              return (
                <div key={point.t} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-xl bg-gradient-to-t from-violetx to-cyanx" style={{ height: `${height}%` }} />
                  <span className="text-xs text-slate-500">{point.t}</span>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Live bot log</p>
          <div className="mt-4 space-y-3 font-mono text-xs">
            {botLogs.slice(0, 7).map((log) => (
              <div key={log.id || `${log.created_at}-${log.type}`} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <span className="text-slate-500">{log.created_at}</span> <span className="text-cyanx">{log.type}</span>
                <p className="mt-1 text-slate-300">{log.message}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Best opportunities</h2>
          <Badge tone="cyan">Demo feed</Badge>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-3">Rating</th><th>Market</th><th>Pick</th><th>Action</th><th>Price</th><th>Fair</th><th>Edge</th><th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((item) => (
                <tr key={item.market} className="border-t border-white/10">
                  <td className="py-4"><RatingBadge rating={item.rating} /></td>
                  <td>{item.market}</td><td className="text-cyanx">{item.name}</td><td><Badge tone={item.bot_action === "Enter" ? "green" : "violet"}>{item.bot_action}</Badge></td><td>{item.price.toFixed(2)}</td><td>{Math.round(item.fair_probability * 100)}%</td><td className="text-greenx">{(item.edge * 100).toFixed(1)}%</td><td>{item.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}

