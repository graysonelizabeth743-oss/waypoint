import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream">
      {/* Pulse effect container */}
      <div className="relative flex items-center justify-center">
        {/* Soft back glowing ring */}
        <div className="absolute h-24 w-24 animate-ping rounded-full bg-ink/10" />

        {/* Animated outer ring */}
        <div className="h-28 w-28 animate-spin rounded-full border-4 border-ink/20 border-t-ink" />

        {/* Center Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Waypoint Relief Logo"
            width={48}
            height={48}
            className="h-12 w-12 object-contain animate-pulse"
            priority
          />
        </div>
      </div>

      {/* Text Branding */}
      <div className="mt-6 text-center">
        <h2 className="font-heading text-lg font-semibold tracking-wide text-ink">
          Waypoint Relief
        </h2>
        <p className="font-mono text-xs uppercase tracking-widest text-ink/60 animate-pulse mt-1">
          Loading donation network...
        </p>
      </div>
    </div>
  );
}
