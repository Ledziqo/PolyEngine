import { botLogs, opportunities } from "@/lib/demo-data";
import { Badge, Panel } from "./ui";

export function TerminalPreview() {
  const rows = [
    { label: "BTC 5m", value: "DOWN", tone: "amber", meta: "72s left" },
    { label: "Mode", value: "REAL + SIM", tone: "cyan", meta: "armed" },
    { label: "Rating", value: "BEST", tone: "green", meta: "91%" }
  ];

  return (
    <Panel className="relative overflow-hidden border-cyanx/20 shadow-[0_0_80px_rgba(34,211,238,0.12)]">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyanx/25 blur-3xl" />
      <div className="absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-violetx/25 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyanx to-transparent" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyanx">Live Execution Brain</p>
            <h3 className="mt-1 text-xl font-semibold">Autonomous scanner</h3>
          </div>
          <Badge tone="green">BOT ONLINE</Badge>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{row.label}</p>
              <p className={`mt-2 text-sm font-semibold ${row.tone === "green" ? "text-greenx" : row.tone === "amber" ? "text-amberx" : "text-cyanx"}`}>{row.value}</p>
              <p className="mt-1 text-xs text-slate-500">{row.meta}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3">
          {opportunities.slice(0, 2).map((item) => (
            <div key={item.market} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.market}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.outcome} outcome</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={item.confidence > 84 ? "green" : "violet"}>{item.confidence}%</Badge>
                  <Badge tone={item.confidence > 84 ? "green" : "cyan"}>{item.confidence > 84 ? "Best" : "Strong"}</Badge>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
                <span className="text-slate-500">Price</span><span>{item.price}</span>
                <span className="text-slate-500">Edge</span><span className="text-greenx">+{item.edge}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs">
          {botLogs.slice(0, 4).map(([time, type, text, tone]) => (
            <div key={`${time}-${type}`} className="flex gap-3 py-1 text-slate-300">
              <span className="text-slate-600">{time}</span>
              <span className={`w-14 text-${tone === "green" ? "greenx" : tone === "violet" ? "violet-300" : "cyanx"}`}>{type}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
