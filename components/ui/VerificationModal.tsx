"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useVerification } from "@/lib/context/VerificationContext";

export default function VerificationModal() {
  const { t, isRTL } = useLanguage();
  const { modalOpen, closeVerificationModal } = useVerification();
  const tv = (t as Record<string, any>).verification ?? {};

  if (!modalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir={isRTL ? "rtl" : "ltr"}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeVerificationModal}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-5"
          style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{tv.modalTitle ?? "Verification Required"}</h2>
            </div>
          </div>
        </div>
        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            {tv.modalDesc ?? "This action requires a verified account. You can freely explore the platform in beta mode, but verification is required to complete this action."}
          </p>
        </div>
        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <Link
            href="/onboarding"
            onClick={closeVerificationModal}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", boxShadow: "0 4px 15px rgba(168,85,247,0.35)" }}
          >
            {tv.modalCtaVerify ?? "Verify Now"}
          </Link>
          <button
            onClick={closeVerificationModal}
            className="w-full flex items-center justify-center px-5 py-3 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:outline-none"
          >
            {tv.modalCtaCancel ?? "Continue Exploring"}
          </button>
        </div>
      </div>
    </div>
  );
}