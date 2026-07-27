"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createTicket } from "@/lib/actions/affiliate";
import { formatDate } from "@/lib/utils/formatters";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { createClient } from "@/lib/supabase/client";

interface Ticket {
  id: number;
  subject: string;
  type: string;
  status: string;
  created_at?: string;
}

interface SupportContentProps {
  tickets: Ticket[];
  affiliateId: number | null;
}

const TICKET_TYPES = [
  "General Inquiry",
  "Technical Issue",
  "Payment / Withdrawal",
  "Account Issue",
  "Code / Link Issue",
  "Other",
];

export default function SupportContent({ tickets: initialTickets, affiliateId }: SupportContentProps) {
  const { language, t } = useLanguage();
  const [tickets, setTickets] = useState(initialTickets);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [type, setType] = useState(TICKET_TYPES[0]);
  const [messageText, setMessageText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Realtime: subscribe to new support_tickets rows for this affiliate so the list
  // updates live when a ticket's status changes (e.g. admin marks in_progress).
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("support-tickets-list")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_tickets",
        },
        (payload) => {
          const updated = payload.new as Ticket;
          setTickets((prev) =>
            prev.map((tk) => (tk.id === updated.id ? { ...tk, ...updated } : tk))
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMessage(null);

    const res = await createTicket(subject, type, messageText, affiliateId);

    if (res.success) {
      setFormMessage({ type: "success", text: t.support.ticketCreated ?? "Ticket created successfully!" });
      setTickets((prev) => [
        {
          id: res.ticket_id ?? Date.now(),
          subject,
          type,
          status: "open",
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setSubject("");
      setType(TICKET_TYPES[0]);
      setMessageText("");
      setShowForm(false);
    } else {
      setFormMessage({ type: "error", text: t.support.ticketFailed ?? "Failed to create ticket. Please try again." });
    }
    setSubmitting(false);
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "open": return { background: "rgba(16,185,129,0.1)", color: "#059669" };
      case "in_progress": return { background: "rgba(59,130,246,0.1)", color: "#2563eb" };
      case "resolved": return { background: "rgba(148,163,184,0.1)", color: "#64748b" };
      case "closed": return { background: "rgba(148,163,184,0.1)", color: "#64748b" };
      default: return { background: "rgba(245,158,11,0.1)", color: "#d97706" };
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
            {t.support.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            {t.support.subtitle}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
        >
          {showForm ? t.support.cancel : t.support.newTicket}
        </button>
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <div
          className="bg-white rounded-2xl p-6"
          style={{
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h3 className="font-semibold text-base mb-4" style={{ color: "#0f172a" }}>
            {t.support.newTicket}
          </h3>

          {formMessage && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm border font-medium ${
                formMessage.type === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {formMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">{t.support.subject}</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue..."
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">{t.support.type}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-indigo-500"
                >
                  {TICKET_TYPES.map((tp) => (
                    <option key={tp} value={tp}>{tp}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">{t.support.message}</label>
              <textarea
                required
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Describe your issue in detail..."
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
              >
                {submitting ? t.support.submitting : t.support.submitTicket}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
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
            {t.support.myTickets}
          </h3>
        </div>

        {tickets.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-4xl mb-3">🎫</p>
            <p className="text-sm text-slate-400">{t.support.noTickets}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/support/${ticket.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-slate-800">{ticket.subject}</p>
                  <p className="text-xs text-slate-400">
                    {ticket.type} · {formatDate(ticket.created_at, language)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                    style={statusStyle(ticket.status)}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                  <span className="text-slate-400 text-xs">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
