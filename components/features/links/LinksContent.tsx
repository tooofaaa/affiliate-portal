"use client";

import { useState } from "react";
import { createLink, deactivateLink } from "@/lib/actions/affiliate";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface AffiliateLink {
  id: number;
  slug: string;
  full_url: string;
  destination: string;
  clicks: number;
  conversions: number;
  is_active: boolean;
  created_at?: string;
}

interface LinksContentProps {
  links: AffiliateLink[] | null;
}

export default function LinksContent({ links: initialLinks }: LinksContentProps) {
  const { language } = useLanguage();
  const [links, setLinks] = useState<AffiliateLink[]>(initialLinks ?? []);
  const [destination, setDestination] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const totalLinks = links.length;
  const totalClicks = links.reduce((s, l) => s + (l.clicks ?? 0), 0);
  const totalConversions = links.reduce((s, l) => s + (l.conversions ?? 0), 0);
  const avgConvRate =
    totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0.0";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    setCreating(true);
    setMessage(null);

    const res = await createLink(destination.trim());

    if (res.success && res.link) {
      setLinks((prev) => [res.link as AffiliateLink, ...prev]);
      setDestination("");
      setMessage({ type: "success", text: res.message });
    } else {
      setMessage({ type: "error", text: res.message });
    }
    setCreating(false);
  };

  const handleDeactivate = async (id: number) => {
    await deactivateLink(id);
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, is_active: false } : l))
    );
  };

  const handleCopy = (id: number, url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(() => {
        // fallback for non-secure contexts
        legacyCopy(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      legacyCopy(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const legacyCopy = (text: string) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    try { document.execCommand("copy"); } catch { /* ignore */ }
    document.body.removeChild(el);
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
          My Tracking Links
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          Generate and manage your affiliate tracking links
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Links", value: totalLinks },
          { label: "Total Clicks", value: totalClicks.toLocaleString() },
          { label: "Total Conversions", value: totalConversions.toLocaleString() },
          { label: "Avg Conv. Rate", value: `${avgConvRate}%` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-4 text-center"
            style={{
              border: "1px solid rgba(99,102,241,0.1)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <p className="text-2xl font-bold" style={{ color: "#6366f1" }}>
              {stat.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Create New Link */}
      <div
        className="bg-white rounded-2xl p-6"
        style={{
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <h3 className="font-semibold text-base mb-4" style={{ color: "#0f172a" }}>
          Create New Link
        </h3>

        {message && (
          <div
            className={`mb-4 p-3 rounded-xl text-sm border font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="url"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="https://example.com/product-page"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            {creating ? "Generating..." : "Generate Link"}
          </button>
        </form>
      </div>

      {/* Links Table */}
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
            All Links
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(248,249,252,0.8)" }}>
                {["Slug", "Full URL", "Destination", "Clicks", "Conv.", "Status", "Actions"].map((h) => (
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
              {links.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm">
                    No links yet. Create your first tracking link above.
                  </td>
                </tr>
              ) : (
                links.map((link, i) => (
                  <tr
                    key={link.id}
                    style={{
                      borderTop: i > 0 ? "1px solid rgba(99,102,241,0.06)" : undefined,
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "#6366f1" }}>
                      {link.slug}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <span className="text-xs text-slate-500 truncate">{link.full_url}</span>
                        <button
                          onClick={() => handleCopy(link.id, link.full_url)}
                          className="flex-shrink-0 px-2 py-1 rounded text-xs font-semibold transition-all cursor-pointer"
                          style={{
                            background: copiedId === link.id ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.08)",
                            color: copiedId === link.id ? "#059669" : "#6366f1",
                          }}
                        >
                          {copiedId === link.id ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 truncate max-w-[120px]">
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
                    <td className="px-4 py-3">
                      {link.is_active && (
                        <button
                          onClick={() => handleDeactivate(link.id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                          style={{
                            background: "rgba(239,68,68,0.08)",
                            color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.15)",
                          }}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
