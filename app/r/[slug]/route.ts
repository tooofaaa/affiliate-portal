import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * GET /r/[slug]
 *
 * Affiliate referral redirect handler:
 * 1. Look up the affiliate_links row by slug.
 * 2. Log a click event to affiliate_link_events (fire-and-forget).
 * 3. Increment the clicks counter (fire-and-forget).
 * 4. Redirect to the link's destination URL with ?aff={slug} appended.
 *
 * Uses the admin client so click counts update without requiring an
 * authenticated session — anonymous visitors follow referral links.
 *
 * Falls back to the customer portal homepage when the slug is unknown
 * or the link has been deactivated.
 */
export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const customerPortalUrl =
    process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_URL ||
    "https://customer-portal-five-gamma.vercel.app";

  if (!slug) {
    return NextResponse.redirect(new URL(customerPortalUrl));
  }

  const adminClient = createAdminClient();

  const { data: link, error } = await adminClient
    .from("affiliate_links")
    .select("id, destination, full_url, is_active, clicks")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !link || !link.is_active) {
    // Unknown slug or deactivated link — send visitor to the customer portal.
    return NextResponse.redirect(new URL(customerPortalUrl));
  }

  // Fire-and-forget: log click event
  adminClient
    .from("affiliate_link_events")
    .insert({
      link_id: link.id,
      event_type: "click",
      ip_address:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      user_agent: request.headers.get("user-agent") ?? null,
    })
    .then(() => {/* fire-and-forget */});

  // Increment click counter — race conditions here are acceptable for analytics.
  adminClient
    .from("affiliate_links")
    .update({ clicks: (link.clicks ?? 0) + 1 })
    .eq("id", link.id)
    .then(() => {/* fire-and-forget */});

  // Build redirect target — always append ?aff={slug} for attribution
  let target =
    (link.destination?.startsWith("http") ? link.destination : link.full_url) ??
    customerPortalUrl;

  try {
    const url = new URL(target);
    url.searchParams.set("aff", slug);
    target = url.toString();
  } catch {
    target = customerPortalUrl;
  }

  return NextResponse.redirect(new URL(target));
}
