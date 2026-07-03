"use client";

import NavItem from "@/components/ui/NavItem";
import { LogOutIcon } from "@/lib/icons";
import { MAIN_NAV_LINKS, FOOTER_NAV_LINKS } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { logoutCustomer } from "@/lib/actions/auth";

export default function DesktopSidebar() {
  const { t } = useLanguage();
  const navLabels = t.nav;

  const navLabelMap: Record<string, string> = {
    "/dashboard": navLabels.dashboard,
    "/suppliers": navLabels.suppliers,
    "/orders": navLabels.orders,
    "/cart": navLabels.cart,
    "/profile": navLabels.profile,
    "/settings": navLabels.settings,
    "/wallet": navLabels.wallet,
    "/membership": navLabels.membership,
    "/warehouse": navLabels.warehouse,
  };

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
            {/* Customer Portal icon — cart/bag */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">
              {t.brandName}
            </p>
            <p className="text-xs leading-tight" style={{ color: "#6366f1" }}>
              {t.brandTagline}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="mx-2 mb-5"
          style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
        />

        {/* Main nav */}
        <nav className="flex flex-col gap-1">
          {MAIN_NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavItem
                key={link.href}
                href={link.href}
                label={navLabelMap[link.href] ?? link.label}
                icon={<Icon className="w-5 h-5" />}
              />
            );
          })}
        </nav>
      </div>

      {/* Bottom: Footer nav + logout */}
      <div className="flex flex-col gap-1">
        {/* Divider */}
        <div
          className="mx-2 mb-3"
          style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
        />

        {FOOTER_NAV_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <NavItem
              key={link.href}
              href={link.href}
              label={navLabelMap[link.href] ?? link.label}
              icon={<Icon className="w-5 h-5" />}
            />
          );
        })}

        <button
          onClick={async () => {
            await logoutCustomer();
            window.location.href = '/login';
          }}
          className="w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ color: "rgba(239,68,68,0.8)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(239,68,68,0.1)";
            (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
            (e.currentTarget as HTMLButtonElement).style.color =
              "rgba(239,68,68,0.8)";
          }}
        >
          <LogOutIcon className="w-5 h-5 flex-shrink-0" />
          <span>{navLabels.logOut}</span>
        </button>
      </div>
    </aside>
  );
}
