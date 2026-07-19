"use client";
import React from "react";
import { formatCurrency } from "@/lib/utils/formatters";
import { ArrowRightIcon } from "@/lib/icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface WalletSummaryProps {
  availableBalance: number;
  refundableBalance: number;
  cashbackBalance: number;
  pendingWithdrawals: number;
  totalCredits: number;
  totalCharges: number;
  onWithdraw: () => void;
}

export default function WalletSummary({
  availableBalance,
  refundableBalance,
  cashbackBalance,
  pendingWithdrawals,
  totalCredits,
  onWithdraw
}: WalletSummaryProps) {
  const { t, language } = useLanguage();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <p className="text-indigo-100 font-medium mb-2 uppercase tracking-wider text-sm">{t.wallet.availableBalance}</p>
            <h2 className="text-5xl font-bold mb-1">
              {formatCurrency(availableBalance, language).replace('SAR', '').replace('ر.س', '')} <span className="text-2xl font-normal opacity-80">{language === 'ar' ? 'ر.س' : 'SAR'}</span>
            </h2>
          </div>
          
          <div className="mt-6 md:mt-0">
            <button 
              onClick={onWithdraw}
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2 cursor-pointer"
            >
              {t.wallet.requestWithdrawal}
              <ArrowRightIcon className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-8 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-indigo-200 text-xs uppercase font-semibold">{language === 'ar' ? 'الأموال القابلة للاسترداد' : 'Refundable Funds'}</p>
            <p className="font-bold text-lg mt-0.5">{formatCurrency(refundableBalance, language)}</p>
          </div>
          <div>
            <p className="text-indigo-200 text-xs uppercase font-semibold">{language === 'ar' ? 'رصيد الكاش‌باك' : 'Cashback Balance'}</p>
            <p className="font-bold text-lg mt-0.5">{formatCurrency(cashbackBalance, language)}</p>
          </div>
          <div>
            <p className="text-indigo-200 text-xs uppercase font-semibold">{t.wallet.pendingWithdrawals}</p>
            <p className="font-semibold text-lg mt-0.5">{formatCurrency(pendingWithdrawals, language)}</p>
          </div>
          <div>
            <p className="text-indigo-200 text-xs uppercase font-semibold">{language === 'ar' ? 'إجمالي التدفقات' : 'Total Inflows'}</p>
            <p className="font-semibold text-lg mt-0.5">{formatCurrency(totalCredits, language)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
