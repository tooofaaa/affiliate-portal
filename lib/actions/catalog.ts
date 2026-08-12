"use server";

import { createAdminClient, createClientServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Context helper (for write actions) ───────────────────────────────────────
async function getAffCtx() {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: aff } = await supabase
    .from("affiliates")
    .select("id,commission_pct")
    .eq("portal_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  return aff ? { supabase, user, affiliateId: aff.id as number, commissionPct: aff.commission_pct as number } : null;
}

// ── Read actions (use admin client for unrestricted reads) ────────────────────

export async function getAffiliatableMemberships() {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("membership_levels")
    .select("id, level_name, min_spent_sar, discount_percentage, benefits, price_sar, is_active, tier_order")
    .eq("is_active", true)
    .order("tier_order", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });
  return data ?? [];
}

export async function getAffiliatablePackages() {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("packages")
    .select("id, name, name_ar, description, price_sar, duration_days, features, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  return data ?? [];
}

export async function getAffiliatableProducts() {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("products")
    .select(
      "id, product_name, product_category, sell_price, product_image, description, supplier_id, suppliers(id, supplier_name)"
    )
    .eq("approval_status", "Approved")
    .eq("is_active", true)
    .gt("amount_stock", 0)
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getMyLinksForItem(item_type: string, item_id: number) {
  const ctx = await getAffCtx();
  if (!ctx) return [];
  const { data } = await ctx.supabase
    .from("affiliate_links")
    .select("id, slug, full_url, destination, clicks, conversions, is_active, created_at")
    .eq("affiliate_id", ctx.affiliateId)
    .eq("item_type", item_type)
    .eq("item_id", item_id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createCatalogLink(
  item_type: "membership" | "package" | "product",
  item_id: number,
  item_name: string,
  destination_path: string
) {
  const ctx = await getAffCtx();
  if (!ctx) return { success: false, message: "Not authenticated" };

  const CUSTOMER_URL =
    process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_URL ||
    "https://customer-portal-five-gamma.vercel.app";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let attempt = 0; attempt < 3; attempt++) {
    const rand4 = Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    const slug = Date.now().toString(36) + rand4;

    // Build full_url with ?aff= already embedded so /r/[slug] redirect lands with attribution
    const sep = destination_path.includes("?") ? "&" : "?";
    const full_url = CUSTOMER_URL + destination_path + sep + "aff=" + slug;
    const destination = CUSTOMER_URL + destination_path;

    const { data, error } = await ctx.supabase
      .from("affiliate_links")
      .insert({
        affiliate_id: ctx.affiliateId,
        slug,
        full_url,
        destination,
        item_type,
        item_id,
        item_name,
        clicks: 0,
        conversions: 0,
        is_active: true,
      })
      .select()
      .maybeSingle();

    if (!error) {
      revalidatePath("/catalog");
      return { success: true, message: "Link created", link: data };
    }

    if (error.code !== "23505") {
      return { success: false, message: error.message };
    }
  }

  return { success: false, message: "Failed to generate unique link, please retry" };
}
