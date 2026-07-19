import React from "react";

export default function Loading() {
  return (
    <div className="premium-loader-overlay">
      <div className="flex flex-col items-center gap-4 p-6 bg-white/90 rounded-2xl shadow-xl border border-indigo-50/50">
        <div className="loading-spinner-ring"></div>
        <p className="text-xs font-semibold text-slate-500 animate-pulse uppercase tracking-wider">
          Loading Workspace
        </p>
      </div>
    </div>
  );
}
