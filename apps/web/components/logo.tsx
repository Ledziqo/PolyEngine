import Image from "next/image";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/brand/polyengine-logo.png"
        alt="PolyEngine"
        width={compact ? 360 : 420}
        height={compact ? 100 : 130}
        priority
        className={compact ? "h-16 w-auto min-w-[220px] object-contain sm:h-20 sm:min-w-[260px]" : "h-20 w-auto object-contain sm:h-24"}
      />
    </div>
  );
}
