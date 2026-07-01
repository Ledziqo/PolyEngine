"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { Badge, Metric, Panel } from "@/components/ui";
import { botLogs, opportunities, pnlCurve } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Paper balance" value="$10,291" tone="green" />
        <Metric label="Open exposure" value="$428" tone="cyan" />
        <Metric label="Bot confidence" value="82%" tone="violet" />
        <Metric label="Markets watched" value="128" tone="amber" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Portfolio</p>
              <h2 className="mt-1 text-xl font-semibold">Intraday PnL</h2>
            </div>
            <Badge tone="green">+2.91%</Badge>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlCurve}>
                <defs>
                  <linearGradient id="pnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16d9e3" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={["dataMin - 80", "dataMax + 80"]} />
                <Tooltip contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="value" stroke="#16d9e3" fill="url(#pnl)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Live bot log</p>
          <div className="mt-4 space-y-3 font-mono text-xs">
            {botLogs.map(([time, type, text]) => (
              <div key={`${time}-${type}`} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <span className="text-slate-500">{time}</span> <span className="text-cyanx">{type}</span>
                <p className="mt-1 text-slate-300">{text}</p>
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
                <th className="py-3">Grade</th><th>Market</th><th>Outcome</th><th>Price</th><th>Fair</th><th>Edge</th><th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((item) => (
                <tr key={item.market} className="border-t border-white/10">
                  <td className="py-4"><Badge tone={item.confidence > 80 ? "green" : "amber"}>{item.grade}</Badge></td>
                  <td>{item.market}</td><td>{item.outcome}</td><td>{item.price}</td><td>{Math.round(item.fair * 100)}%</td><td className="text-greenx">+{item.edge}%</td><td>{item.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
