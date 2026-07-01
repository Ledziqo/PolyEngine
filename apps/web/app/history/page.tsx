import { AppShell } from "@/components/app-shell";
import { Badge, Panel } from "@/components/ui";

export default function HistoryPage() {
  return (
    <AppShell>
      <Panel>
        <h2 className="text-2xl font-semibold">Trade History</h2>
        <div className="mt-5 grid gap-3">
          {[
            ["ENTER", "Paper buy Fed YES $48 at 0.42", "green"],
            ["EXIT", "Closed CPI NO +8.1% after take profit", "cyan"],
            ["SKIP", "Election market skipped because spread exceeded max", "amber"]
          ].map(([type, text, tone]) => (
            <div key={text} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p>{text}</p>
              <Badge tone={tone as "green" | "cyan" | "amber"}>{type}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
