"use client";
import React from "react";
import { BankAccount } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface BankAccountsListProps {
  accounts: BankAccount[];
  onAdd: () => void;
}

export default function BankAccountsList({ accounts, onAdd }: BankAccountsListProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">{t.wallet.bankAccounts}</h3>
        <button 
          onClick={onAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          {t.wallet.addBankAccount}
        </button>
      </div>
      
      {accounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">{t.wallet.noBanks}</p>
          <button 
            onClick={onAdd}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            {t.wallet.addFirstBank}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => (
            <div key={account.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
              {account.is_primary && (
                <div className="absolute top-0 end-0 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bs-lg">
                  {t.wallet.primary}
                </div>
              )}
              
              <h4 className="font-bold text-gray-900 mb-1">{account.bank_name}</h4>
              <p className="text-sm text-gray-500 mb-4">{account.account_holder}</p>
              
              <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{t.wallet.accNum}</p>
                  <p className="font-mono text-sm text-gray-800">
                    **** {account.account_number.slice(-4)}
                  </p>
                </div>
                {account.iban && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{t.wallet.iban}</p>
                    <p className="font-mono text-sm text-gray-800">
                      {account.iban.substring(0, 4)} **** **** {account.iban.slice(-4)}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  account.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {account.is_verified ? t.wallet.verified : t.wallet.pending}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
