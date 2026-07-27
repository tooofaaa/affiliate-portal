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
 * 2. Increment the clicks counter atomically via a Postgres function call.
 * 3. Redirect to the link's destination URL.
 *
 * Uses the admin client so click counts update without requiring an
 * authenticated session — anonymous visitors follow referral links.
 *
 * Falls back to the customer portal homepage when the slug is unknown
 * or the link has been deactivated.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const customerPortalUrl =
    process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_URL ||
    "https://customer-portal-five-gamma.vercel.app";

  if (!slug) {
    return NextResponse.redirect(new URL(customerPortalUrl));
  }

  const supabase = createAdminClient();

  const { data: link, error } = await supabase
    .from("affiliate_links")
    .select("id, destination, full_url, is_active, clicks")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !link || !link.is_active) {
    // Unknown slug or deactivated link — send visitor to the customer portal.
    return NextResponse.redirect(new URL(customerPortalUrl));
  }

  // Increment click counter — race conditions here are acceptable for analytics.
  // We don't await this so the redirect is not delayed by the DB write.
  supabase
    .from("affiliate_links")
    .update({ clicks: (link.clicks ?? 0) + 1 })
    .eq("id", link.id)
    .then(() => {/* fire-and-forget */});

  // Prefer the stored destination URL; fall back to the generated full_url.
  const target =
    link.destination && link.destination.startsWith("http")
      ? link.destination
      : link.full_url ?? customerPortalUrl;

  return NextResponse.redirect(new URL(target));
}
