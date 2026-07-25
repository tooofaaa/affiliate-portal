"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { AffiliateProvider } from "@/lib/context/AffiliateContext";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // md:ms-60 uses logical margin-inline-start — automatically flips
  // to the correct side in both LTR and RTL without any manual isRTL check.
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
};

export default AppLayout;
