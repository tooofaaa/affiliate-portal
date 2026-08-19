"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { AffiliateProvider } from "@/lib/context/AffiliateContext";

interface AppLayoutClientProps {
  children: React.ReactNode;
  onboardingStatus: string;
}

export default function AppLayoutClient({ children, onboardingStatus }: AppLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
              <span>⏳</span>
              Your documents are under review. You&apos;ll be notified once approved.
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
                <span>⚠️</span>
                Some documents were declined. Please review and resubmit.
              </span>
              <Link
                href="/onboarding"
                className="text-xs font-bold underline flex-shrink-0"
                style={{ color: "#dc2626" }}
              >
                Go to Onboarding
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
