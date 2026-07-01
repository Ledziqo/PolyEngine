"use client";

import { useState } from "react";

export function SyncControls() {
  const [message, setMessage] = useState("Use this after deploy to populate live Polymarket data.");
  const [loading, setLoading] = useState(false);

  async function syncAll() {
    setLoading(true);
    try {
      const response = await fetch("/api/sync/all", { method: "POST" });
      if (!response.ok) throw new Error("Sync failed");
      const payload = await response.json();
      setMessage(`Synced ${payload.markets?.synced || 0} markets, ${payload.order_books?.synced || 0} order books, scored ${payload.score?.scored || 0} outcomes.`);
    } catch {
      setMessage("Could not reach engine. Make sure the engine and worker containers are running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Live data sync</p>
          <p className="mt-1 text-sm text-slate-400">{message}</p>
        </div>
        <button onClick={syncAll} disabled={loading} className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-cyanx">
          {loading ? "Syncing..." : "Sync Polymarket Now"}
        </button>
      </div>
    </div>
  );
}
