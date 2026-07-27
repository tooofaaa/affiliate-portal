import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Guard against missing environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Middleware Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined.");
    return NextResponse.next({ request });
  }

  // Initialise supabaseResponse once; setAll must mutate it in-place rather than
  // reassigning the variable, otherwise cookies set on an earlier call are lost.
  const supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookieOptions: { name: "sb-affiliate-auth" },
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // Write to the incoming request so subsequent reads in the same cycle
            // see the refreshed cookies, then write to the response so they are
            // sent to the browser.  We do NOT reassign supabaseResponse here —
            // that would discard cookies written by earlier setAll calls.
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    const isAuthRoute =
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/confirm") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/auth/callback");

    // Redirect unauthenticated users to login (auth errors are treated as no session)
    if ((authError || !user) && !isAuthRoute && pathname !== "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user && !isAuthRoute) {
      // Check affiliate status on every authenticated, non-auth request.
      // A pending or suspended affiliate must be redirected to login even if
      // their session cookie is still valid (e.g. suspended after login).
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("status")
        .eq("portal_user_id", user.id)
        .maybeSingle();

      if (affiliate && affiliate.status !== "active") {
        // Sign out and redirect so the session cookie is cleared
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set(
          "error",
          affiliate.status === "pending" ? "pending" : "suspended"
        );
        return NextResponse.redirect(url);
      }
    }

    // Redirect authenticated, active users away from auth routes to dashboard
    if (user && (isAuthRoute || pathname === "/")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware invocation failed:", error);
    // On unexpected errors, redirect unauthenticated paths to login rather than
    // letting an error bypass the auth gate.
    const pathname = request.nextUrl.pathname;
    const isAuthRoute =
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/confirm") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/auth/callback");
    if (!isAuthRoute && pathname !== "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
