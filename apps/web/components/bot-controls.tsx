"use client";

import { useState } from "react";

type BotControlAction = "enable" | "pause" | "emergency_stop";

export function BotControls({ initialState = "paused", initialMessage = "Owner can start autonomous bot trading when ready." }: { initialState?: string; initialMessage?: string }) {
  const [state, setState] = useState(initialState);
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState<BotControlAction | null>(null);

  async function send(action: BotControlAction) {
    setLoading(action);
    try {
      const response = await fetch("/api/bot/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (!response.ok) throw new Error("Bot control failed");
      const payload = await response.json();
      setState(payload.state);
      setMessage(payload.message);
    } catch {
      const fallback = action === "enable" ? "enabled" : action === "pause" ? "paused" : "stopped";
      setState(fallback);
      setMessage("Engine API did not confirm the change. Check that the engine container is running.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button onClick={() => send("enable")} className="rounded-xl bg-greenx px-5 py-3 font-semibold text-black hover:bg-white" disabled={loading !== null}>
          {loading === "enable" ? "Starting..." : state === "enabled" ? "Bot On" : "Turn Bot On"}
        </button>
        <button onClick={() => send("pause")} className="rounded-xl border border-amberx/40 bg-amberx/10 px-5 py-3 font-semibold text-amberx hover:bg-amberx/20" disabled={loading !== null}>
          {loading === "pause" ? "Pausing..." : "Pause Bot"}
        </button>
        <button onClick={() => send("emergency_stop")} className="rounded-xl border border-redx/40 bg-redx/10 px-5 py-3 font-semibold text-redx hover:bg-redx/20" disabled={loading !== null}>
          {loading === "emergency_stop" ? "Stopping..." : "Emergency Stop"}
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-400">State: <b className={state === "enabled" ? "text-greenx" : "text-cyanx"}>{state}</b> | {message}</p>
    </div>
  );
}

