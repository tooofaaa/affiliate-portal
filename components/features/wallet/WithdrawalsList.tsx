"use client";
import React, { useState } from "react";
import { formatDate, formatCurrency } from "@/lib/utils/formatters";
import { WalletWithdrawal } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface WithdrawalsListProps {
  withdrawals: WalletWithdrawal[];
}

export default function WithdrawalsList({ withdrawals }: WithdrawalsListProps) {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = withdrawals.filter(w => 
    w.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-bold text-gray-900">{t.wallet.withdrawalHistory}</h3>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder={t.wallet.searchStatus}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">{t.wallet.requestId}</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">{t.wallet.requestedOn}</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">{t.wallet.transAmount}</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">{t.wallet.bankAccount}</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">{language === 'ar' ? 'الحالة' : 'Status'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {t.wallet.noWithdrawals}
                </td>
              </tr>
            ) : (
              filtered.map((w) => {
                const statusLabel = t.wallet.wdStatusMap[w.status as keyof typeof t.wallet.wdStatusMap] || w.status;
                const bankName = (w as any).bank_account?.bank_name || t.wallet.bankAccount;
                return (
                  <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">WD-{w.id.toString().padStart(4, '0')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(w.requested_at, language)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrency(w.amount, language)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col text-sm">
                        <span className="font-medium text-gray-900">{bankName}</span>
                        <span className="text-xs text-gray-500">**** {(w as any).bank_account?.account_number?.slice(-4) || ''}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        w.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        w.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        w.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {statusLabel}
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
  );
}
