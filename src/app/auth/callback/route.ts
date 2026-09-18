import { NextResponse, type NextRequest } from "next/server";
import { createClientServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const token_hash = requestUrl.searchParams.get("token_hash");

  // Handle password recovery 
  if (type === "recovery" && code) {
    const supabase = await createClientServer();
    
    try {
      // For password recovery, Supabase sends a code parameter
      // that we can exchange for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Password recovery exchange error:", error);
        return NextResponse.redirect(
          new URL("/forgot-password?error=invalid_link", requestUrl.origin)
        );
      }

      if (data.session) {
        return NextResponse.redirect(
          new URL("/update-password", requestUrl.origin)
        );
      }
    } catch (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        new URL("/forgot-password?error=server_error", requestUrl.origin)
      );
    }
  }

  // Handle email confirmation (after signup)
  if (code && type === "signup") {
    const supabase = await createClientServer();
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
      }
    } catch (error) {
      console.error("Email confirmation error:", error);
    }
  }

  // Default: redirect to login
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}