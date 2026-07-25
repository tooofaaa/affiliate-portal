"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatCurrency } from "@/lib/utils/formatters";
import StatCard from "@/components/ui/StatCard";
import { WalletIcon, ActivityIcon, OrdersIcon, ProductsIcon } from "@/lib/icons";

interface RecentLink {
  id: number;
  slug: string;
  full_url: string;
  destination: string;
  clicks: number;
  conversions: number;
  is_active: boolean;
}

interface ActiveCode {
  id: number;
  code: string;
  discount_pct: number;
  level: number;
  uses_count: number;
}

interface DashboardStats {
  total_earnings: number;
  active_links: number;
  total_clicks: number;
  total_conversions: number;
  wallet_balance: number;
  recent_links: RecentLink[];
}

interface DashboardContentProps {
  stats: DashboardStats;
  activeCode: ActiveCode | null;
}

export default function DashboardContent({ stats, activeCode }: DashboardContentProps) {
  const { language } = useLanguage();

  const statCards = [
    {
      title: "Total Earnings",
      value: formatCurrency(stats.total_earnings, language),
      accent: "#6366f1",
      icon: <WalletIcon className="w-4 h-4" />,
      description: "Wallet balance",
    },
    {
      title: "Active Links",
      value: stats.active_links,
      accent: "#10b981",
      icon: <ActivityIcon className="w-4 h-4" />,
      description: "Currently active tracking links",
    },
    {
      title: "Total Clicks",
      value: stats.total_clicks.toLocaleString(),
      accent: "#f59e0b",
      icon: <OrdersIcon className="w-4 h-4" />,
      description: "Clicks across all links",
    },
    {
      title: "Conversions",
      value: stats.total_conversions.toLocaleString(),
      accent: "#ec4899",
      icon: <ProductsIcon className="w-4 h-4" />,
      description: "Total conversions recorded",
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          Welcome back — here&apos;s your affiliate overview
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            accent={card.accent}
            icon={card.icon}
            description={card.description}
          />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* My Active Code */}
        <div
          className="rounded-2xl p-6 bg-white"
          style={{
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>
              My Active Code
            </h3>
            <Link
              href="/codes"
              className="text-xs font-semibold"
              style={{ color: "#6366f1" }}
            >
              Manage →
            </Link>
          </div>

          {activeCode ? (
            <div className="flex flex-col gap-3">
              <div
                className="p-4 rounded-xl text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(129,140,248,0.06))",
                  border: "1px solid rgba(99,102,241,0.15)",
                }}
              >
                <p
                  className="text-2xl font-bold tracking-widest font-mono"
                  style={{ color: "#6366f1" }}
                >
                  {activeCode.code}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}
                  >
                    Level {activeCode.level}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {activeCode.discount_pct}% off
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {activeCode.uses_count} uses
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400 mb-3">No active code</p>
              <Link
                href="/codes"
                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
              >
                Create Code
              </Link>
            </div>
          )}
        </div>

        {/* Recent Links */}
        <div
          className="xl:col-span-2 rounded-2xl overflow-hidden bg-white"
          style={{
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}
          >
            <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>
              My Links
            </h3>
            <Link
              href="/links"
              className="text-xs font-semibold"
              style={{ color: "#6366f1" }}
            >
              View all →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(248,249,252,0.8)" }}>
                  {["Slug", "Destination", "Clicks", "Conv.", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#94a3b8" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent_links.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                      No links yet —{" "}
                      <Link href="/links" className="text-indigo-600 font-semibold">
                        create your first link
                      </Link>
                    </td>
                  </tr>
                ) : (
                  stats.recent_links.map((link, i) => (
                    <tr
                      key={link.id}
                      style={{
                        borderTop: i > 0 ? "1px solid rgba(99,102,241,0.06)" : undefined,
                      }}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "#6366f1" }}>
                        {link.slug}
                      </td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-[160px] text-xs">
                        {link.destination || "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {link.clicks ?? 0}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {link.conversions ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={
                            link.is_active
                              ? { background: "rgba(16,185,129,0.1)", color: "#059669" }
                              : { background: "rgba(148,163,184,0.1)", color: "#64748b" }
                          }
                        >
                          {link.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div
        className="rounded-2xl p-6 bg-white"
        style={{
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
        }}
      >
        <h3 className="font-semibold text-base mb-4" style={{ color: "#0f172a" }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/links", label: "Create Link", icon: "🔗" },
            { href: "/codes", label: "Create Code", icon: "🎫" },
            { href: "/wallet", label: "Wallet", icon: "💰" },
            { href: "/performance", label: "Performance", icon: "📊" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:bg-slate-50 transition-colors"
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-xs font-semibold mt-2 text-slate-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
