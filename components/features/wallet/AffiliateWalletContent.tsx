"use client";

import { useState, useEffect } from "react";
import { requestAffiliateWithdrawal } from "@/lib/actions/affiliate";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface WalletData {
  id: number;
  balance: number;
  pending: number;
  currency: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface Withdrawal {
  id: number;
  amount: number;
  bank_name: string;
  account_holder: string;
  iban: string;
  status: string;
  sla_deadline?: string;
  created_at?: string;
}

interface AffiliateWalletContentProps {
  wallet: WalletData | null;
  transactions: Transaction[];
  withdrawals: Withdrawal[];
}

type TabType = "transactions" | "withdrawals" | "how-to-earn";

export default function AffiliateWalletContent({
  wallet: initialWallet,
  transactions: initialTransactions,
  withdrawals: initialWithdrawals,
}: AffiliateWalletContentProps) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("transactions");
  const [wallet, setWallet] = useState(initialWallet);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);

  // Realtime: refresh wallet balance and transactions when affiliate_wallets or
  // wallet_transactions rows change for this affiliate.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channelRef: any = null;

    async function subscribe() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch fresh wallet data
        const refreshWallet = async () => {
          const { data: aff } = await supabase
            .from("affiliates")
            .select("id")
            .eq("portal_user_id", user.id)
            .maybeSingle();
          if (!aff) return;

          const { data: w } = await supabase
            .from("affiliate_wallets")
            .select("id, balance, pending, currency")
            .eq("affiliate_id", aff.id)
            .maybeSingle();
          if (w) setWallet(w);

          const { data: txs } = await supabase
            .from("wallet_transactions")
            .select("id, type, amount, description, created_at")
            .eq("wallet_type", "affiliate")
            .eq("wallet_id", w?.id ?? 0)
            .order("created_at", { ascending: false })
            .limit(50);
          if (txs) setTransactions(txs);
        };

        channelRef = supabase
          .channel("affiliate-wallet-rt")
          .on(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "postgres_changes" as any,
            { event: "*", schema: "public", table: "affiliate_wallets" },
            refreshWallet
          )
          .on(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "postgres_changes" as any,
            { event: "INSERT", schema: "public", table: "wallet_transactions" },
            refreshWallet
          )
          .subscribe();
      } catch {
        // ignore — realtime is best-effort
      }
    }

    subscribe();

    return () => {
      if (channelRef) {
        import("@/lib/supabase/client").then(({ createClient }) => {
          createClient().removeChannel(channelRef);
        });
      }
    };
  }, []);

  // Withdrawal form state
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [iban, setIban] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const available = Math.max(0, (wallet?.balance ?? 0) - (wallet?.pending ?? 0));
  const pending = wallet?.pending ?? 0;

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount." });
      setSubmitting(false);
      return;
    }

    const res = await requestAffiliateWithdrawal(numAmount, bankName, accountHolder, iban);

    if (res.success) {
      setMessage({ type: "success", text: res.message });
      setShowForm(false);
      setAmount("");
      setBankName("");
      setAccountHolder("");
      setIban("");
      // Add optimistic withdrawal to list
      const sla = new Date();
      sla.setDate(sla.getDate() + 15);
      setWithdrawals((prev) => [
        {
          id: Date.now(),
          amount: numAmount,
          bank_name: bankName,
          account_holder: accountHolder,
          iban,
          status: "Pending",
          sla_deadline: sla.toISOString().split("T")[0],
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } else {
      setMessage({ type: "error", text: res.message });
    }
    setSubmitting(false);
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "Pending": return { background: "rgba(245,158,11,0.1)", color: "#d97706" };
      case "Processing": return { background: "rgba(59,130,246,0.1)", color: "#2563eb" };
      case "Completed": return { background: "rgba(16,185,129,0.1)", color: "#059669" };
      case "Rejected": return { background: "rgba(239,68,68,0.1)", color: "#ef4444" };
      default: return { background: "rgba(148,163,184,0.1)", color: "#64748b" };
    }
  };

  const tabs = [
    { key: "transactions" as TabType, label: t.wallet.transactions },
    { key: "withdrawals" as TabType, label: t.wallet.withdrawals },
    { key: "how-to-earn" as TabType, label: t.wallet.howToEarn },
  ];

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
          {t.wallet.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          {t.wallet.subtitle}
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Available Balance */}
        <div
          className="rounded-2xl p-6 text-white"
          style={{
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
          }}
        >
          <p className="text-sm font-medium text-indigo-200 mb-2">{t.wallet.availableBalance}</p>
          <p className="text-4xl font-bold">{formatCurrency(available, language)}</p>
          <p className="text-indigo-200 text-xs mt-2">{t.wallet.readyForWithdrawal}</p>
        </div>

        {/* Pending */}
        <div
          className="bg-white rounded-2xl p-6"
          style={{
            border: "1px solid rgba(245,158,11,0.2)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <p className="text-sm font-medium text-slate-500 mb-2">{t.wallet.pending}</p>
          <p className="text-4xl font-bold" style={{ color: "#d97706" }}>
            {formatCurrency(pending, language)}
          </p>
          <p className="text-xs text-slate-400 mt-2">{t.wallet.withdrawalInProgress}</p>
        </div>
      </div>

      {/* Request Withdrawal Button */}
      {!showForm && (
        <div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            {t.wallet.requestWithdrawal}
          </button>
        </div>
      )}

      {/* Withdrawal Form */}
      {showForm && (
        <div
          className="bg-white rounded-2xl p-6"
          style={{
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base" style={{ color: "#0f172a" }}>
              {t.wallet.requestWithdrawal}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {t.common.cancel}
            </button>
          </div>

          <div
            className="mb-4 p-3 rounded-xl text-xs"
            style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", color: "#92400e" }}
          >
            {t.wallet.slaNote} — {t.wallet.availableBalance}: {formatCurrency(available, language)}
          </div>

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

          <form onSubmit={handleWithdrawal} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500">{t.wallet.withdrawAmountLabel.replace("{currency}", t.common.currency)}</label>
              <input
                type="number"
                required
                min={1}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500.00"
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">{t.wallet.bankNameLabel}</label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Al Rajhi Bank"
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">{t.wallet.holderNameLabel}</label>
              <input
                type="text"
                required
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Name as on account"
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500">{t.wallet.iban}</label>
              <input
                type="text"
                required
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="SA0000000000000000000000"
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 cursor-pointer transition-all"
                style={{ background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.2)" }}
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
              >
                {submitting ? t.wallet.processing : t.wallet.submitRequest}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        {/* Tab Header */}
        <div
          className="flex border-b"
          style={{ borderColor: "rgba(99,102,241,0.08)" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-3 px-4 text-sm font-semibold transition-all cursor-pointer"
              style={
                activeTab === tab.key
                  ? {
                      color: "#6366f1",
                      borderBottom: "2px solid #6366f1",
                      background: "rgba(99,102,241,0.04)",
                    }
                  : {
                      color: "#94a3b8",
                      borderBottom: "2px solid transparent",
                    }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {[t.wallet.transDate, t.wallet.transType, t.wallet.transDesc, t.wallet.transAmount].map((h) => (
                      <th
                        key={h}
                        className="pb-3 text-start text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#94a3b8" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                        {t.wallet.noTransactions}
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx, i) => (
                      <tr
                        key={tx.id}
                        style={{
                          borderTop: i > 0 ? "1px solid rgba(99,102,241,0.06)" : undefined,
                        }}
                      >
                        <td className="py-3 text-slate-500 text-xs">
                          {formatDate(tx.created_at, language)}
                        </td>
                        <td className="py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                            style={
                              tx.type === "CREDIT" || tx.type === "credit"
                                ? { background: "rgba(16,185,129,0.1)", color: "#059669" }
                                : { background: "rgba(239,68,68,0.1)", color: "#ef4444" }
                            }
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 text-xs">{tx.description || "-"}</td>
                        <td className="py-3 font-semibold text-slate-800">
                          {formatCurrency(tx.amount, language)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Withdrawals Tab */}
          {activeTab === "withdrawals" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {[t.wallet.transDate, t.wallet.transAmount, t.wallet.bank, t.wallet.iban, t.common.status, t.wallet.slaDeadline].map((h) => (
                      <th
                        key={h}
                        className="pb-3 text-start text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#94a3b8" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                        {t.wallet.noWithdrawals}
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w, i) => (
                      <tr
                        key={w.id}
                        style={{
                          borderTop: i > 0 ? "1px solid rgba(99,102,241,0.06)" : undefined,
                        }}
                      >
                        <td className="py-3 text-slate-500 text-xs">
                          {formatDate(w.created_at, language)}
                        </td>
                        <td className="py-3 font-semibold text-slate-800">
                          {formatCurrency(w.amount, language)}
                        </td>
                        <td className="py-3 text-slate-600 text-xs">{w.bank_name}</td>
                        <td className="py-3 text-slate-500 text-xs font-mono">{w.iban}</td>
                        <td className="py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={statusStyle(w.status)}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-xs">
                          {w.sla_deadline ? formatDate(w.sla_deadline, language) : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* How to Earn Tab */}
          {activeTab === "how-to-earn" && (
            <div className="flex flex-col gap-4">
              <div
                className="p-4 rounded-xl"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(129,140,248,0.04))", border: "1px solid rgba(99,102,241,0.1)" }}
              >
                <h4 className="font-semibold text-slate-800 mb-2">{t.wallet.howToEarnTitle}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {t.wallet.howToEarnDesc}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { step: "1", title: t.wallet.step1Title, desc: t.wallet.step1Desc },
                  { step: "2", title: t.wallet.step2Title, desc: t.wallet.step2Desc },
                  { step: "3", title: t.wallet.step3Title, desc: t.wallet.step3Desc },
                ].map((item) => (
                  <div key={item.step} className="flex flex-col gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
                    >
                      {item.step}
                    </div>
                    <h5 className="font-semibold text-slate-800 text-sm">{item.title}</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div
                className="p-4 rounded-xl text-sm"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", color: "#92400e" }}
              >
                {t.wallet.slaDetails}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
