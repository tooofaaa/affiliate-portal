import { NextResponse } from "next/server";
import { createClientServer, createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  // Only allow relative paths to prevent open redirect
  const safePath = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

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
    }
  }

  return NextResponse.redirect(new URL(safePath, requestUrl));
}
