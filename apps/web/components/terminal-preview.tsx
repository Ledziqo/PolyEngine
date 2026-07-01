export function TerminalPreview() {
  const rows = [
    { label: "BTC 5m", value: "DOWN", tone: "amber", meta: "72s left" },
    { label: "Mode", value: "REAL + SIM", tone: "cyan", meta: "armed" },
    { label: "Rating", value: "BEST", tone: "green", meta: "91%" }
  ];
  const opportunities = [
    { market: "BTC 5m active window", outcome: "Down", confidence: 91, price: 0.52, edge: 8 },
    { market: "High-volume Polymarket setup", outcome: "Best pick", confidence: 84, price: 0.61, edge: 5 }
  ];
  const botLogs = [
    ["14:08:22", "SCAN", "Checked live high-volume markets", "cyan"],
    ["14:08:24", "SCORE", "Ranked outcomes by bot probability", "violet"],
    ["14:08:25", "CHECK", "Liquidity, spread, and risk rules passed", "green"],
    ["14:08:26", "ENTER", "Bot prepared execution and simulator mirror", "green"]
  ];

  return (
    <div className="relative overflow-hidden rounded-[1.65rem] border border-cyanx/20 bg-[#eef8ff] p-5 text-slate-950 shadow-2xl shadow-cyanx/10">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(255,255,255,0.72)_38%,rgba(99,102,241,0.16))]" />
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyanx/35 blur-3xl" />
      <div className="absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-blue-500/25 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyanx to-transparent" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyanx">Live Execution Brain</p>
            <h3 className="mt-1 text-xl font-semibold">Autonomous scanner</h3>
          </div>
          <span className="rounded-full border border-greenx/25 bg-greenx/10 px-3 py-1 text-xs font-semibold text-greenx">BOT ONLINE</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-2xl border border-cyanx/15 bg-white/75 p-3 shadow-sm shadow-cyanx/5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{row.label}</p>
              <p className={`mt-2 text-sm font-semibold ${row.tone === "green" ? "text-greenx" : row.tone === "amber" ? "text-amberx" : "text-cyanx"}`}>{row.value}</p>
              <p className="mt-1 text-xs text-slate-500">{row.meta}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3">
          {opportunities.map((item) => (
            <div key={item.market} className="rounded-2xl border border-cyanx/15 bg-white/80 p-4 shadow-sm shadow-cyanx/5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.market}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.outcome} outcome</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${item.confidence > 84 ? "border-greenx/25 bg-greenx/10 text-greenx" : "border-violetx/25 bg-violetx/10 text-violetx"}`}>{item.confidence}%</span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${item.confidence > 84 ? "border-greenx/25 bg-greenx/10 text-greenx" : "border-cyanx/25 bg-cyanx/10 text-cyanx"}`}>{item.confidence > 84 ? "Best" : "Strong"}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
                <span className="text-slate-500">Price</span><span>{item.price}</span>
                <span className="text-slate-500">Edge</span><span className="text-greenx">+{item.edge}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs shadow-inner">
          {botLogs.slice(0, 4).map(([time, type, text, tone]) => (
            <div key={`${time}-${type}`} className="flex gap-3 py-1 text-slate-300">
              <span className="text-slate-600">{time}</span>
                  <span className={tone === "green" ? "w-14 text-greenx" : tone === "violet" ? "w-14 text-violet-300" : "w-14 text-cyanx"}>{type}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
