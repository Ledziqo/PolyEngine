import { botLogs, opportunities } from "@/lib/demo-data";
import { Badge, Panel } from "./ui";

export function TerminalPreview() {
  return (
    <Panel className="relative overflow-hidden">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyanx/20 blur-3xl" />
      <div className="absolute -bottom-16 left-1/3 h-52 w-52 rounded-full bg-violetx/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Live Engine</p>
            <h3 className="mt-1 text-lg font-semibold">Opportunity scanner</h3>
          </div>
          <Badge tone="green">STREAMING</Badge>
        </div>
        <div className="mt-5 grid gap-3">
          {opportunities.slice(0, 2).map((item) => (
            <div key={item.market} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.market}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.outcome} outcome</p>
                </div>
                <Badge tone={item.confidence > 84 ? "green" : "violet"}>{item.confidence}% confidence</Badge>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
                <span className="text-slate-500">Price</span><span>{item.price}</span>
                <span className="text-slate-500">Edge</span><span className="text-greenx">+{item.edge}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-xs">
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
