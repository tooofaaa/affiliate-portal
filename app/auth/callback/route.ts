import { NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  // Only allow relative paths to prevent open redirect
  const safePath = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (code) {
    const supabase = await createClientServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth", requestUrl));
    }
  }

  return NextResponse.redirect(new URL(safePath, requestUrl));
}
