import { Logo } from "@/components/logo";

export default function RequestAccessPage() {
  const telegramUrl = "https://t.me/Aesliex";

  return (
    <main className="flex min-h-screen items-center justify-center bg-graphite px-4 py-10 text-white">
      <div className="fixed inset-0 terminal-grid opacity-30" />
      <section className="glass relative w-full max-w-2xl rounded-3xl p-6 sm:p-8">
        <Logo compact />
        <p className="mt-8 text-sm uppercase tracking-[0.28em] text-cyanx">Private product</p>
        <h1 className="mt-3 text-3xl font-semibold">Request PolyEngine access</h1>
        <p className="mt-3 leading-7 text-slate-300">
          PolyEngine is invite-only. To request access, message <span className="text-cyanx">@Aesliex</span> on Telegram with your name, intended use, and subscription request.
        </p>
        <div className="mt-8">
          <a href={telegramUrl} className="rounded-xl bg-cyanx px-4 py-3 text-center font-semibold text-black hover:bg-white">
            Message @Aesliex
          </a>
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-slate-400">
          Send your name, intended use, and subscription request directly in Telegram. Access is manually approved.
        </div>
      </section>
    </main>
  );
}
