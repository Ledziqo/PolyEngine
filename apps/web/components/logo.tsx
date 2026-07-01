import Image from "next/image";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/brand/polyengine-logo.png"
        alt="PolyEngine"
        width={compact ? 260 : 320}
        height={compact ? 92 : 120}
        priority
        className={compact ? "h-12 w-auto min-w-[150px] object-contain sm:h-14 sm:min-w-[180px]" : "h-16 w-auto object-contain sm:h-20"}
      />
    </div>
  );
}
