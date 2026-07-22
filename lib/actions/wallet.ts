"use server";

import { createClientServer } from "@/lib/supabase/server";
import { BankAccount, CustomerWallet, CustomerWalletTransaction, WalletWithdrawal } from "@/lib/types";
import { revalidatePath } from "next/cache";

async function getCustomerContext() {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, customerId: null, walletId: null };
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('portal_user_id', user.id)
    .maybeSingle();
  if (!customer) return { supabase, user, customerId: null, walletId: null };

  let { data: wallet } = await supabase
    .from('customer_wallets')
    .select('id')
    .eq('customer_id', customer.id)
    .maybeSingle();

  if (!wallet) {
    const { data: newWallet } = await supabase
      .from('customer_wallets')
      .insert({ customer_id: customer.id, balance: 0.00 })
      .select('id')
      .single();
    wallet = newWallet;
  }

  return { supabase, user, customerId: customer.id, walletId: wallet?.id ?? null };
}


export async function getWalletSummary(): Promise<{
  availableBalance: number;
  refundableBalance: number;
  cashbackBalance: number;
  pendingWithdrawals: number;
  totalCredits: number;
  totalCharges: number;
  currency: string;
  error: string | null;
}> {
  const { supabase, customerId, walletId } = await getCustomerContext();
  if (!customerId || !walletId) {
    return { availableBalance: 0, refundableBalance: 0, cashbackBalance: 0, pendingWithdrawals: 0, totalCredits: 0, totalCharges: 0, currency: 'SAR', error: "Not authenticated" };
  }

  const { data: txs, error: txError } = await supabase
    .from("customer_wallet_transactions")
    .select("amount, transaction_type, is_cashback")
    .eq("wallet_id", walletId);

  if (txError) {
    console.error("getWalletSummary database query error:", txError);
    return { availableBalance: 0, refundableBalance: 0, cashbackBalance: 0, pendingWithdrawals: 0, totalCredits: 0, totalCharges: 0, currency: 'SAR', error: txError.message };
  }

  let totalCredits = 0;
  let totalCharges = 0;
  let totalCashback = 0;
  let totalRefundable = 0;

  txs?.forEach((t: any) => {
    const amt = Number(t.amount) || 0;
    const isCredit = t.transaction_type === 'CREDIT' || t.transaction_type === 'Deposit' || t.transaction_type === 'Refund' || t.transaction_type === 'Bonus';
    const isCharge = t.transaction_type === 'CHARGE' || t.transaction_type === 'Payment' || t.transaction_type === 'StorageCharge';
    
    if (isCredit) {
      totalCredits += amt;
      if (t.is_cashback) {
        totalCashback += amt;
      } else {
        totalRefundable += amt;
      }
    } else if (isCharge) {
      totalCharges += amt;
    }
  });

  const availableBalance = totalCredits - totalCharges;
  const cashbackBalance = Math.max(0, totalCashback - totalCharges);
  const remainingChargesForRefundable = Math.max(0, totalCharges - totalCashback);
  const refundableBalance = Math.max(0, totalRefundable - remainingChargesForRefundable);

  // Sync stored balance column so it stays consistent with the ledger
  await supabase
    .from("customer_wallets")
    .update({ balance: Math.max(0, availableBalance) })
    .eq("id", walletId);

  // Pending withdrawals
  const { data: withdrawals, error: wdError } = await supabase
    .from("customer_wallet_withdrawals")
    .select("amount")
    .eq("customer_id", customerId)
    .in("status", ["Pending", "Processing"]);

  if (wdError) {
    console.error("getWalletSummary withdrawals query error:", wdError);
  }

  let pendingWithdrawals = 0;
  if (!wdError && withdrawals) {
    pendingWithdrawals = withdrawals.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }

  return {
    availableBalance,
    refundableBalance,
    cashbackBalance,
    pendingWithdrawals,
    totalCredits,
    totalCharges,
    currency: 'SAR',
    error: null
  };
}

export async function getTransactions(params?: {
  type?: 'CREDIT' | 'CHARGE';
  page?: number;
  pageSize?: number;
}): Promise<{ data: CustomerWalletTransaction[]; total: number; error: string | null }> {
  const { supabase, walletId } = await getCustomerContext();
  if (!walletId) return { data: [], total: 0, error: "Not authenticated" };

  let query = supabase
    .from("customer_wallet_transactions")
    .select("*", { count: "exact" })
    .eq("wallet_id", walletId);

  if (params?.type) {
    if (params.type === 'CREDIT') {
      query = query.in('transaction_type', ['CREDIT', 'Deposit', 'Refund', 'Bonus']);
    } else {
      query = query.in('transaction_type', ['CHARGE', 'Payment', 'StorageCharge']);
    }
  }
  
  query = query.order("created_at", { ascending: false });

  if (params?.page && params?.pageSize) {
    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    query = query.range(from, to);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("getTransactions query error:", error);
  }
  
  return { data: (data as any) || [], total: count || 0, error: error?.message || null };
}

