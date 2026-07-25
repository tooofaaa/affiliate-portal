"use client";

import { useState } from "react";
import Link from "next/link";
import { addTicketMessage } from "@/lib/actions/affiliate";
import { formatDate } from "@/lib/utils/formatters";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_id: string;
  content: string;
  created_at?: string;
  is_internal?: boolean;
}

interface Ticket {
  id: number;
  subject: string;
  type: string;
  status: string;
  created_at?: string;
}

interface TicketDetailContentProps {
  ticket: Ticket;
  messages: TicketMessage[];
  currentUserId: string;
}

export default function TicketDetailContent({
  ticket,
  messages: initialMessages,
  currentUserId,
}: TicketDetailContentProps) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState(initialMessages);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);

    const res = await addTicketMessage(ticket.id, reply.trim());

    if (res.success) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          ticket_id: ticket.id,
          sender_id: currentUserId,
          content: reply.trim(),
          created_at: new Date().toISOString(),
        },
      ]);
      setReply("");
    }
    setSending(false);
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "open": return { background: "rgba(16,185,129,0.1)", color: "#059669" };
      case "in_progress": return { background: "rgba(59,130,246,0.1)", color: "#2563eb" };
      case "resolved": return { background: "rgba(148,163,184,0.1)", color: "#64748b" };
      default: return { background: "rgba(245,158,11,0.1)", color: "#d97706" };
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8 max-w-3xl">
      {/* Header */}
      <div>
        <Link href="/support" className="text-xs font-semibold text-indigo-600 hover:underline mb-3 inline-block">
          ← Back to Support
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
              {ticket.subject}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              {ticket.type} · Ticket #{ticket.id} · {formatDate(ticket.created_at, language)}
            </p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold capitalize mt-1 flex-shrink-0"
            style={statusStyle(ticket.status)}
          >
            {ticket.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Message Thread */}
      <div
        className="bg-white rounded-2xl p-6 flex flex-col gap-4"
        style={{
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}
              >
                <div
                  className="max-w-[80%] px-4 py-3 rounded-2xl text-sm"
                  style={
                    isOwn
                      ? {
                          background: "linear-gradient(135deg, #6366f1, #818cf8)",
                          color: "white",
                          borderEndEndRadius: "4px",
                        }
                      : {
                          background: "rgba(248,249,252,1)",
                          color: "#334155",
                          border: "1px solid rgba(99,102,241,0.08)",
                          borderEndStartRadius: "4px",
                        }
                  }
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-slate-400 px-1">
                  {isOwn ? "You" : "Support"} · {formatDate(msg.created_at, language)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Form */}
      {ticket.status !== "closed" && ticket.status !== "resolved" && (
        <div
          className="bg-white rounded-2xl p-6"
          style={{
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h3 className="font-semibold text-base mb-3" style={{ color: "#0f172a" }}>
            Reply
          </h3>
          <form onSubmit={handleReply} className="flex flex-col gap-3">
            <textarea
              required
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
              >
                {sending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
