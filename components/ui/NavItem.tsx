"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative`}
      style={
        isActive
          ? {
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(129,140,248,0.15))",
              color: "#a5b4fc",
              border: "1px solid rgba(99,102,241,0.3)",
            }
          : {
              color: "rgba(148,163,184,0.8)",
              border: "1px solid transparent",
            }
      }
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLAnchorElement).style.background =
            "rgba(99,102,241,0.1)";
          (e.currentTarget as HTMLAnchorElement).style.color = "#c7d2fe";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
          (e.currentTarget as HTMLAnchorElement).style.color =
            "rgba(148,163,184,0.8)";
        }
      }}
    >
      {/* Active indicator */}
      {isActive && (
        <span
          className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-e-full"
          style={{ background: "#6366f1" }}
        />
      )}
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default NavItem;
