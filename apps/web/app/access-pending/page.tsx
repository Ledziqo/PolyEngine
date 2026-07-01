import Link from "next/link";

export default function AccessPendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-graphite px-4 text-white">
      <section className="glass max-w-xl rounded-3xl p-8 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-cyanx">Request received</p>
        <h1 className="mt-4 text-4xl font-semibold">Subscription approval required</h1>
        <p className="mt-5 leading-7 text-slate-300">
          Please message <span className="text-cyanx">@Aesliex</span> on Telegram to request a subscription and activate your private access.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a className="rounded-full bg-cyanx px-6 py-3 font-semibold text-black" href="https://t.me/Aesliex">Message Telegram</a>
          <Link className="rounded-full border border-white/10 px-6 py-3 font-semibold text-white" href="/">Back home</Link>
        </div>
      </section>
    </main>
  );
}
