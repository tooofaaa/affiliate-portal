"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CatalogPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
          {t.catalog.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          {t.catalog.subtitle}
        </p>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Memberships */}
        <div
          className="bg-white rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200"
          style={{ border: "1px solid rgba(99,102,241,0.1)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#0f172a" }}>
              {t.catalog.memberships}
            </h2>
            <p className="text-sm mt-2" style={{ color: "#64748b" }}>
              {t.catalog.membershipsDesc}
            </p>
          </div>
          <div className="mt-auto">
            <Link
              href="/catalog/memberships"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
            >
              {t.catalog.browse}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>

        {/* Packages */}
        <div
          className="bg-white rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200"
          style={{ border: "1px solid rgba(99,102,241,0.1)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="12" x2="12" y2="16" />
              <line x1="10" y1="14" x2="14" y2="14" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#0f172a" }}>
              {t.catalog.packages}
            </h2>
            <p className="text-sm mt-2" style={{ color: "#64748b" }}>
              {t.catalog.packagesDesc}
            </p>
          </div>
          <div className="mt-auto">
            <Link
              href="/catalog/packages"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
            >
              {t.catalog.browse}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>

        {/* Products */}
        <div
          className="bg-white rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200"
          style={{ border: "1px solid rgba(99,102,241,0.1)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#0f172a" }}>
              {t.catalog.products}
            </h2>
            <p className="text-sm mt-2" style={{ color: "#64748b" }}>
              {t.catalog.productsDesc}
            </p>
          </div>
          <div className="mt-auto">
            <Link
              href="/catalog/products"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}
            >
              {t.catalog.browse}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
