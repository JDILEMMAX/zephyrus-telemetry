'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Atmospheric telemetry error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="relative max-w-md w-full bg-slate-900/40 backdrop-blur-xl border border-sky-500/30 rounded-2xl p-8 shadow-[0_0_40px_-10px_rgba(56,189,248,0.15)] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-sky-100 mb-2 font-mono tracking-tight">ATMOSPHERIC TELEMETRY DISCONNECTED</h2>
          <p className="text-sm text-sky-200/70">
            The data pipeline encountered a severe anomaly attempting to route to the Universal Port.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="w-full py-3 px-4 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 rounded-xl transition-all duration-200 text-sky-100 font-medium font-mono text-sm tracking-wide"
        >
          RETRY CONNECTION
        </button>
      </div>
    </div>
  );
}
