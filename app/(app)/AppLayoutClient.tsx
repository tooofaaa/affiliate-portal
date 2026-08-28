"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { AffiliateProvider } from "@/lib/context/AffiliateContext";
import { VerificationProvider } from "@/lib/context/VerificationContext";
import VerificationModal from "@/components/ui/VerificationModal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type OnboardingStatus = "incomplete" | "submitted" | "approved" | "declined" | null;

interface AppLayoutClientProps {
  children: React.ReactNode;
  onboardingStatus: OnboardingStatus;
}

function VerificationBannerInline({ onboardingStatus }: { onboardingStatus: OnboardingStatus }) {
  const [dismissed, setDismissed] = useState(false);
  const { t, isRTL } = useLanguage();
  const tv = (t as Record<string, any>).verification ?? {};

  if (dismissed || onboardingStatus === "approved") return null;

  if (!onboardingStatus || onboardingStatus === "incomplete") {
    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-4 md:mx-6 mt-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 flex items-start gap-3 flex-wrap"
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-indigo-800">
            {tv.bannerBetaTitle ?? "Beta Mode"}
          </p>
          <p className="text-xs text-indigo-700 mt-0.5">
            {tv.bannerBetaDesc ?? "Your account is not yet verified. You can explore the platform freely. Verify your account to unlock real actions."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/onboarding"
            className="text-xs font-semibold text-indigo-700 underline whitespace-nowrap"
          >
            {tv.ctaVerify ?? "Verify Account"}
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-indigo-400 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
            aria-label="Dismiss banner"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (onboardingStatus === "submitted") {
    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-4 md:mx-6 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3 flex-wrap"
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-amber-800">
            {tv.bannerSubmittedTitle ?? "Verification Under Review"}
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            {tv.bannerSubmittedDesc ?? "Your documents have been submitted. Continue exploring while we review your verification."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/onboarding"
            className="text-xs font-semibold text-amber-700 underline whitespace-nowrap"
          >
            {tv.ctaViewStatus ?? "View Status"}
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-400 hover:text-amber-600 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded"
            aria-label="Dismiss banner"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (onboardingStatus === "declined") {
    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-4 md:mx-6 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3 flex-wrap"
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-red-800">
            {tv.bannerDeclinedTitle ?? "Verification Needs Attention"}
          </p>
          <p className="text-xs text-red-700 mt-0.5">
            {tv.bannerDeclinedDesc ?? "Some documents were declined. Please update your documents to unlock real actions."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/onboarding"
            className="text-xs font-semibold text-red-700 underline whitespace-nowrap"
          >
            {tv.ctaComplete ?? "Complete Verification"}
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-red-400 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded"
            aria-label="Dismiss banner"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function AppLayoutClient({ children, onboardingStatus }: AppLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const mainContentClasses = [
    "md:ms-60 w-full h-screen overflow-y-auto",
    isMobileSidebarOpen ? "overflow-hidden" : "",
  ].join(" ");

  return (
    <AffiliateProvider>
      <VerificationProvider onboardingStatus={onboardingStatus}>
        <div className="flex">
          <Sidebar
            isOpen={isMobileSidebarOpen}
            setIsOpen={setIsMobileSidebarOpen}
          />

          <div className={mainContentClasses}>
            <Topbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

            {/* VERIFICATION BANNER — shown for all unverified states */}
            <VerificationBannerInline onboardingStatus={onboardingStatus} />

            <main id="main-content" className="pt-4 px-4 md:px-6">
              {children}
            </main>
            <footer className="mt-8 py-4 px-6 text-center">
              <div
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs"
                style={{
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.1)",
                  color: "#94a3b8",
                }}
              >
                Developed by{" "}
                <span className="font-semibold text-indigo-400">Jupi Solutions</span>
              </div>
            </footer>
          </div>
        </div>

        <VerificationModal />
      </VerificationProvider>
    </AffiliateProvider>
  );
}