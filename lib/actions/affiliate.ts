"use server";

import { createClientServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Context helper ────────────────────────────────────────────────────────
async function getAffiliateContext() {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, affiliateId: null, affiliate: null };

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, name, email, status, commission_pct")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    affiliateId: affiliate?.id ?? null,
    affiliate: affiliate ?? null,
  };
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const { supabase, affiliateId } = await getAffiliateContext();

  if (!affiliateId) {
    return {
      total_earnings: 0,
      active_links: 0,
      total_clicks: 0,
      total_conversions: 0,
      wallet_balance: 0,
      recent_links: [],
    };
  }

  const [walletRes, linksRes] = await Promise.all([
    supabase
      .from("affiliate_wallets")
      .select("balance")
      .eq("affiliate_id", affiliateId)
      .maybeSingle(),
    supabase
      .from("affiliate_links")
      .select("id, slug, full_url, destination, clicks, conversions, is_active, created_at")
      .eq("affiliate_id", affiliateId)
      .order("created_at", { ascending: false }),
  ]);

  const links = linksRes.data ?? [];
  const activeLinks = links.filter((l) => l.is_active).length;
  const totalClicks = links.reduce((s, l) => s + (l.clicks ?? 0), 0);
  const totalConversions = links.reduce((s, l) => s + (l.conversions ?? 0), 0);

  return {
    total_earnings: walletRes.data?.balance ?? 0,
    active_links: activeLinks,
    total_clicks: totalClicks,
    total_conversions: totalConversions,
    wallet_balance: walletRes.data?.balance ?? 0,
    recent_links: links.slice(0, 5),
  };
}

// ── Tracking Links ────────────────────────────────────────────────────────
export async function getMyLinks() {
  const { supabase, affiliateId } = await getAffiliateContext();
  if (!affiliateId) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("affiliate_links")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function createLink(destination: string) {
  const { supabase, affiliateId } = await getAffiliateContext();
  if (!affiliateId) return { success: false, message: "Not authenticated" };

  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const rand4 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const slug = `${Date.now().toString(36)}${rand4}`;
  const customerPortalUrl = process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_URL || "https://customer-portal-five-gamma.vercel.app";
  const full_url = `${customerPortalUrl}/products?ref=${slug}`;

  const { data, error } = await supabase
    .from("affiliate_links")
    .insert({
      affiliate_id: affiliateId,
      slug,
      full_url,
      destination,
      clicks: 0,
      conversions: 0,
      is_active: true,
    })
    .select()
    .maybeSingle();

  if (error) return { success: false, message: error.message };

  revalidatePath("/links");
  return { success: true, message: "Link created successfully", link: data };
}

export async function deactivateLink(id: number) {
  const { supabase, affiliateId } = await getAffiliateContext();
  if (!affiliateId) return { success: false };

  const { error } = await supabase
    .from("affiliate_links")
    .update({ is_active: false })
    .eq("id", id)
    .eq("affiliate_id", affiliateId);

  revalidatePath("/links");
  return { success: !error };
}

// ── Discount Codes ────────────────────────────────────────────────────────
export async function getMyCode() {
  const { supabase, affiliateId } = await getAffiliateContext();
  if (!affiliateId) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data: data ?? null, error: error?.message ?? null };
}

