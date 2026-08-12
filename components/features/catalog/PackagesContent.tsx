"use client";

import { useState } from "react";
import Link from "next/link";
import { createCatalogLink } from "@/lib/actions/catalog";

interface Package {
  id: number;
  name: string;
  name_ar: string | null;
  description: string | null;
  price_sar: number | null;
  duration_days: number | null;
  features: string[] | null;
  sort_order: number | null;
}

interface CreatedLink {
  slug: string;
  full_url: string;
}

interface PackagesContentProps {
  packages: Package[];
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

export default function PackagesContent({ packages }: PackagesContentProps) {
  const [createdLinks, setCreatedLinks] = useState<Record<number, CreatedLink>>({});
  const [creating, setCreating] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, { type: "success" | "error"; text: string }>>({});
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCreate = async (pkg: Package) => {
    setCreating(pkg.id);
    setMessages((prev) => {
      const next = { ...prev };
      delete next[pkg.id];
      return next;
    });

    const res = await createCatalogLink(
      "package",
      pkg.id,
      pkg.name,
      `/packages/${pkg.id}`
    );

    if (res.success && res.link) {
      setCreatedLinks((prev) => ({
        ...prev,
        [pkg.id]: { slug: res.link.slug, full_url: res.link.full_url },
      }));
      setMessages((prev) => ({ ...prev, [pkg.id]: { type: "success", text: "Link created!" } }));
    } else {
      setMessages((prev) => ({
        ...prev,
        [pkg.id]: { type: "error", text: res.message || "Failed to create link" },
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
            Packages Catalog
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
            Create affiliate links for packages
          </p>
        </div>
      </div>

      {/* Package Cards */}
      {packages.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 text-center"
          style={{ border: "1px solid rgba(99,102,241,0.1)" }}
        >
          <p className="text-slate-400 text-sm">No active packages found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const link = createdLinks[pkg.id];
            const msg = messages[pkg.id];
            const isCreating = creating === pkg.id;

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl p-5 flex flex-col gap-4"
                style={{
                  border: "1px solid rgba(99,102,241,0.1)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                {/* Title */}
                <div>
                  <h3 className="font-bold text-base" style={{ color: "#0f172a" }}>
                    {pkg.name}
                  </h3>
                  {pkg.name_ar && (
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                      {pkg.name_ar}
                    </p>
                  )}
                </div>

                {/* Price + Duration */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-lg font-bold"
                    style={{ color: "#10b981" }}
                  >
                    SAR {pkg.price_sar ?? 0}
                  </span>
                  {pkg.duration_days && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                      {pkg.duration_days} days
                    </span>
                  )}
                </div>

                {/* Description */}
                {pkg.description && (
                  <p className="text-sm line-clamp-2" style={{ color: "#64748b" }}>
                    {pkg.description}
                  </p>
                )}

                {/* Features */}
                {pkg.features && pkg.features.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {pkg.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                        <span style={{ color: "#10b981" }}>•</span>
                        {f}
                      </li>
                    ))}
                    {pkg.features.length > 3 && (
                      <li className="text-xs" style={{ color: "#94a3b8" }}>
                        +{pkg.features.length - 3} more
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
                    style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}
                  >
                    <span className="text-xs text-slate-600 truncate flex-1 font-mono">
                      {link.full_url}
                    </span>
                    <button
                      onClick={() => handleCopy(link.slug, link.full_url)}
                      className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      style={{
                        background: copiedSlug === link.slug ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.1)",
                        color: copiedSlug === link.slug ? "#059669" : "#10b981",
                      }}
                    >
                      {copiedSlug === link.slug ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCreate(pkg)}
                    disabled={isCreating}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
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
