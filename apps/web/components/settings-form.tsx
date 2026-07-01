"use client";

import { useState } from "react";

type SettingsPayload = {
  execution_mode: string;
  risk_mode: string;
  minimum_rating: string;
  max_trade_amount: number;
  max_total_exposure: number;
  min_liquidity: number;
  max_spread: number;
  take_profit: number;
  stop_loss: number;
  max_live_trade_amount: number;
  max_live_daily_spend: number;
  max_live_daily_loss: number;
  max_live_open_positions: number;
  btc5m_enabled: boolean;
  btc5m_max_trade_amount: number;
  btc5m_min_confidence: number;
};

export function SettingsForm({ initial }: { initial: Partial<SettingsPayload> }) {
  const [message, setMessage] = useState("Settings are loaded from the engine.");
  const [saving, setSaving] = useState(false);
  const [executionMode, setExecutionMode] = useState(String(initial.execution_mode || "paper"));

  async function submit(formData: FormData) {
    setSaving(true);
    const payload: SettingsPayload = {
      execution_mode: String(formData.get("execution_mode") || "paper"),
      risk_mode: String(formData.get("risk_mode") || "Balanced"),
      minimum_rating: String(formData.get("minimum_rating") || "Strong"),
      max_trade_amount: Number(formData.get("max_trade_amount") || 50),
      max_total_exposure: Number(formData.get("max_total_exposure") || 1500),
      min_liquidity: Number(formData.get("min_liquidity") || 25000),
      max_spread: Number(formData.get("max_spread") || 0.03),
      take_profit: Number(formData.get("take_profit") || 0.12),
      stop_loss: Number(formData.get("stop_loss") || 0.08),
      max_live_trade_amount: Number(formData.get("max_live_trade_amount") || 10),
      max_live_daily_spend: Number(formData.get("max_live_daily_spend") || 50),
      max_live_daily_loss: Number(formData.get("max_live_daily_loss") || 25),
      max_live_open_positions: Number(formData.get("max_live_open_positions") || 3),
      btc5m_enabled: formData.get("btc5m_enabled") === "on",
      btc5m_max_trade_amount: Number(formData.get("btc5m_max_trade_amount") || 5),
      btc5m_min_confidence: Number(formData.get("btc5m_min_confidence") || 72)
    };
    try {
      const response = await fetch("/api/bot/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Save failed");
      setMessage("Settings saved to engine.");
    } catch {
      setMessage("Could not reach engine. Make sure the engine container is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form action={submit}>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-300">
          Execution mode
          <select name="execution_mode" value={executionMode} onChange={(event) => setExecutionMode(event.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyanx">
            <option value="paper">paper</option>
            <option value="live_capped">live_capped</option>
            <option value="emergency_stopped">emergency_stopped</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          Risk level
          <select name="risk_mode" defaultValue={initial.risk_mode || "Balanced"} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyanx">
            <option>Safe</option>
            <option>Balanced</option>
            <option>Aggressive</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          Minimum rating to enter
          <select name="minimum_rating" defaultValue={initial.minimum_rating || "Strong"} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyanx">
            <option>Good</option>
            <option>Strong</option>
            <option>Best</option>
          </select>
        </label>
        {[
          ["max_trade_amount", "Max trade amount", initial.max_trade_amount ?? 50],
          ["max_total_exposure", "Max total exposure", initial.max_total_exposure ?? 1500],
          ["min_liquidity", "Minimum liquidity", initial.min_liquidity ?? 25000],
          ["max_spread", "Max spread", initial.max_spread ?? 0.03],
          ["take_profit", "Take profit", initial.take_profit ?? 0.12],
          ["stop_loss", "Stop loss", initial.stop_loss ?? 0.08],
          ["max_live_trade_amount", "Max live trade amount", initial.max_live_trade_amount ?? 10],
          ["max_live_daily_spend", "Max live daily spend", initial.max_live_daily_spend ?? 50],
          ["max_live_daily_loss", "Max live daily loss", initial.max_live_daily_loss ?? 25],
          ["max_live_open_positions", "Max live open positions", initial.max_live_open_positions ?? 3],
          ["btc5m_max_trade_amount", "BTC 5m max trade amount", initial.btc5m_max_trade_amount ?? 5],
          ["btc5m_min_confidence", "BTC 5m min confidence", initial.btc5m_min_confidence ?? 72]
        ].map(([name, label, value]) => (
          <label key={String(name)} className="grid gap-2 text-sm text-slate-300">
            {label}
            <input name={String(name)} type="number" step="0.01" defaultValue={String(value)} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyanx" />
          </label>
        ))}
        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300">
          <input name="btc5m_enabled" type="checkbox" defaultChecked={initial.btc5m_enabled ?? true} className="h-4 w-4 accent-cyanx" />
          Enable BTC 5m specialist
        </label>
      </div>
      <button disabled={saving} className="mt-6 rounded-xl bg-cyanx px-5 py-3 font-semibold text-black hover:bg-white">
        {saving ? "Saving..." : "Save settings"}
      </button>
      <p className="mt-3 text-sm text-slate-400">{message}</p>
      {executionMode === "live_capped" && <LiveCredentialsForm />}
    </form>
  );
}

export function ResetEngineForm() {
  const [message, setMessage] = useState("Reset paper trades, positions, logs, and bot state when the simulator gets messy.");
  const [resetting, setResetting] = useState(false);

  async function submit(formData: FormData) {
    const confirmed = window.confirm("Reset PolyEngine paper state? This clears paper trades, open positions, and bot logs.");
    if (!confirmed) return;
    setResetting(true);
    try {
      const response = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          starting_balance: Number(formData.get("starting_balance") || 10000),
          wipe_markets: formData.get("wipe_markets") === "on"
        })
      });
      if (!response.ok) throw new Error("Reset failed");
      const payload = await response.json();
      setMessage(`Reset complete. Paper balance is now $${Number(payload.starting_balance || 0).toLocaleString()}.`);
    } catch {
      setMessage("Reset failed. Make sure the engine container is running.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <form action={submit} className="mt-8 rounded-2xl border border-redx/30 bg-redx/5 p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-redx">Reset</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Reset paper engine</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-300">
          Starting balance
          <input name="starting_balance" type="number" step="100" defaultValue="10000" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-redx" />
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-slate-300">
          <input name="wipe_markets" type="checkbox" className="h-4 w-4 accent-redx" />
          Also wipe synced markets and resync from scratch
        </label>
      </div>
      <button disabled={resetting} className="mt-5 rounded-xl bg-redx px-5 py-3 font-semibold text-white hover:bg-white hover:text-black">
        {resetting ? "Resetting..." : "Reset everything"}
      </button>
    </form>
  );
}

function LiveCredentialsForm() {
  const [message, setMessage] = useState("Enter credentials only on your private VPS/domain. Saved values are encrypted and never shown again.");
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    setSaving(true);
    const payload = {
      polymarket_private_key: String(formData.get("polymarket_private_key") || ""),
      polymarket_funder_address: String(formData.get("polymarket_funder_address") || ""),
      polymarket_api_key: String(formData.get("polymarket_api_key") || ""),
      polymarket_api_secret: String(formData.get("polymarket_api_secret") || ""),
      polymarket_api_passphrase: String(formData.get("polymarket_api_passphrase") || "")
    };
    try {
      const response = await fetch("/api/live-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Credential save failed");
      const result = await response.json();
      setMessage(`Saved ${result.saved?.length || 0} credential fields. Missing: ${result.configured ? Object.entries(result.configured).filter(([, ok]) => !ok).map(([key]) => key).join(", ") || "none" : "refresh status"}.`);
    } catch {
      setMessage("Could not save credentials. Check that the engine container is running and APP_SECRET_KEY is set.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-amberx/30 bg-amberx/5 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-amberx">Real mode credentials</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Connect Polymarket trading account</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          These fields are required for real bot trading. Keep dry-run on until you verify orders in the live audit log.
        </p>
      </div>
      <form action={submit} className="mt-5 grid gap-4 md:grid-cols-2">
        {[
          ["polymarket_private_key", "Private key"],
          ["polymarket_funder_address", "Funder address"],
          ["polymarket_api_key", "CLOB API key"],
          ["polymarket_api_secret", "CLOB API secret"],
          ["polymarket_api_passphrase", "CLOB API passphrase"]
        ].map(([name, label]) => (
          <label key={name} className="grid gap-2 text-sm text-slate-300">
            {label}
            <input name={name} type="password" autoComplete="off" placeholder="Paste credential" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-amberx" />
          </label>
        ))}
        <div className="md:col-span-2">
          <button disabled={saving} className="rounded-xl bg-amberx px-5 py-3 font-semibold text-black hover:bg-white">
            {saving ? "Saving credentials..." : "Save encrypted credentials"}
          </button>
          <p className="mt-3 text-sm text-slate-400">{message}</p>
        </div>
      </form>
    </div>
  );
}
