"use server";

// Affiliate wallet actions — re-exports from affiliate.ts which contains the correct
// affiliate_wallets / withdrawal_requests implementations.
export {
  getAffiliateWallet as getWalletSummary,
  getAffiliateTransactions as getTransactions,
  getAffiliateWithdrawals as getWithdrawals,
  requestAffiliateWithdrawal as requestWithdrawal,
} from "@/lib/actions/affiliate";
