"use client";

import { useEffect, useState } from "react";

type LogItem = {
  id?: number;
  created_at?: string;
  type?: string;
  message?: string;
};

export function LiveLogStream({ initial }: { initial: LogItem[] }) {
  const [logs, setLogs] = useState(initial);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8000";
    const source = new EventSource(`${baseUrl}/api/bot-log/stream`);
    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as LogItem;
        setLogs((current) => [payload, ...current].slice(0, 80));
      } catch {
        // Ignore malformed stream frames.
      }
    };
    return () => source.close();
  }, []);

  return (
    <div className="mt-6 space-y-3 font-mono text-sm">
      {logs.map((log, index) => (
        <div key={`${log.id || index}-${log.created_at}-${log.type}`} className="grid gap-2 rounded-2xl border border-white/10 bg-black/25 p-4 sm:grid-cols-[170px_90px_1fr]">
          <span className="text-slate-500">{log.created_at || "live"}</span>
          <span className="text-cyanx">{log.type || "WATCH"}</span>
          <span className="text-slate-300">{log.message}</span>
        </div>
      ))}
    </div>
  );
}
