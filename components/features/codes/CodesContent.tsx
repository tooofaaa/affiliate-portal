"use client";

import { useState } from "react";
import { createDiscountCode } from "@/lib/actions/affiliate";
import { formatDate } from "@/lib/utils/formatters";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface DiscountCode {
  id: number;
  code: string;
  level: number;
  discount_pct: number;
  affiliate_margin: number;
  status: string;
  uses_count: number;
  created_at?: string;
  expires_at?: string | null;
}

interface CodesContentProps {
  activeCode: DiscountCode | null;
  history: DiscountCode[] | null;
}

export default function CodesContent({ activeCode: initialCode, history: initialHistory }: CodesContentProps) {
  const { language, t } = useLanguage();
  const [activeCode, setActiveCode] = useState<DiscountCode | null>(initialCode ?? null);
  const [history, setHistory] = useState<DiscountCode[]>(initialHistory ?? []);
  const [discountPct, setDiscountPct] = useState(10);
  const [level, setLevel] = useState<1 | 2>(1);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);

    const res = await createDiscountCode(discountPct, level);

    if (res.success && res.code) {
      const newCode = res.code as DiscountCode;
      // Previous active code becomes inactive in history
      setHistory((prev) => [
        newCode,
        ...prev.map((c) => c.status === "active" ? { ...c, status: "inactive" } : c),
      ]);
      setActiveCode(newCode);
      setMessage({ type: "success", text: res.message });
    } else {
      setMessage({ type: "error", text: res.message });
    }
    setCreating(false);
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

  const handleCopyCode = () => {
    if (!activeCode) return;
    const onSuccess = () => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeCode.code).then(onSuccess).catch(() => {
        legacyCopy(activeCode.code);
        onSuccess();
      });
    } else {
      legacyCopy(activeCode.code);
      onSuccess();
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "active": return { background: "rgba(16,185,129,0.1)", color: "#059669" };
      case "inactive": return { background: "rgba(148,163,184,0.1)", color: "#64748b" };
      case "expired": return { background: "rgba(239,68,68,0.1)", color: "#ef4444" };
      default: return { background: "rgba(148,163,184,0.1)", color: "#64748b" };
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
          {t.codes.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          {t.codes.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Active Code Card */}
        <div
          className="bg-white rounded-2xl p-6"
          style={{
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h3 className="font-semibold text-base mb-4" style={{ color: "#0f172a" }}>
            {t.codes.activeCode}
          </h3>

          {activeCode ? (
            <div className="flex flex-col gap-4">
              <div
                className="p-6 rounded-xl text-center"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
                }}
              >
                <p className="text-3xl font-bold tracking-widest font-mono text-white mb-1">
                  {activeCode.code}
                </p>
                <p className="text-indigo-200 text-sm">
                  {activeCode.discount_pct}% discount for customers
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl" style={{ background: "rgba(99,102,241,0.06)" }}>
                  <p className="text-lg font-bold" style={{ color: "#6366f1" }}>
                    {activeCode.discount_pct}%
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Discount</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.06)" }}>
                  <p className="text-lg font-bold" style={{ color: "#059669" }}>
                    Level {activeCode.level}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Tier</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.06)" }}>
                  <p className="text-lg font-bold" style={{ color: "#d97706" }}>
                    {activeCode.uses_count ?? 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Uses</p>
                </div>
              </div>

              <button
                onClick={handleCopyCode}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                style={{
                  background: copiedCode ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.08)",
                  color: copiedCode ? "#059669" : "#6366f1",
                  border: `1px solid ${copiedCode ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.15)"}`,
                }}
              >
                {copiedCode ? t.codes.copiedToClipboard : t.codes.copyCode}
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
<div className="mb-3 flex justify-center"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg></div>
              <p className="text-sm text-slate-400 font-medium">{t.codes.noActiveCode}</p>
              <p className="text-xs text-slate-400 mt-1">{t.codes.note}</p>
            </div>
          )}
        </div>

        {/* Create New Code */}
        <div
          className="bg-white rounded-2xl p-6"
          style={{
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h3 className="font-semibold text-base mb-2" style={{ color: "#0f172a" }}>
            {t.codes.createNewCode}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            {t.codes.note}
          </p>

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

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">
                {t.codes.discountPct}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <span
                  className="w-12 text-center text-sm font-bold px-2 py-1 rounded-lg"
                  style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}
                >
                  {discountPct}%
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">{t.codes.level}</label>
              <div className="grid grid-cols-2 gap-3">
                {([1, 2] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className="py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                    style={
                      level === l
                        ? {
                            background: "linear-gradient(135deg, #6366f1, #818cf8)",
                            color: "white",
                            border: "1px solid transparent",
                          }
                        : {
                            background: "rgba(99,102,241,0.05)",
                            color: "#64748b",
                            border: "1px solid rgba(99,102,241,0.12)",
                          }
                    }
                  >
                    Level {l}
                    {l === 2 && (
                      <span className="text-xs block mt-0.5 opacity-75">1.5x commission</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer mt-2"
              style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
            >
              {creating ? t.codes.creating : t.codes.create}
            </button>
          </form>
        </div>

      </div>

      {/* Code History */}
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
            {t.codes.codeHistory}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(248,249,252,0.8)" }}>
                {[t.codes.code, t.codes.level, t.codes.discount, t.common.status, t.codes.uses, t.wallet.transDate].map((h) => (
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
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                    {t.codes.noCodeHistory}
                  </td>
                </tr>
              ) : (
                history.map((code, i) => (
                  <tr
                    key={code.id}
                    style={{
                      borderTop: i > 0 ? "1px solid rgba(99,102,241,0.06)" : undefined,
                    }}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-xs" style={{ color: "#6366f1" }}>
                      {code.code}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}
                      >
                        Level {code.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {code.discount_pct}%
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                        style={statusStyle(code.status)}
                      >
                        {code.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{code.uses_count ?? 0}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDate(code.created_at, language)}
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
