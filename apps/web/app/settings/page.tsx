import { AppShell } from "@/components/app-shell";
import { BotControls } from "@/components/bot-controls";
import { SettingsForm } from "@/components/settings-form";
import { SyncControls } from "@/components/sync-controls";
import { Badge, Panel } from "@/components/ui";
import { getLiveOrders, getLiveStatus } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [status, liveOrders] = await Promise.all([getLiveStatus(), getLiveOrders()]) as [any, any[]];
  const bot = status.bot || {};
  const live = bot.live_trading || {};

  return (
    <AppShell>
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Bot Settings</h2>
            <p className="mt-2 text-slate-400">Paper and real automation controls. Live trading requires VPS credentials, env enablement, caps, and emergency-stop clearance.</p>
          </div>
          <Badge tone={bot.enabled ? "green" : "amber"}>{bot.enabled ? "Bot On" : "Bot Paused"}</Badge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
            <p className="text-slate-500">Execution</p>
            <b className="mt-1 block text-white">{bot.execution_mode || "paper"}</b>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
            <p className="text-slate-500">Live readiness</p>
            <b className={live.ready ? "mt-1 block text-greenx" : "mt-1 block text-amberx"}>{live.ready ? "Ready" : "Locked"}</b>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
            <p className="text-slate-500">Dry run</p>
            <b className="mt-1 block text-white">{live.dry_run ? "Enabled" : "Disabled"}</b>
          </div>
        </div>
        <div className="mt-6"><BotControls /></div>
        <div className="mt-6"><SyncControls /></div>
        <SettingsForm initial={bot} />
      </Panel>
      <Panel className="mt-6">
        <h3 className="text-xl font-semibold">Live Order Audit</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-slate-500"><tr><th className="py-3">Status</th><th>Market</th><th>Outcome</th><th>Amount</th><th>Price</th><th>Reason</th><th>Time</th></tr></thead>
            <tbody>
              {liveOrders.map((order: any) => (
                <tr key={order.id} className="border-t border-white/10">
                  <td className="py-4"><Badge tone={order.status === "placed" ? "green" : order.status === "rejected" ? "red" : "amber"}>{order.status}</Badge></td>
                  <td>{order.market}</td>
                  <td>{order.outcome}</td>
                  <td>${Number(order.amount || 0).toFixed(2)}</td>
                  <td>{Number(order.intended_price || 0).toFixed(2)}</td>
                  <td className="text-slate-400">{order.rejection_reason || order.order_id || "-"}</td>
                  <td className="text-slate-500">{order.created_at}</td>
                </tr>
              ))}
              {!liveOrders.length && <tr><td colSpan={7} className="py-8 text-slate-400">No live order attempts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}

