import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/ui";

export default function SettingsPage() {
  return (
    <AppShell>
      <Panel>
        <h2 className="text-2xl font-semibold">Bot Settings</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {[
            ["Risk level", "Balanced"],
            ["Max trade amount", "$50"],
            ["Minimum liquidity", "$25,000"],
            ["Max spread", "3%"],
            ["Min confidence", "75%"],
            ["Max total exposure", "$1,500"]
          ].map(([label, value]) => (
            <label key={label} className="grid gap-2 text-sm text-slate-300">
              {label}
              <input defaultValue={value} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyanx" />
            </label>
          ))}
        </div>
        <button className="mt-6 rounded-xl bg-cyanx px-5 py-3 font-semibold text-black hover:bg-white">Save settings</button>
      </Panel>
    </AppShell>
  );
}
