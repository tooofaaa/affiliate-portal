"use client";
import React, { useState } from "react";
import { formatDate, formatCurrency } from "@/lib/utils/formatters";
import { CustomerWalletTransaction } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface TransactionsListProps {
  transactions: CustomerWalletTransaction[];
}

export default function TransactionsList({ transactions }: TransactionsListProps) {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = transactions.filter(tRow => 
    tRow.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tRow.reference_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-bold text-gray-900">{t.wallet.recentTransactions}</h3>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder={t.wallet.searchTransactions}
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
              <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">{t.wallet.transDate}</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">{t.wallet.transType}</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">{t.wallet.transDesc}</th>
              <th className="px-4 py-3 text-end text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">{t.wallet.transAmount}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  {t.wallet.noTransactions}
                </td>
              </tr>
            ) : (
              filtered.map((transaction) => {
                const isCredit = transaction.transaction_type === 'CREDIT' || transaction.transaction_type === 'Deposit' || transaction.transaction_type === 'Refund' || transaction.transaction_type === 'Bonus';
                const typeLabel = isCredit ? t.wallet.credit : t.wallet.debit;
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(transaction.created_at, language)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${isCredit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {typeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{transaction.description}</span>
                        <span className="text-xs text-gray-400 font-mono">{transaction.reference_id}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm font-bold text-end ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                      {isCredit ? '+' : '-'}{formatCurrency(transaction.amount, language)}
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
