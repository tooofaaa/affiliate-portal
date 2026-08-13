"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DemoModeBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { t, isRTL } = useLanguage();
  const td = (t as any).demo ?? {};

  if (dismissed) return null;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full bg-amber-500 text-white px-4 py-2 flex items-center justify-between gap-3 text-xs font-semibold flex-wrap"
    >
      <div className="flex items-center gap-2">
        <span>🧪</span>
        <span>{td.bannerLabel ?? "Demo Mode"}</span>
        <span className="font-normal opacity-90">—</span>
        <span className="font-normal opacity-90">
          {td.bannerDesc ?? "Testing environment. Any credentials accepted."}
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="opacity-80 hover:opacity-100 transition-opacity shrink-0"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
