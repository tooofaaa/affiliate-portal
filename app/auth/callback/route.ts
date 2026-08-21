import { NextResponse } from "next/server";
import { createClientServer, createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/login";

  // Only allow relative paths to prevent open redirect
  const safePath = next.startsWith("/") && !next.startsWith("//") ? next : "/login";

  if (code) {
    const supabase = await createClientServer();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth", requestUrl));
    }

    // After email confirmation: promote account_status from pending_email → beta
    if (user && user.email_confirmed_at && safePath !== "/reset-password") {
      const adminClient = createAdminClient();
      await adminClient
        .from("affiliates")
        .update({ account_status: "beta" })
        .eq("portal_user_id", user.id)
        .eq("account_status", "pending_email");

      // Redirect to onboarding if not yet approved
      const { data: affiliate } = await adminClient
        .from("affiliates")
        .select("onboarding_status")
        .eq("portal_user_id", user.id)
        .single();

      if (affiliate && affiliate.onboarding_status !== "approved") {
        return NextResponse.redirect(new URL("/onboarding", requestUrl));
      }
    }
  }

  return NextResponse.redirect(new URL(safePath, requestUrl));
}
