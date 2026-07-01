import { AppShell } from "@/components/app-shell";
import { LiveLogStream } from "@/components/live-log-stream";
import { Badge, Panel } from "@/components/ui";
import { getLogs } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function BotLogPage() {
  const botLogs = await getLogs();

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
        <LiveLogStream initial={botLogs} />
      </Panel>
    </AppShell>
  );
}
