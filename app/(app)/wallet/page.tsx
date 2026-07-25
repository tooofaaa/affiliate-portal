import AffiliateWalletContent from "@/components/features/wallet/AffiliateWalletContent";
import { getAffiliateWallet, getAffiliateTransactions, getAffiliateWithdrawals } from "@/lib/actions/affiliate";

export default async function WalletPage() {
  const [walletRes, txRes, wdRes] = await Promise.all([
    getAffiliateWallet(),
    getAffiliateTransactions(),
    getAffiliateWithdrawals(),
  ]);

  return (
    <AffiliateWalletContent
      wallet={walletRes.data}
      transactions={txRes.data}
      withdrawals={wdRes.data}
    />
  );
}
