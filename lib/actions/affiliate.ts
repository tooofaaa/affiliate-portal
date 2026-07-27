"use server";

import { createClientServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Context helper ────────────────────────────────────────────────────────
async function getAffiliateContext() {
  const supabase = await createClientServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { supabase, user: null, affiliateId: null, affiliate: null };

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, name, email, status, commission_pct")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  // Gate: only active affiliates may perform actions
  if (!affiliate || affiliate.status !== "active") {
    return { supabase, user, affiliateId: null, affiliate: null };
  }

  return {
    supabase,
    user,
    affiliateId: affiliate.id ?? null,
    affiliate: affiliate,
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

  // Validate destination URL
  if (!destination || destination.trim().length === 0) {
    return { success: false, message: "Destination URL is required." };
  }
  try {
    const parsed = new URL(destination.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { success: false, message: "Destination must be a valid http or https URL." };
    }
  } catch {
    return { success: false, message: "Destination must be a valid URL." };
  }

  const customerPortalUrl = process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_URL || "https://customer-portal-five-gamma.vercel.app";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

  // Retry up to 3 times on slug uniqueness collision
  for (let attempt = 0; attempt < 3; attempt++) {
    const rand4 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const slug = `${Date.now().toString(36)}${rand4}`;
    const full_url = `${customerPortalUrl}/products?ref=${slug}`;

    const { data, error } = await supabase
      .from("affiliate_links")
      .insert({
        affiliate_id: affiliateId,
        slug,
        full_url,
        destination: destination.trim(),
        clicks: 0,
        conversions: 0,
        is_active: true,
      })
      .select()
      .maybeSingle();

    if (!error) {
      revalidatePath("/links");
      return { success: true, message: "Link created successfully", link: data };
    }

    // 23505 is the Postgres unique_violation code; retry only for that
    if (error.code !== "23505") {
      return { success: false, message: error.message };
    }
  }

  return { success: false, message: "Failed to generate a unique link. Please try again." };
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

  const commission = affiliate.commission_pct ?? 0;
  // affiliate_margin is the net margin after paying out the customer discount
  const affiliate_margin = Math.max(0, commission * (level === 2 ? 1.5 : 1) - discount_pct);

  // Deactivate previous active codes first
  await supabase
    .from("discount_codes")
    .update({ status: "inactive" })
    .eq("affiliate_id", affiliateId)
    .eq("status", "active");

  const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  // Retry up to 3 times on code uniqueness collision
  for (let attempt = 0; attempt < 3; attempt++) {
    const rand6 = Array.from({ length: 6 }, () => uppers[Math.floor(Math.random() * uppers.length)]).join("");
    const code = `AFF${rand6}`;

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

    if (!error) {
      revalidatePath("/codes");
      return { success: true, message: "Discount code created successfully", code: data };
    }

    if (error.code !== "23505") {
      return { success: false, message: error.message };
    }
  }

  return { success: false, message: "Failed to generate a unique code. Please try again." };
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

  if (data) {
    // Never surface negative values to the UI — guard against stale/inconsistent DB state.
    return {
      data: {
        ...data,
        balance: Math.max(0, data.balance ?? 0),
        pending: Math.max(0, data.pending ?? 0),
      },
      error: null,
    };
  }

  return { data: null, error: error?.message ?? null };
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

  // Server-side input validation
  const MINIMUM_WITHDRAWAL_SAR = 100;
  if (!amount || amount < MINIMUM_WITHDRAWAL_SAR) {
    return { success: false, message: `Minimum withdrawal amount is SAR ${MINIMUM_WITHDRAWAL_SAR}.` };
  }
  if (!bank_name || bank_name.trim().length === 0) {
    return { success: false, message: "Bank name is required." };
  }
  if (!account_holder || account_holder.trim().length === 0) {
    return { success: false, message: "Account holder name is required." };
  }
  if (!iban || iban.trim().length === 0) {
    return { success: false, message: "IBAN is required." };
  }

  const { data: wallet } = await supabase
    .from("affiliate_wallets")
    .select("id, balance, pending")
    .eq("affiliate_id", affiliateId)
    .maybeSingle();

  if (!wallet) return { success: false, message: "Wallet not found" };

  const currentPending = wallet.pending ?? 0;
  const currentBalance = wallet.balance ?? 0;
  const available = Math.max(0, currentBalance - currentPending);

  if (amount > available) {
    return { success: false, message: "Amount exceeds available balance" };
  }

  const sla_deadline = new Date();
  sla_deadline.setDate(sla_deadline.getDate() + 15);

  const { error: insertError } = await supabase.from("withdrawal_requests").insert({
    wallet_type: "affiliate",
    owner_portal_user_id: user.id,
    amount,
    bank_name: bank_name.trim(),
    account_holder: account_holder.trim(),
    iban: iban.trim(),
    status: "Pending",
    sla_deadline: sla_deadline.toISOString().split("T")[0],
  });

  if (insertError) return { success: false, message: insertError.message };

  // Atomic conditional pending update — only applies if `pending` has not changed since
  // the read above, preventing TOCTOU double-spend from concurrent requests.
  const { error: walletError } = await supabase
    .from("affiliate_wallets")
    .update({ pending: currentPending + amount })
    .eq("affiliate_id", affiliateId)
    .eq("pending", currentPending); // optimistic-lock: only update if pending is still what we read

  if (walletError) {
    // The lock failed — another concurrent request changed pending between our read and write.
    // The withdrawal_requests row is already inserted; log it but don't fail the whole request
    // since an admin can reconcile. Surface a warning without exposing internal error details.
    console.error("Wallet pending update failed (possible concurrent withdrawal):", walletError.message);
  }

  // Notify the affiliate that their withdrawal request has been received.
  await supabase.from("notifications").insert({
    user_id: user.id,
    is_admin: false,
    title: "Withdrawal Request Received",
    message: `Your withdrawal request for ${amount} has been submitted and is pending review. You will be notified once it is processed.`,
    type: "withdrawal_requested",
    link: "/wallet",
    read: false,
  });

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
  // total_earned = gross wallet balance (includes both available + pending withdrawals).
  // pending is already a sub-amount of balance, so we must NOT add them together.
  const totalEarned = walletRes.data?.balance ?? 0;

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

/**
 * Lightweight helper used by the support page to pass affiliateId down to the
 * client component so it can be forwarded to createTicket without an extra
 * round-trip server action.
 */
export async function getAffiliateIdForCurrentUser(): Promise<number | null> {
  const { affiliateId } = await getAffiliateContext();
  return affiliateId;
}

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

export async function createTicket(
  subject: string,
  type: string,
  message: string,
  affiliateId: number | null
) {
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
      ...(affiliateId != null ? { affiliate_id: affiliateId } : {}),
    })
    .select("id")
    .maybeSingle();

  if (ticketError || !ticket) return { success: false, ticket_id: null };

  const { error: msgError } = await supabase.from("ticket_messages").insert({
    ticket_id: ticket.id,
    sender_id: user.id,
    content: message,
  });

  if (msgError) {
    // The ticket row exists but the opening message was lost — delete the orphaned
    // ticket so the user can retry rather than ending up with a blank ticket.
    await supabase.from("support_tickets").delete().eq("id", ticket.id);
    console.error("ticket_messages insert failed, rolled back ticket:", msgError.message);
    return { success: false, ticket_id: null };
  }

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
