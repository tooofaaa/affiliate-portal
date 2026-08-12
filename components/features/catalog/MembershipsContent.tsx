"use client";

import { useState } from "react";
import Link from "next/link";
import { createCatalogLink } from "@/lib/actions/catalog";

interface Membership {
  id: number;
  level_name: string;
  price_sar: number | null;
  discount_percentage: number | null;
  benefits: string[] | null;
  tier_order: number | null;
  min_spent_sar?: number | null;
  is_active?: boolean;
}

interface CreatedLink {
  slug: string;
  full_url: string;
}

interface MembershipsContentProps {
  memberships: Membership[];
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  bronze:   { bg: "rgba(217,119,6,0.1)",   text: "#d97706", border: "rgba(217,119,6,0.3)" },
  silver:   { bg: "rgba(100,116,139,0.1)", text: "#64748b", border: "rgba(100,116,139,0.3)" },
  gold:     { bg: "rgba(234,179,8,0.1)",   text: "#ca8a04", border: "rgba(234,179,8,0.3)" },
  platinum: { bg: "rgba(99,102,241,0.1)",  text: "#6366f1", border: "rgba(99,102,241,0.3)" },
  diamond:  { bg: "rgba(6,182,212,0.1)",   text: "#0891b2", border: "rgba(6,182,212,0.3)" },
  elite:    { bg: "rgba(147,51,234,0.1)",  text: "#9333ea", border: "rgba(147,51,234,0.3)" },
  vip:      { bg: "rgba(244,63,94,0.1)",   text: "#f43f5e", border: "rgba(244,63,94,0.3)" },
};

function getLevelColor(name: string) {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(LEVEL_COLORS)) {
    if (key.includes(k)) return v;
  }
  return { bg: "rgba(99,102,241,0.1)", text: "#6366f1", border: "rgba(99,102,241,0.3)" };
}

function legacyCopy(text: string) {
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  try { document.execCommand("copy"); } catch { /* ignore */ }
  document.body.removeChild(el);
}

export default function MembershipsContent({ memberships }: MembershipsContentProps) {
  const [createdLinks, setCreatedLinks] = useState<Record<number, CreatedLink>>({});
  const [creating, setCreating] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, { type: "success" | "error"; text: string }>>({});
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCreate = async (membership: Membership) => {
    setCreating(membership.id);
    setMessages((prev) => {
      const next = { ...prev };
      delete next[membership.id];
      return next;
    });

    const res = await createCatalogLink(
      "membership",
      membership.id,
      membership.level_name,
      `/memberships/${membership.id}`
    );

    if (res.success && res.link) {
      setCreatedLinks((prev) => ({
        ...prev,
        [membership.id]: { slug: res.link.slug, full_url: res.link.full_url },
      }));
      setMessages((prev) => ({ ...prev, [membership.id]: { type: "success", text: "Link created!" } }));
    } else {
      setMessages((prev) => ({
        ...prev,
        [membership.id]: { type: "error", text: res.message || "Failed to create link" },
      }));
    }
    setCreating(null);
  };

  const handleCopy = (slug: string, url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2000);
      }).catch(() => {
        legacyCopy(url);
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2000);
      });
    } else {
      legacyCopy(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/catalog"
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl transition-all"
          style={{ color: "#6366f1", background: "rgba(99,102,241,0.08)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
            Memberships Catalog
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
            Create affiliate links for membership tiers
          </p>
        </div>
      </div>

      {/* Membership Cards */}
      {memberships.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 text-center"
          style={{ border: "1px solid rgba(99,102,241,0.1)" }}
        >
          <p className="text-slate-400 text-sm">No active membership tiers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {memberships.map((membership) => {
            const color = getLevelColor(membership.level_name);
            const link = createdLinks[membership.id];
            const msg = messages[membership.id];
            const isCreating = creating === membership.id;

            return (
              <div
                key={membership.id}
                className="bg-white rounded-2xl p-5 flex flex-col gap-4"
                style={{
                  border: "1px solid rgba(99,102,241,0.1)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                {/* Badge + Title */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
                      style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}
                    >
                      {membership.level_name}
                    </span>
                    <p className="mt-2 font-bold text-base" style={{ color: "#0f172a" }}>
                      {(membership.price_sar ?? 0) > 0
                        ? `SAR ${membership.price_sar}`
                        : "Free tier — earned by spending"}
                    </p>
                  </div>
                  {membership.tier_order != null && (
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400 font-mono">
                      Tier {membership.tier_order}
                    </span>
                  )}
                </div>

                {/* Discount */}
                <p className="text-sm" style={{ color: "#64748b" }}>
                  <span className="font-semibold" style={{ color: color.text }}>
                    {membership.discount_percentage ?? 0}%
                  </span>{" "}
                  discount for customers
                </p>

                {/* Benefits */}
                {membership.benefits && membership.benefits.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {membership.benefits.slice(0, 3).map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                        <span style={{ color: color.text }}>•</span>
                        {b}
                      </li>
                    ))}
                    {membership.benefits.length > 3 && (
                      <li className="text-xs" style={{ color: "#94a3b8" }}>
                        +{membership.benefits.length - 3} more
                      </li>
                    )}
                  </ul>
                )}

                {/* Message */}
                {msg && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-medium ${
                      msg.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {/* Created Link Display */}
                {link ? (
                  <div
                    className="flex items-center gap-2 p-2.5 rounded-xl"
                    style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)" }}
                  >
                    <span className="text-xs text-slate-600 truncate flex-1 font-mono">
                      {link.full_url}
                    </span>
                    <button
                      onClick={() => handleCopy(link.slug, link.full_url)}
                      className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      style={{
                        background: copiedSlug === link.slug ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)",
                        color: copiedSlug === link.slug ? "#059669" : "#6366f1",
                      }}
                    >
                      {copiedSlug === link.slug ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCreate(membership)}
                    disabled={isCreating}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
                  >
                    {isCreating ? "Creating..." : "Create Affiliate Link"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
