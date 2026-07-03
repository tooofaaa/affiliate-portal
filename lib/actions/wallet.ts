"use server";

import { createClientServer } from "@/lib/supabase/server";
import { CustomerWallet, CustomerWalletTransaction } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getCustomerWallet(): Promise<{ data: CustomerWallet | null; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("customers")
    .select("id")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (!profile) return { data: null, error: "Profile not found" };

  // Fetch or create wallet
  let { data: wallet, error } = await supabase
    .from("customer_wallets")
    .select("*")
    .eq("customer_id", profile.id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!wallet) {
    const { data: newWallet, error: insertError } = await supabase
      .from("customer_wallets")
      .insert({
        customer_id: profile.id,
        balance: 0.00,
      })
      .select("*")
      .single();

    if (insertError) {
      return { data: null, error: insertError.message };
    }
    wallet = newWallet;
  }

  return { data: wallet as CustomerWallet, error: null };
}

export async function getWalletTransactions(): Promise<{ data: CustomerWalletTransaction[]; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("customers")
    .select("id")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (!profile) return { data: [], error: "Profile not found" };

  const { data: wallet } = await supabase
    .from("customer_wallets")
    .select("id")
    .eq("customer_id", profile.id)
    .maybeSingle();

  if (!wallet) return { data: [], error: null };

  const { data, error } = await supabase
    .from("customer_wallet_transactions")
    .select("*")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

export async function depositFunds(amount: number): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  if (amount <= 0) return { success: false, error: "Amount must be greater than 0" };

  const { data: profile } = await supabase
    .from("customers")
    .select("id")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (!profile) return { success: false, error: "Profile not found" };

  const { data: wallet } = await supabase
    .from("customer_wallets")
    .select("id, balance")
    .eq("customer_id", profile.id)
    .maybeSingle();

  if (!wallet) return { success: false, error: "Wallet not found" };

  // Perform deposit transaction
  const newBalance = Number(wallet.balance) + amount;

  const { error: updateError } = await supabase
    .from("customer_wallets")
    .update({ balance: newBalance })
    .eq("id", wallet.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Log transaction
  await supabase.from("customer_wallet_transactions").insert({
    wallet_id: wallet.id,
    amount: amount,
    transaction_type: "Deposit",
    description: "Funds Deposit",
  });

  revalidatePath("/wallet");
  revalidatePath("/dashboard");

  return { success: true, error: null };
}
