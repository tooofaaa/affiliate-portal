import { getWalletSummary, getTransactions, getWithdrawals, getBankAccounts } from "@/lib/actions/wallet";
import WalletPageContent from "@/components/features/wallet/WalletPageContent";

export default async function WalletPage() {
  const [summary, transactionsRes, withdrawalsRes, bankAccountsRes] = await Promise.all([
    getWalletSummary(),
    getTransactions({ pageSize: 50 }),
    getWithdrawals(),
    getBankAccounts(),
  ]);
  
  return (
    <div className="flex flex-col gap-6 pb-8 page-enter">
      <WalletPageContent
        summary={summary}
        transactions={transactionsRes.data}
        withdrawals={withdrawalsRes.data}
        bankAccounts={bankAccountsRes.data}
      />
    </div>
  );
}
