import Image from "next/image";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/brand/polyengine-logo.png"
        alt="PolyEngine"
        width={compact ? 132 : 220}
        height={compact ? 88 : 146}
        priority
        className={compact ? "h-10 w-auto object-contain" : "h-14 w-auto object-contain"}
      />
    </div>
  );
}
