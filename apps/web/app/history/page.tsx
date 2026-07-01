import { AppShell } from "@/components/app-shell";
import { Badge, Panel } from "@/components/ui";
import { getPortfolio } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const portfolio = await getPortfolio() as any;
  const trades = portfolio.trades || [];

  return (
    <AppShell>
      <Panel>
        <h2 className="text-2xl font-semibold">Trade History</h2>
        <div className="mt-5 grid gap-3">
          {trades.map((trade: any) => (
            <div key={trade.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div>
                <p className="font-medium">{trade.label || `${trade.market || "Market"} — ${trade.outcome || "Outcome"}`}</p>
                <p className="mt-1 text-sm text-slate-400">{trade.explanation}</p>
              </div>
              <Badge tone={trade.action === "ENTER" ? "green" : "cyan"}>{trade.action}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
