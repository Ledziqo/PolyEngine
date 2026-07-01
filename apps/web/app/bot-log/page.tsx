import { AppShell } from "@/components/app-shell";
import { Badge, Panel } from "@/components/ui";
import { botLogs } from "@/lib/demo-data";

export default function BotLogPage() {
  return (
    <AppShell>
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Live Bot Log</h2>
            <p className="mt-2 text-slate-400">The Python engine will stream every thought, skip, entry, exit, and error here.</p>
          </div>
          <Badge tone="green">Streaming demo</Badge>
        </div>
        <div className="mt-6 space-y-3 font-mono text-sm">
          {botLogs.concat(botLogs).map(([time, type, text], index) => (
            <div key={`${time}-${type}-${index}`} className="grid gap-2 rounded-2xl border border-white/10 bg-black/25 p-4 sm:grid-cols-[90px_90px_1fr]">
              <span className="text-slate-500">{time}</span>
              <span className="text-cyanx">{type}</span>
              <span className="text-slate-300">{text}</span>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
