import { Badge, Metric, Panel } from "@/components/ui";
import { getBtc5m } from "@/lib/api";

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default async function BtcFiveMinutePage() {
  const payload = await getBtc5m() as any;
  const windows = payload.windows || [];
  const active = windows[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Badge tone="amber">BTC 5m specialist</Badge>
              <h2 className="mt-3 text-3xl font-semibold">Bitcoin Up/Down micro engine</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Dedicated scanner for Polymarket BTC 5-minute windows. It compares the price-to-beat, live BTC feeds, odds, spread, momentum, and timing before it allows paper or real entries.
              </p>
            </div>
            <Badge tone={active?.status === "enter" ? "green" : "violet"}>{active?.status || "waiting"}</Badge>
          </div>
          {active ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Pick" value={active.recommended_side} tone={active.recommended_side === "UP" ? "green" : active.recommended_side === "DOWN" ? "red" : "violet"} />
              <Metric label="Confidence" value={`${active.confidence}%`} tone="cyan" />
              <Metric label="Expected edge" value={pct(active.expected_edge || 0)} tone="green" />
              <Metric label="Max entry" value={`${(active.max_entry_price || 0).toFixed(2)}`} tone="amber" />
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-slate-400">
              No BTC 5-minute window is synced yet. Run Sync All or wait for the VPS worker to find the active recurring market.
            </div>
          )}
        </Panel>
        <Panel>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Live reference</p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Price to beat</span><b>${(active?.price_to_beat || 0).toFixed(2)}</b></div>
            <div className="flex justify-between"><span className="text-slate-400">BTC spot</span><b>${(active?.spot_price || 0).toFixed(2)}</b></div>
            <div className="flex justify-between"><span className="text-slate-400">Up odds</span><b>{pct(active?.up_price || 0)}</b></div>
            <div className="flex justify-between"><span className="text-slate-400">Down odds</span><b>{pct(active?.down_price || 0)}</b></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-slate-300">{active?.why || "Waiting for signal."}</div>
          </div>
        </Panel>
      </section>

      <Panel>
        <h3 className="text-xl font-semibold">Indicator Stack</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(active?.indicators || {}).map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{key.replaceAll("_", " ")}</p>
              <p className="mt-2 text-lg font-semibold">{typeof value === "number" ? value.toFixed(4) : String(value)}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <h3 className="text-xl font-semibold">Recent BTC 5m Windows</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-slate-500"><tr><th className="py-3">Window</th><th>Pick</th><th>Confidence</th><th>Edge</th><th>Up</th><th>Down</th><th>Status</th><th>Why</th></tr></thead>
            <tbody>
              {windows.map((window: any) => (
                <tr key={window.id} className="border-t border-white/10">
                  <td className="py-4">{window.slug}</td>
                  <td><Badge tone={window.recommended_side === "UP" ? "green" : window.recommended_side === "DOWN" ? "red" : "violet"}>{window.recommended_side}</Badge></td>
                  <td>{window.confidence}%</td>
                  <td>{pct(window.expected_edge || 0)}</td>
                  <td>{pct(window.up_price || 0)}</td>
                  <td>{pct(window.down_price || 0)}</td>
                  <td>{window.status}</td>
                  <td className="max-w-md text-slate-400">{window.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

