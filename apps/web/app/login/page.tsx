import { Logo } from "@/components/logo";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/dashboard";
  const hasError = params.error === "invalid";

  return (
    <main className="flex min-h-screen items-center justify-center bg-graphite px-4 text-white">
      <div className="fixed inset-0 terminal-grid opacity-30" />
      <section className="glass relative w-full max-w-md rounded-3xl p-6">
        <Logo compact />
        <h1 className="mt-8 text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Private terminal access. Approved members can enter here.</p>
        {hasError ? (
          <div className="mt-5 rounded-xl border border-redx/30 bg-redx/10 px-4 py-3 text-sm text-redx">
            Invalid email or password.
          </div>
        ) : null}
        <form action="/auth/login" method="post" className="mt-8 grid gap-4" autoComplete="off">
          <input type="hidden" name="next" value={next} />
          <label className="grid gap-2 text-sm text-slate-300">
            Email
            <input name="email" type="email" autoComplete="off" placeholder="Email address" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyanx" />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Password
            <input name="password" type="password" autoComplete="new-password" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyanx" />
          </label>
          <button className="mt-2 rounded-xl bg-cyanx px-4 py-3 text-center font-semibold text-black hover:bg-white">
            Enter terminal
          </button>
        </form>
      </section>
    </main>
  );
}
