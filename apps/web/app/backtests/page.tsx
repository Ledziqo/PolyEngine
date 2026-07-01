import { Badge, Metric, Panel } from "@/components/ui";
import { getBacktests, getModelStatus } from "@/lib/api";

function money(value: number) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default async function BacktestsPage() {
  const [runs, model] = await Promise.all([getBacktests(), getModelStatus()]) as [any[], any];

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone={model.active ? "green" : "amber"}>{model.version}</Badge>
            <h2 className="mt-3 text-3xl font-semibold">Backtesting and model lab</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Train the short-term edge model, validate strategies, and compare paper/live rules before raising real caps.
            </p>
          </div>
          <Badge tone="cyan">Rows {model.training_rows}</Badge>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Validation AUC" value={(model.validation_auc || 0).toFixed(3)} tone="cyan" />
          <Metric label="Precision" value={`${((model.precision || 0) * 100).toFixed(1)}%`} tone="green" />
          <Metric label="Recall" value={`${((model.recall || 0) * 100).toFixed(1)}%`} tone="violet" />
        </div>
      </Panel>

      <Panel>
        <h3 className="text-xl font-semibold">Backtest Runs</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-slate-500"><tr><th className="py-3">ID</th><th>Strategy</th><th>Risk</th><th>PnL</th><th>ROI</th><th>Win Rate</th><th>Drawdown</th><th>Trades</th><th>Created</th></tr></thead>
            <tbody>
              {runs.map((run: any) => (
                <tr key={run.id} className="border-t border-white/10">
                  <td className="py-4">#{run.id}</td>
                  <td><Badge tone={run.strategy === "btc5m" ? "amber" : "cyan"}>{run.strategy}</Badge></td>
                  <td>{run.risk_mode}</td>
                  <td className={run.pnl >= 0 ? "text-greenx" : "text-redx"}>{money(run.pnl)}</td>
                  <td>{Number(run.roi || 0).toFixed(2)}%</td>
                  <td>{Number(run.win_rate || 0).toFixed(1)}%</td>
                  <td>{Number(run.max_drawdown || 0).toFixed(1)}%</td>
                  <td>{run.trade_count}</td>
                  <td className="text-slate-400">{run.created_at}</td>
                </tr>
              ))}
              {!runs.length && <tr><td colSpan={9} className="py-8 text-slate-400">No backtests yet. Use the API or Settings actions after enough snapshots are collected.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
