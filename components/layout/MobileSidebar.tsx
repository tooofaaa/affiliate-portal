"use client";

import NavItem from "@/components/ui/NavItem";
import { LogOutIcon } from "@/lib/icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { logoutAffiliate } from "@/lib/actions/auth";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", labelAr: "لوحة القيادة" },
  { href: "/links", label: "My Links", labelAr: "روابطي" },
  { href: "/codes", label: "Discount Codes", labelAr: "رموز الخصم" },
  { href: "/wallet", label: "Wallet", labelAr: "المحفظة" },
  { href: "/performance", label: "Performance", labelAr: "الأداء" },
  { href: "/support", label: "Support", labelAr: "الدعم" },
];

const FOOTER_LINKS = [
  { href: "/profile", label: "Profile", labelAr: "الملف الشخصي" },
  { href: "/settings", label: "Settings", labelAr: "الإعدادات" },
];

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
function SupportIcon(props: React.SVGProps<SVGSVGElement>) {
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
  "/links": LinkIcon,
  "/codes": CodeIcon,
  "/wallet": WalletIcon2,
  "/performance": PerformanceIcon,
  "/support": SupportIcon,
  "/profile": ProfileIcon,
  "/settings": SettingsIconSvg,
};

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function MobileSidebar({ isOpen, setIsOpen }: MobileSidebarProps) {
  const { isRTL } = useLanguage();
  const isAr = isRTL;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Panel */}
      <aside
        className="fixed top-0 bottom-0 z-50 w-64 flex flex-col justify-between transition-transform duration-300 md:hidden py-6 px-4"
        style={{
          background: "linear-gradient(180deg, #0f1117 0%, #131720 100%)",
          borderRight: isRTL ? "none" : "1px solid rgba(99,102,241,0.15)",
          borderLeft: isRTL ? "1px solid rgba(99,102,241,0.15)" : "none",
          left: isRTL ? "auto" : 0,
          right: isRTL ? 0 : "auto",
          transform: isOpen
            ? "translateX(0)"
            : isRTL
            ? "translateX(100%)"
            : "translateX(-100%)",
        }}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-3 px-2 pb-7 mb-1">
            <div
              className="p-2.5 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight">
                {isAr ? "بوابة الشركاء" : "Affiliate Portal"}
              </p>
              <p className="text-xs leading-tight" style={{ color: "#6366f1" }}>
                {isAr ? "شريك تسويقي" : "Marketing Partner"}
              </p>
            </div>
          </div>

          <div
            className="mx-2 mb-5"
            style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
          />

          <nav className="flex flex-col gap-1 overflow-y-auto">
            <div onClick={() => setIsOpen(false)}>
              {NAV_LINKS.map((link) => {
                const Icon = iconMap[link.href] ?? DashboardIcon;
                return (
                  <NavItem
                    key={link.href}
                    href={link.href}
                    label={isAr ? link.labelAr : link.label}
                    icon={<Icon className="w-5 h-5" />}
                  />
                );
              })}
            </div>
          </nav>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <div
            className="mx-2 mb-3"
            style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
          />

          <div onClick={() => setIsOpen(false)}>
            {FOOTER_LINKS.map((link) => {
              const Icon = iconMap[link.href] ?? DashboardIcon;
              return (
                <NavItem
                  key={link.href}
                  href={link.href}
                  label={isAr ? link.labelAr : link.label}
                  icon={<Icon className="w-5 h-5" />}
                />
              );
            })}
          </div>

          <button
            onClick={async () => {
              await logoutAffiliate();
              window.location.href = '/login';
            }}
            className="w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mt-2"
            style={{ color: "rgba(239,68,68,0.8)" }}
          >
            <LogOutIcon className="w-5 h-5 flex-shrink-0" />
            <span>{isAr ? "تسجيل الخروج" : "Log Out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
