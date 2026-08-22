"use client";

import NavItem from "@/components/ui/NavItem";
import { LogOutIcon } from "@/lib/icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { logoutAffiliate } from "@/lib/actions/auth";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/dashboard", labelKey: "nav.dashboard" },
  { href: "/catalog", labelKey: "nav.catalog" },
  { href: "/links", labelKey: "nav.links" },
  { href: "/codes", labelKey: "nav.codes" },
  { href: "/wallet", labelKey: "nav.wallet" },
  { href: "/performance", labelKey: "nav.performance" },
  { href: "/support", labelKey: "nav.support" },
];

const FOOTER_LINKS = [
  { href: "/profile", labelKey: "nav.profile" },
  { href: "/settings", labelKey: "nav.settings" },
];

// Inline small icons for each section
function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M12 12h.01" />
      <path d="M17 12h.01" />
      <path d="M7 12h.01" />
    </svg>
  );
}
function WalletIcon2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 10a2 2 0 0 1 0 4h-2v-4h2z" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}
function PerformanceIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function CatalogIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="3" width="6" height="6" rx="1" />
      <rect x="9" y="3" width="6" height="6" rx="1" />
      <rect x="16" y="3" width="6" height="6" rx="1" />
      <rect x="2" y="12" width="6" height="6" rx="1" />
      <rect x="9" y="12" width="6" height="6" rx="1" />
      <rect x="16" y="12" width="6" height="6" rx="1" />
    </svg>
  );
}
function SupportIconSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function ProfileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function SettingsIconSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  "/dashboard": DashboardIcon,
  "/catalog": CatalogIcon,
  "/links": LinkIcon,
  "/codes": CodeIcon,
  "/wallet": WalletIcon2,
  "/performance": PerformanceIcon,
  "/support": SupportIconSvg,
  "/profile": ProfileIcon,
  "/settings": SettingsIconSvg,
};

export default function DesktopSidebar() {
  const { t, isRTL } = useLanguage();
  const isAr = isRTL;

  return (
    <aside
      className="py-6 px-4 h-screen w-60 fixed inset-y-0 start-0 flex flex-col justify-between overflow-hidden hidden md:flex"
      style={{
        background: "linear-gradient(180deg, #0f1117 0%, #131720 100%)",
        borderInlineEnd: "1px solid rgba(99,102,241,0.12)",
      }}
    >
      {/* Top: Logo + Nav */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 pb-7 mb-1">
          <div
            className="p-2.5 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
            }}
          >
            {/* Affiliate portal icon — chain link */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">
              {t.nav.affiliatePortal}
            </p>
            <p className="text-xs leading-tight" style={{ color: "#6366f1" }}>
              {t.nav.marketingPartner}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-2 mb-5 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }} />

        {/* Main nav */}
        <nav className="flex flex-col gap-1 overflow-y-auto flex-1">
          {NAV_LINKS.map((link) => {
            const Icon = iconMap[link.href] ?? DashboardIcon;
            return (
              <NavItem
                key={link.href}
                href={link.href}
                label={t[link.labelKey]}
                icon={<Icon className="w-5 h-5" />}
              />
            );
          })}
        </nav>
      </div>

      {/* Bottom: Footer nav + logout */}
      <div className="flex flex-col gap-1">
        {/* Divider */}
        <div className="mx-2 mb-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }} />

        {FOOTER_LINKS.map((link) => {
          const Icon = iconMap[link.href] ?? DashboardIcon;
          return (
            <NavItem
              key={link.href}
              href={link.href}
              label={t[link.labelKey]}
              icon={<Icon className="w-5 h-5" />}
            />
          );
        })}

        <button
          onClick={async () => {
            await logoutAffiliate();
            window.location.href = '/login';
          }}
          className="w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-[background-color,color] duration-200 hover:bg-red-500/10 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
          style={{ color: "rgba(239,68,68,0.8)" }}
        >
          <LogOutIcon className="w-5 h-5 flex-shrink-0" />
          <span>{t.nav.logOut}</span>
        </button>
      </div>
    </aside>
  );
}