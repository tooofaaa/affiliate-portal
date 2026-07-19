"use client";
import React, { useState, useEffect, useRef } from 'react';
import WalletSummary from './WalletSummary';
import TransactionsList from './TransactionsList';
import WithdrawalsList from './WithdrawalsList';
import BankAccountsList from './BankAccountsList';
import WithdrawalModal from './WithdrawalModal';
import AddBankAccountModal from './AddBankAccountModal';
import { useRouter } from 'next/navigation';
import { CustomerWalletTransaction, WalletWithdrawal, BankAccount } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { createClient } from '@/lib/supabase/client';

interface WalletPageContentProps {
  summary: any;
  transactions: CustomerWalletTransaction[];
  withdrawals: WalletWithdrawal[];
  bankAccounts: BankAccount[];
}

export default function WalletPageContent({ summary, transactions, withdrawals, bankAccounts }: WalletPageContentProps) {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals' | 'banks'>('transactions');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const handleWithdrawSuccess = () => {
    setIsWithdrawModalOpen(false);
    setActiveTab('withdrawals');
    router.refresh();
  };

  const handleBankSuccess = () => {
    setIsBankModalOpen(false);
    router.refresh();
  };

  const handleWithdrawClick = () => {
    if (bankAccounts.length === 0) {
      alert(t.wallet.addBankAlert);
      setActiveTab('banks');
      setIsBankModalOpen(true);
    } else {
      setIsWithdrawModalOpen(true);
    }
  };

  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("wallet-realtime-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_wallet_transactions" },
        () => {
          routerRef.current.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.wallet.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{t.wallet.subtitle}</p>
      </div>

      <WalletSummary
        availableBalance={summary.availableBalance}
        refundableBalance={summary.refundableBalance}
        cashbackBalance={summary.cashbackBalance}
        pendingWithdrawals={summary.pendingWithdrawals}
        totalCredits={summary.totalCredits}
        onWithdraw={handleWithdrawClick}
      />

      <div className="mt-8">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'transactions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('transactions')}
          >
            {t.wallet.history}
          </button>
          <button
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'withdrawals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('withdrawals')}
          >
            {t.wallet.withdrawals}
          </button>
          <button
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'banks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('banks')}
          >
            {t.wallet.bankAccounts}
          </button>
        </div>

        {activeTab === 'transactions' && <TransactionsList transactions={transactions} />}
        {activeTab === 'withdrawals' && <WithdrawalsList withdrawals={withdrawals} />}
        {activeTab === 'banks' && <BankAccountsList accounts={bankAccounts} onAdd={() => setIsBankModalOpen(true)} />}
      </div>

      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={summary.refundableBalance}
        bankAccounts={bankAccounts}
        onSuccess={handleWithdrawSuccess}
      />

      <AddBankAccountModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onSuccess={handleBankSuccess}
      />
    </div>
  );
}
