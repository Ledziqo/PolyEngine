import Link from "next/link";
import { Logo } from "@/components/logo";

export default function RequestAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-graphite px-4 py-10 text-white">
      <div className="fixed inset-0 terminal-grid opacity-30" />
      <section className="glass relative w-full max-w-2xl rounded-3xl p-6 sm:p-8">
        <Logo compact />
        <h1 className="mt-8 text-3xl font-semibold">Request PolyEngine access</h1>
        <p className="mt-2 text-slate-400">Tell us who you are and we’ll route you to Telegram for approval.</p>
        <form className="mt-8 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input placeholder="Name" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyanx" />
            <input placeholder="Email" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyanx" />
          </div>
          <input placeholder="Telegram or WhatsApp handle" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyanx" />
          <textarea placeholder="What do you want to use PolyEngine for?" rows={5} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyanx" />
          <Link href="/access-pending" className="rounded-xl bg-cyanx px-4 py-3 text-center font-semibold text-black hover:bg-white">
            Submit request
          </Link>
        </form>
      </section>
    </main>
  );
}
