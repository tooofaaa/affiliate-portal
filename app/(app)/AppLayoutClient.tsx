"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { AffiliateProvider } from "@/lib/context/AffiliateContext";
import DemoModeBanner from "@/components/ui/DemoModeBanner";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface AppLayoutClientProps {
  children: React.ReactNode;
  onboardingStatus: string;
}

export default function AppLayoutClient({ children, onboardingStatus }: AppLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { t } = useLanguage();

  const mainContentClasses = [
    "md:ms-60 w-full h-screen overflow-y-auto",
    isMobileSidebarOpen ? "overflow-hidden" : "",
  ].join(" ");

  return (
    <AffiliateProvider>
      <div className="flex">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          setIsOpen={setIsMobileSidebarOpen}
        />

        <div className={mainContentClasses}>
          <Topbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

          {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <DemoModeBanner />}

          {/* Onboarding status banners */}
          {onboardingStatus === "submitted" && (
            <div
              className="mx-4 md:mx-6 mt-3 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.3)",
                color: "#92400e",
              }}
            >
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {t.onboarding.submittedBanner}
            </div>
          )}

          {onboardingStatus === "declined" && (
            <div
              className="mx-4 md:mx-6 mt-3 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between gap-2"
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#991b1b",
              }}
            >
              <span className="flex items-center gap-2">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                {t.onboarding.declinedBanner}
              </span>
              <Link
                href="/onboarding"
                className="text-xs font-bold underline flex-shrink-0"
                style={{ color: "#dc2626" }}
              >
                {t.onboarding.goToOnboarding}
              </Link>
            </div>
          )}

          <main className="pt-4 px-4 md:px-6">
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
    </AffiliateProvider>
  );
}
