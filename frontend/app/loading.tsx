export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="relative flex flex-col items-center gap-6">
        {/* Frosty Blue Pulse Ring */}
        <div className="w-24 h-24 rounded-full border-4 border-sky-400/30 border-t-sky-400 animate-spin"></div>
        {/* Skeleton Backdrop */}
        <div className="absolute inset-0 blur-2xl bg-sky-500/20 rounded-full animate-pulse"></div>
        <p className="text-sky-300 font-mono text-sm tracking-widest animate-pulse">
          INITIALIZING TELEMETRY...
        </p>
      </div>
    </div>
  );
}
