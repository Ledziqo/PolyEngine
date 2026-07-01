import Link from "next/link";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-graphite px-4 text-white">
      <div className="fixed inset-0 terminal-grid opacity-30" />
      <section className="glass relative w-full max-w-md rounded-3xl p-6">
        <Logo compact />
        <h1 className="mt-8 text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Private terminal access for approved users.</p>
        <form className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm text-slate-300">
            Email
            <input className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyanx" defaultValue="Aesliexx@gmail.com" />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Password
            <input type="password" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyanx" defaultValue="Mudi2005" />
          </label>
          <Link href="/dashboard" className="mt-2 rounded-xl bg-cyanx px-4 py-3 text-center font-semibold text-black hover:bg-white">
            Enter terminal
          </Link>
        </form>
        <p className="mt-6 text-sm text-slate-500">
          Need access? <Link className="text-cyanx" href="/request-access">Request an invite</Link>
        </p>
      </section>
    </main>
  );
}
