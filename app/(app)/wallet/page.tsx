"use client";

import { useEffect, useState } from "react";
import { getCustomerWallet, getWalletTransactions, depositFunds } from "@/lib/actions/wallet";
import { CustomerWallet, CustomerWalletTransaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function WalletPage() {
  const { t, language } = useLanguage();
  const [wallet, setWallet] = useState<CustomerWallet | null>(null);
  const [transactions, setTransactions] = useState<CustomerWalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  async function loadWalletData() {
    setIsLoading(true);
    const [walletRes, transRes] = await Promise.all([
      getCustomerWallet(),
      getWalletTransactions(),
    ]);

    if (walletRes.data) setWallet(walletRes.data);
    if (transRes.data) setTransactions(transRes.data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert(t.wallet.invalidAmount);
      return;
    }

    setIsDepositing(true);
    const res = await depositFunds(amt);
    if (res.success) {
      alert(t.wallet.depositSuccess.replace("{amount}", formatCurrency(amt, language)));
      setDepositAmount("");
      await loadWalletData();
    } else {
      alert(`${t.common.failed}: ${res.error}`);
    }
    setIsDepositing(false);
  };

  if (isLoading) {
    return <p className="text-gray-500 py-12 text-center">{t.common.loading}</p>;
  }

  return (
    <div className="flex flex-col gap-8 font-poppins pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-850">{t.wallet.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{t.wallet.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Balance & Quick Deposit */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Balance Card */}
          <div
            className="rounded-2xl p-6 text-white"
            style={{
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              boxShadow: "0 8px 30px rgba(99,102,241,0.25)",
            }}
          >
            <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">{t.wallet.availableBalance}</p>
            <h2 className="text-3xl font-bold mt-2">{formatCurrency(wallet?.balance || 0, language)}</h2>
            <p className="text-[10px] text-indigo-100 mt-4">{t.profile.verified}: {wallet?.currency || "SAR"}</p>
          </div>

          {/* Deposit Funds Card */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(99,102,241,0.1)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h3 className="font-semibold text-sm text-slate-800 mb-4">{t.wallet.addFunds}</h3>
            <form onSubmit={handleDeposit} className="flex flex-col gap-3">
              <input
                type="number"
                placeholder={t.wallet.amountPlaceholder}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                required
              />
              <Button 
                type="submit" 
                disabled={isDepositing}
                className="w-full justify-center cursor-pointer"
              >
                {isDepositing ? t.wallet.processing : t.wallet.depositNow}
              </Button>
            </form>
          </div>
        </div>

        {/* Right: Transactions History */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}
          >
            <h3 className="font-semibold text-base text-slate-800">{t.wallet.history}</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(248,249,252,0.8)" }}>
                  {[t.wallet.date, t.wallet.type, t.wallet.ref, t.wallet.description, t.wallet.amount].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "#94a3b8" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {t.wallet.noTransactions}
                    </td>
                  </tr>
                ) : (
                  transactions.map((tItem) => {
                    const isCredit = tItem.transaction_type === "Deposit" || tItem.transaction_type === "Refund" || tItem.transaction_type === "Bonus";
                    return (
                      <tr key={tItem.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-600 text-xs">{formatDate(tItem.created_at, language)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCredit ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {tItem.transaction_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-indigo-500">{tItem.reference_id || "-"}</td>
                        <td className="px-6 py-4 text-slate-600 text-xs">{tItem.description}</td>
                        <td
                          className={`px-6 py-4 font-bold text-end ${
                            isCredit ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {isCredit ? "+" : "-"}{formatCurrency(tItem.amount, language)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