export async function getBankAccounts(): Promise<{ data: BankAccount[]; error: string | null }> {
  const { supabase, customerId } = await getCustomerContext();
  if (!customerId) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("customer_bank_accounts")
    .select("*")
    .eq("customer_id", customerId)
    .order("is_primary", { ascending: false });

  return { data: (data as any) || [], error: error?.message || null };
}

export async function addBankAccount(account: {
  bank_name: string;
  account_holder: string;
  account_number: string;
  iban?: string;
  swift_code?: string;
  is_primary?: boolean;
}): Promise<{ error: string | null }> {
  const { supabase, customerId } = await getCustomerContext();
  if (!customerId) return { error: "Not authenticated" };

  if (account.is_primary) {
    await supabase.from("customer_bank_accounts").update({ is_primary: false }).eq("customer_id", customerId);
  }

  const { error } = await supabase.from("customer_bank_accounts").insert({
    ...account,
    customer_id: customerId,
    is_verified: false
  });

  if (error) return { error: error.message };
  
  revalidatePath("/wallet");
  return { error: null };
}

export async function getWithdrawals(): Promise<{ data: WalletWithdrawal[]; error: string | null }> {
  const { supabase, customerId } = await getCustomerContext();
  if (!customerId) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("customer_wallet_withdrawals")
    .select("*, bank_account:customer_bank_accounts(bank_name, account_number)")
    .eq("customer_id", customerId)
    .order("requested_at", { ascending: false });

  return { data: (data as any) || [], error: error?.message || null };
}

export async function requestWithdrawal(params: {
  amount: number;
  bank_account_id: number;
  notes?: string;
}): Promise<{ error: string | null }> {
  const { supabase, customerId, walletId } = await getCustomerContext();
  if (!customerId || !walletId) return { error: "Not authenticated" };

  // Check refundable balance directly (avoids double auth round-trip via getWalletSummary)
  const { data: txs } = await supabase
    .from("customer_wallet_transactions")
    .select("amount, transaction_type, is_cashback")
    .eq("wallet_id", walletId);

  let totalCashback = 0;
  let totalRefundable = 0;
  let totalCharges = 0;
  txs?.forEach((t: any) => {
    const amt = Number(t.amount) || 0;
    const isCredit = t.transaction_type === 'CREDIT' || t.transaction_type === 'Deposit' || t.transaction_type === 'Refund' || t.transaction_type === 'Bonus';
    const isCharge = t.transaction_type === 'CHARGE' || t.transaction_type === 'Payment' || t.transaction_type === 'StorageCharge';
    if (isCredit) {
      if (t.is_cashback) totalCashback += amt;
      else totalRefundable += amt;
    } else if (isCharge) {
      totalCharges += amt;
    }
  });
  const remainingChargesForRefundable = Math.max(0, totalCharges - totalCashback);
  const refundableBalance = Math.max(0, totalRefundable - remainingChargesForRefundable);

  if (params.amount > refundableBalance) {
    return { error: "Insufficient withdrawable (refundable) balance" };
  }

  const { error: wdError } = await supabase.from("customer_wallet_withdrawals").insert({
    customer_id: customerId,
    amount: params.amount,
    bank_account_id: params.bank_account_id,
    notes: params.notes,
    status: 'Pending'
  });

  if (wdError) return { error: wdError.message };

  // CRITICAL: Record corresponding CHARGE — must be checked to ensure data consistency
  const { error: txError } = await supabase.from("customer_wallet_transactions").insert({
    wallet_id: walletId,
    amount: params.amount,
    transaction_type: 'CHARGE',
    description: `Withdrawal Request: ${params.notes || ''}`
  });

  if (txError) {
    console.error("requestWithdrawal: CHARGE insert failed after withdrawal created:", txError);
    return { error: "Withdrawal recorded but balance deduction failed. Please contact support." };
  }

  revalidatePath("/wallet");
  return { error: null };
}

export async function getCustomerWallet(): Promise<{ data: CustomerWallet | null; error: string | null }> {
  const { supabase, customerId, walletId } = await getCustomerContext();
  if (!customerId || !walletId) return { data: null, error: "Unauthorized" };

  const { data: wallet, error } = await supabase
    .from("customer_wallets")
    .select("*")
    .eq("id", walletId)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: wallet as CustomerWallet, error: null };
}
