"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import StatCard from "@/components/ui/StatCard";
import { ActivityIcon, OrdersIcon, WalletIcon, ProductsIcon, CheckCircleIcon } from "@/lib/icons";

interface PerformanceLink {
  id: number;
  slug: string;
  full_url: string;
  destination: string;
  clicks: number;
  conversions: number;
  is_active: boolean;
}

interface PerformanceStats {
  total_clicks: number;
  total_conversions: number;
  conversion_rate: number;
  total_earned: number;
  active_codes: number;
  links_count: number;
  links: PerformanceLink[];
}

interface AffiliateLink {
  slug: string | null;
  item_name: string | null;
  full_url: string | null;
}

interface ConversionRow {
  id: number;
  item_type: string | null;
  item_id: number | null;
  sale_amount: number | null;
  commission_pct: number | null;
  commission_amount: number | null;
  status: string | null;
  confirmed_at: string | null;
  created_at: string;
  affiliate_links?: AffiliateLink | AffiliateLink[] | null;
}

interface PerformanceContentProps {
  stats: PerformanceStats | null;
  conversions?: ConversionRow[];
}

function statusStyle(status: string | null) {
  switch ((status ?? "").toLowerCase()) {
    case "confirmed":
      return { background: "rgba(16,185,129,0.1)", color: "#059669" };
    case "pending":
      return { background: "rgba(245,158,11,0.1)", color: "#d97706" };
    case "rejected":
      return { background: "rgba(239,68,68,0.1)", color: "#dc2626" };
    default:
      return { background: "rgba(148,163,184,0.1)", color: "#64748b" };
  }
}

export default function PerformanceContent({ stats: rawStats, conversions = [] }: PerformanceContentProps) {
  const { language, t } = useLanguage();

  // Provide safe defaults so no .toFixed() / .toLocaleString() call can crash on null/undefined.
  const stats: PerformanceStats = {
    total_clicks: rawStats?.total_clicks ?? 0,
    total_conversions: rawStats?.total_conversions ?? 0,
    conversion_rate: rawStats?.conversion_rate ?? 0,
    total_earned: rawStats?.total_earned ?? 0,
    active_codes: rawStats?.active_codes ?? 0,
    links_count: rawStats?.links_count ?? 0,
    links: rawStats?.links ?? [],
  };

  const statCards = [
    {
      title: t.performance.totalClicks,
      value: stats.total_clicks.toLocaleString(),
      accent: "#6366f1",
      icon: <ActivityIcon className="w-4 h-4" />,
      description: t.performance.descTotalClicks,
    },
    {
      title: t.performance.totalConversions,
      value: stats.total_conversions.toLocaleString(),
      accent: "#10b981",
      icon: <CheckCircleIcon className="w-4 h-4" />,
      description: t.performance.descTotalConversions,
    },
    {
      title: t.performance.conversionRate,
      value: `${stats.conversion_rate.toFixed(1)}%`,
      accent: "#f59e0b",
      icon: <OrdersIcon className="w-4 h-4" />,
      description: t.performance.descConversionRate,
    },
    {
      title: t.performance.totalEarned,
      value: formatCurrency(stats.total_earned, language),
      accent: "#ec4899",
      icon: <WalletIcon className="w-4 h-4" />,
      description: t.performance.descTotalEarned,
    },
    {
      title: t.performance.activeLinks,
      value: stats.links.filter((l) => l.is_active).length,
      accent: "#8b5cf6",
      icon: <ProductsIcon className="w-4 h-4" />,
      description: t.performance.descActiveLinks,
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
          {t.performance.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          {t.performance.subtitle}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
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

      {/* Links Performance Table */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div
          className="px-6 py-4"
          style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}
        >
          <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>
            {t.performance.linksPerformance}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{t.performance.sortedByConversions}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(248,249,252,0.8)" }}>
                {[t.links.slug, t.links.destination, t.links.clicks, t.dashboard.conv, t.performance.convRate, t.links.status].map((h) => (
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
              {stats.links.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                    {t.performance.noLinksFound}
                  </td>
                </tr>
              ) : (
                stats.links.map((link, i) => {
                  const safeClicks = link.clicks ?? 0;
                  const safeConversions = link.conversions ?? 0;
                  const linkConvRate =
                    safeClicks > 0
                      ? ((safeConversions / safeClicks) * 100).toFixed(1)
                      : "0.0";
                  return (
                    <tr
                      key={link.id}
                      style={{
                        borderTop: i > 0 ? "1px solid rgba(99,102,241,0.06)" : undefined,
                      }}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "#6366f1" }}>
                        {link.slug}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 truncate max-w-[150px]">
                        {link.destination || "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {safeClicks}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {safeConversions}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[60px]">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(parseFloat(linkConvRate), 100)}%`,
                                background: "linear-gradient(90deg, #6366f1, #818cf8)",
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{linkConvRate}%</span>
                        </div>
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
                          {link.is_active ? t.performance.active : t.performance.inactive}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion History Table */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(16,185,129,0.15)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div
          className="px-6 py-4"
          style={{ borderBottom: "1px solid rgba(16,185,129,0.08)" }}
        >
          <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>
            {t.performance.conversionHistory}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{t.performance.conversionHistoryDesc}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(248,249,252,0.8)" }}>
                {[t.performance.item, t.performance.type, t.performance.saleAmount, t.performance.commission, t.links.status, t.wallet.transDate].map((h) => (
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
              {conversions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                    {t.performance.noConversions}
                  </td>
                </tr>
              ) : (
                conversions.map((conv, i) => {
                  const linkData = Array.isArray(conv.affiliate_links) ? conv.affiliate_links[0] : conv.affiliate_links;
                  const itemName = linkData?.item_name ?? `${conv.item_type} #${conv.item_id}`;
                  const date = formatDate(conv.created_at, language);
                  return (
                    <tr
                      key={conv.id}
                      style={{
                        borderTop: i > 0 ? "1px solid rgba(16,185,129,0.06)" : undefined,
                      }}
                    >
                      <td className="px-4 py-3 text-xs font-medium text-slate-700 max-w-[160px] truncate">
                        {itemName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                          style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}
                        >
                          {conv.item_type ?? "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700 text-xs">
                        {formatCurrency(conv.sale_amount ?? 0, language)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-xs" style={{ color: "#10b981" }}>
                        {formatCurrency(conv.commission_amount ?? 0, language)}
                      </td>
                      <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                            style={statusStyle(conv.status)}
                          >
                            {t.performance.convStatus[(conv.status ?? "pending").toLowerCase()] ?? conv.status}
                          </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{date}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
