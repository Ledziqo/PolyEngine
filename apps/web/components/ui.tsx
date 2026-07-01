import { clsx } from "clsx";

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("glass rounded-2xl p-5", className)}>{children}</div>;
}

export function Metric({ label, value, tone = "cyan" }: { label: string; value: string; tone?: "cyan" | "green" | "violet" | "amber" | "red" }) {
  const tones = {
    cyan: "text-cyanx",
    green: "text-greenx",
    violet: "text-violet-300",
    amber: "text-amberx",
    red: "text-redx"
  };

  return (
    <Panel>
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={clsx("mt-3 text-2xl font-semibold", tones[tone])}>{value}</p>
    </Panel>
  );
}

export function Badge({ children, tone = "cyan" }: { children: React.ReactNode; tone?: "cyan" | "green" | "violet" | "amber" | "red" }) {
  const tones = {
    cyan: "border-cyanx/30 bg-cyanx/10 text-cyanx",
    green: "border-greenx/30 bg-greenx/10 text-greenx",
    violet: "border-violetx/30 bg-violetx/10 text-violet-300",
    amber: "border-amberx/30 bg-amberx/10 text-amberx",
    red: "border-redx/30 bg-redx/10 text-redx"
  };

  return <span className={clsx("rounded-full border px-3 py-1 text-xs", tones[tone])}>{children}</span>;
}

export function RatingBadge({ rating }: { rating: string }) {
  const tone =
    rating === "Best" || rating === "Strong"
      ? "green"
      : rating === "Good"
        ? "cyan"
        : rating === "Watch"
          ? "violet"
          : rating === "Weak"
            ? "amber"
            : "red";

  return <Badge tone={tone}>{rating}</Badge>;
}