export async function getCodeHistory() {
  const { supabase, affiliateId } = await getAffiliateContext();
  if (!affiliateId) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function createDiscountCode(discount_pct: number, level: 1 | 2) {
  const { supabase, affiliateId, affiliate } = await getAffiliateContext();
  if (!affiliateId || !affiliate) return { success: false, message: "Not authenticated" };

  if (discount_pct < 1 || discount_pct > 25) {
    return { success: false, message: "Discount percentage must be between 1 and 25" };
  }

  const affiliate_margin = affiliate.commission_pct * (level === 2 ? 1.5 : 1);

  const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rand6 = Array.from({ length: 6 }, () => uppers[Math.floor(Math.random() * uppers.length)]).join("");
  const code = `AFF${rand6}`;

  // Deactivate previous active codes first
  await supabase
    .from("discount_codes")
    .update({ status: "inactive" })
    .eq("affiliate_id", affiliateId)
    .eq("status", "active");

  const { data, error } = await supabase
    .from("discount_codes")
    .insert({
      affiliate_id: affiliateId,
      code,
      level,
      discount_pct,
      affiliate_margin,
      status: "active",
      uses_count: 0,
    })
    .select()
    .maybeSingle();

  if (error) return { success: false, message: error.message };

  revalidatePath("/codes");
  return { success: true, message: "Discount code created successfully", code: data };
}

// ── Wallet ────────────────────────────────────────────────────────────────
export async function getAffiliateWallet() {
  const { supabase, affiliateId } = await getAffiliateContext();
  if (!affiliateId) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("affiliate_wallets")
    .select("id, balance, pending, currency")
    .eq("affiliate_id", affiliateId)
    .maybeSingle();

  return { data: data ?? null, error: error?.message ?? null };
}

export async function getAffiliateTransactions() {
  const { supabase, affiliateId } = await getAffiliateContext();
  if (!affiliateId) return { data: [], error: "Not authenticated" };

  // Get wallet id first
  const { data: wallet } = await supabase
    .from("affiliate_wallets")
    .select("id")
    .eq("affiliate_id", affiliateId)
    .maybeSingle();

  if (!wallet) return { data: [], error: null };

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_type", "affiliate")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getAffiliateWithdrawals() {
  const { supabase, user } = await getAffiliateContext();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("owner_portal_user_id", user.id)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function requestAffiliateWithdrawal(
  amount: number,
  bank_name: string,
  account_holder: string,
  iban: string
) {
  const { supabase, user, affiliateId } = await getAffiliateContext();
  if (!user || !affiliateId) return { success: false, message: "Not authenticated" };

  const { data: wallet } = await supabase
    .from("affiliate_wallets")
    .select("id, balance, pending")
    .eq("affiliate_id", affiliateId)
    .maybeSingle();

  if (!wallet) return { success: false, message: "Wallet not found" };

  const available = (wallet.balance ?? 0) - (wallet.pending ?? 0);
  if (amount > available) {
    return { success: false, message: "Amount exceeds available balance" };
  }

  const sla_deadline = new Date();
  sla_deadline.setDate(sla_deadline.getDate() + 15);

  const { error: insertError } = await supabase.from("withdrawal_requests").insert({
    wallet_type: "affiliate",
    owner_portal_user_id: user.id,
    amount,
    bank_name,
    account_holder,
    iban,
    status: "Pending",
    sla_deadline: sla_deadline.toISOString().split("T")[0],
  });

  if (insertError) return { success: false, message: insertError.message };

  await supabase
    .from("affiliate_wallets")
    .update({ pending: (wallet.pending ?? 0) + amount })
    .eq("affiliate_id", affiliateId);

  revalidatePath("/wallet");
  return { success: true, message: "Withdrawal request submitted successfully" };
}

// ── Performance ───────────────────────────────────────────────────────────
export async function getPerformanceStats() {
  const { supabase, affiliateId } = await getAffiliateContext();

  if (!affiliateId) {
    return {
      total_clicks: 0,
      total_conversions: 0,
      conversion_rate: 0,
      total_earned: 0,
      active_codes: 0,
      links_count: 0,
      links: [],
    };
  }

  const [linksRes, walletRes, codesRes] = await Promise.all([
    supabase
      .from("affiliate_links")
      .select("id, slug, full_url, destination, clicks, conversions, is_active")
      .eq("affiliate_id", affiliateId)
      .order("conversions", { ascending: false }),
    supabase
      .from("affiliate_wallets")
      .select("balance, pending")
      .eq("affiliate_id", affiliateId)
      .maybeSingle(),
    supabase
      .from("discount_codes")
      .select("id", { count: "exact", head: true })
      .eq("affiliate_id", affiliateId)
      .eq("status", "active"),
  ]);

  const links = linksRes.data ?? [];
  const totalClicks = links.reduce((s, l) => s + (l.clicks ?? 0), 0);
  const totalConversions = links.reduce((s, l) => s + (l.conversions ?? 0), 0);
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const totalEarned = (walletRes.data?.balance ?? 0) + (walletRes.data?.pending ?? 0);

  return {
    total_clicks: totalClicks,
    total_conversions: totalConversions,
    conversion_rate: conversionRate,
    total_earned: totalEarned,
    active_codes: codesRes.count ?? 0,
    links_count: links.length,
    links,
  };
}

// ── Support ───────────────────────────────────────────────────────────────
export async function getMyTickets() {
  const { supabase, user } = await getAffiliateContext();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function createTicket(subject: string, type: string, message: string) {
  const { supabase, user } = await getAffiliateContext();
  if (!user) return { success: false, ticket_id: null };

  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .insert({
      subject,
      type,
      status: "open",
      created_by: user.id,
      portal: "affiliate",
    })
    .select("id")
    .maybeSingle();

  if (ticketError || !ticket) return { success: false, ticket_id: null };

  await supabase.from("ticket_messages").insert({
    ticket_id: ticket.id,
    sender_id: user.id,
    content: message,
  });

  revalidatePath("/support");
  return { success: true, ticket_id: ticket.id };
}

export async function getTicketMessages(ticket_id: number) {
  const { supabase, user } = await getAffiliateContext();
  if (!user) return { data: [], error: "Unauthorized" };

  // Verify this affiliate owns the ticket before returning messages
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("id", ticket_id)
    .eq("created_by", user.id)
    .maybeSingle();
  if (!ticket) return { data: [], error: "Ticket not found" };

  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticket_id)
    .order("created_at", { ascending: true });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function addTicketMessage(ticket_id: number, content: string) {
  const { supabase, user } = await getAffiliateContext();
  if (!user) return { success: false };

  // Verify ownership before allowing message insert
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("id", ticket_id)
    .eq("created_by", user.id)
    .maybeSingle();
  if (!ticket) return { success: false };

  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id,
    sender_id: user.id,
    content,
  });

  revalidatePath(`/support/${ticket_id}`);
  return { success: !error };
}
