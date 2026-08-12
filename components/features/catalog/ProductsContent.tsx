"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { createCatalogLink } from "@/lib/actions/catalog";

interface Supplier {
  id: number;
  company_name: string;
}

interface Product {
  id: number;
  product_name: string;
  product_category: string | null;
  sell_price: number | null;
  product_image: string | null;
  description: string | null;
  supplier_id: number | null;
  suppliers?: Supplier | Supplier[] | null;
}

interface CreatedLink {
  slug: string;
  full_url: string;
}

interface ProductsContentProps {
  products: Product[];
}

function getSupplier(product: Product): Supplier | null {
  if (!product.suppliers) return null;
  if (Array.isArray(product.suppliers)) return product.suppliers[0] ?? null;
  return product.suppliers;
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

function PlaceholderImage({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
      style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
    >
      {initials || "P"}
    </div>
  );
}

export default function ProductsContent({ products }: ProductsContentProps) {
  const [search, setSearch] = useState("");
  const [createdLinks, setCreatedLinks] = useState<Record<number, CreatedLink>>({});
  const [creating, setCreating] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, { type: "success" | "error"; text: string }>>({});
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(q) ||
        (p.product_category ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleCreate = async (product: Product) => {
    setCreating(product.id);
    setMessages((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });

    const supplier = getSupplier(product);
    const supplierId = supplier?.id ?? product.supplier_id;
    const destinationPath = supplierId
      ? `/suppliers/${supplierId}?product=${product.id}`
      : `/products?product=${product.id}`;

    const res = await createCatalogLink(
      "product",
      product.id,
      product.product_name,
      destinationPath
    );

    if (res.success && res.link) {
      setCreatedLinks((prev) => ({
        ...prev,
        [product.id]: { slug: res.link.slug, full_url: res.link.full_url },
      }));
      setMessages((prev) => ({ ...prev, [product.id]: { type: "success", text: "Link created!" } }));
    } else {
      setMessages((prev) => ({
        ...prev,
        [product.id]: { type: "error", text: res.message || "Failed to create link" },
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
            Products Catalog
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
            Create affiliate links for supplier products
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products or categories..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
        />
      </div>

      {/* Count */}
      <p className="text-sm" style={{ color: "#94a3b8" }}>
        Showing <span className="font-semibold text-slate-700">{filtered.length}</span> products
        {search && ` matching "${search}"`}
      </p>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 text-center"
          style={{ border: "1px solid rgba(99,102,241,0.1)" }}
        >
          <p className="text-slate-400 text-sm">
            {search ? "No products match your search." : "No active products found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product) => {
            const supplier = getSupplier(product);
            const link = createdLinks[product.id];
            const msg = messages[product.id];
            const isCreating = creating === product.id;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden flex flex-col"
                style={{
                  border: "1px solid rgba(99,102,241,0.1)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                {/* Product Image */}
                <div className="h-40 w-full overflow-hidden bg-slate-50">
                  {product.product_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PlaceholderImage name={product.product_name} />
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  {/* Category badge */}
                  {product.product_category && (
                    <span
                      className="inline-block self-start px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}
                    >
                      {product.product_category}
                    </span>
                  )}

                  {/* Name + Price */}
                  <div>
                    <h3 className="font-bold text-sm leading-tight" style={{ color: "#0f172a" }}>
                      {product.product_name}
                    </h3>
                    <p className="mt-1 font-bold text-base" style={{ color: "#6366f1" }}>
                      SAR {product.sell_price ?? 0}
                    </p>
                  </div>

                  {/* Supplier name */}
                  {(supplier || product.supplier_id) && (
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      by{" "}
                      <span className="text-slate-600 font-medium">
                        {supplier?.company_name ?? `Supplier #${product.supplier_id}`}
                      </span>
                    </p>
                  )}

                  {/* Message */}
                  {msg && (
                    <div
                      className={`p-2 rounded-xl text-xs font-medium ${
                        msg.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  {/* Created Link Display */}
                  <div className="mt-auto flex flex-col gap-2">
                    {link ? (
                      <div
                        className="flex items-center gap-2 p-2 rounded-xl"
                        style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)" }}
                      >
                        <span className="text-xs text-slate-600 truncate flex-1 font-mono">
                          {link.full_url}
                        </span>
                        <button
                          onClick={() => handleCopy(link.slug, link.full_url)}
                          className="flex-shrink-0 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
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
                        onClick={() => handleCreate(product)}
                        disabled={isCreating}
                        className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
                        style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
                      >
                        {isCreating ? "Creating..." : "Create Affiliate Link"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
