"use client";

import { useState, useRef, useEffect } from "react";
import { HamburgerIcon, LogOutIcon } from "@/lib/icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { logoutAffiliate } from "@/lib/actions/auth";
import NotificationDropdown from "@/components/layout/NotificationDropdown";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { t, language, toggleLanguage, isRTL } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    let active = true;
    async function loadUserName() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) return;
        if (user && active) {
          const { data } = await supabase.from("affiliates").select("name").eq("portal_user_id", user.id).maybeSingle();
          if (data && data.name && active) {
            setUserName(data.name);
          } else if (user.user_metadata?.name && active) {
            setUserName(user.user_metadata.name);
          }
        }
      } catch {
        // Safe fallback
      }
    }
    loadUserName();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="flex flex-row justify-between items-center gap-3 px-4 py-3 md:pe-6 relative z-20"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(99,102,241,0.1)",
        boxShadow: "0 1px 20px rgba(0,0,0,0.06)",
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        id="topbar-menu-btn"
        className="md:hidden p-2 -ms-1 rounded-xl transition-all duration-200 cursor-pointer"
        aria-label="Open menu"
        style={{ color: "#64748b" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        }}
      >
        <HamburgerIcon className="w-5 h-5" />
      </button>

      {/* Page title / brand */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>
          {isRTL ? "بوابة الشركاء" : "Affiliate Portal"}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            background: "rgba(99,102,241,0.1)",
            color: "#6366f1",
          }}
        >
          {isRTL ? "شريك" : "Partner"}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: Lang toggle + Notifications + User */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notifications */}
        <NotificationDropdown />

        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          id="lang-toggle-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer"
          style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.15)",
            color: "#6366f1",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.15)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.08)";
          }}
        >
          {language === "en" ? "عربي" : "English"}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="user-avatar-btn"
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              boxShadow: "0 2px 10px rgba(99,102,241,0.35)",
            }}
          >
            {(userName || "A").charAt(0).toUpperCase()}
          </button>

          {dropdownOpen && (
            <div
              className="absolute end-0 top-12 w-44 rounded-xl py-1 z-50"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(99,102,241,0.12)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              }}
            >
              <button
                type="button"
                onClick={async () => {
                  await logoutAffiliate();
                  window.location.href = '/login';
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm cursor-pointer transition-all duration-150"
                style={{ color: "#ef4444" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <LogOutIcon className="w-4 h-4" />
                {isRTL ? "تسجيل الخروج" : "Log Out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
