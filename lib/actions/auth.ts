"use server";

import { createClientServer, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function loginAffiliate(formData: FormData) {
  const supabase = await createClientServer();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { success: false, message: "Please verify your email address before logging in. Check your inbox." };
    }
    return { success: false, message: "Invalid email or password." };
  }

  const user = authData.user;
  if (!user) {
    await supabase.auth.signOut();
    return { success: false, message: "Authentication failed." };
  }

  // Reject logins from other portals
  if (user.user_metadata?.role && user.user_metadata.role !== "affiliate") {
    await supabase.auth.signOut();
    return { success: false, message: "Unauthorized: This portal is reserved for affiliates." };
  }

  // Enforce email confirmation
  if (!user.email_confirmed_at) {
    await supabase.auth.signOut();
    return { success: false, message: "Please verify your email address before logging in. Check your inbox." };
  }

  const adminClient = createAdminClient();
  const { data: affiliate, error: affiliateError } = await adminClient
    .from("affiliates")
    .select("id, status, account_status")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (affiliateError) {
    await supabase.auth.signOut();
    return { success: false, message: "Database error. Please try again." };
  }

  if (!affiliate) {
    await supabase.auth.signOut();
    return { success: false, message: "Account not found. Please contact support." };
  }

  if (affiliate.status === "suspended") {
    await supabase.auth.signOut();
    return { success: false, message: "Your account has been suspended. Please contact support." };
  }

  // Promote from pending_email → beta now that email is confirmed
  if (affiliate.account_status === "pending_email") {
    await adminClient
      .from("affiliates")
      .update({ account_status: "beta" })
      .eq("id", affiliate.id);
  }

  revalidatePath("/");
  return { success: true, message: "Logged in successfully" };
}

export async function signupAffiliate(formData: FormData) {
  const supabase = await createClientServer();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const acceptedTerms = formData.get("accept_terms") === "true";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "Password must be at least 8 characters." };
  }
  if (!name || name.trim().length === 0) {
    return { success: false, message: "Full name is required." };
  }
  if (!acceptedTerms) {
    return { success: false, message: "You must accept the Terms & Conditions to register." };
  }

  // Check if email already registered
  const adminClient = createAdminClient();
  const { data: existing } = await adminClient
    .from("affiliates")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return { success: false, message: "An account with this email already exists. Please log in." };
  }

  // Create auth user — Supabase sends confirmation email
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: "affiliate", name: name.trim() },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data.user) {
    return { success: false, message: "Account creation failed. Please try again." };
  }

  // Insert affiliate record with pending_email status
  const { error: insertError } = await adminClient.from("affiliates").insert({
    portal_user_id: data.user.id,
    name: name.trim(),
    email,
    status: "pending",
    account_status: "pending_email",
    onboarding_status: "incomplete",
    commission_pct: 0,
  });

  if (insertError) {
    await adminClient.auth.admin.deleteUser(data.user.id);
    return { success: false, message: "Account creation failed. Please try again." };
  }

  return { success: true, verify_email: true };
}

export async function logoutAffiliate() {
  const supabase = await createClientServer();
  await supabase.auth.signOut();
  revalidatePath("/");
  return { success: true, message: "Logged out successfully" };
}

function parseUserAgent(userAgent: string) {
  let browser = "Unknown Browser";
  let platform = "Unknown Platform";
  let device = "Desktop";

  if (/edg\//i.test(userAgent)) browser = "Edge";
  else if (/opr\//i.test(userAgent)) browser = "Opera";
  else if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
  else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent)) browser = "Safari";

  if (/windows/i.test(userAgent)) platform = "Windows";
  else if (/macintosh|mac os x/i.test(userAgent)) platform = "macOS";
  else if (/linux/i.test(userAgent)) platform = "Linux";
  else if (/android/i.test(userAgent)) {
    platform = "Android";
    device = "Mobile";
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    platform = "iOS";
    device = "Mobile";
  }

  return { browser, platform, device };
}

export async function requestPasswordReset(email: string) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  const supabase = await createClientServer();
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "unknown";
  const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  const { browser, platform, device } = parseUserAgent(userAgent);

  const forwardedHost = headersList.get("x-forwarded-host");
  const forwardedProto = headersList.get("x-forwarded-proto") || "https";
  const host = forwardedHost || headersList.get("host") || "localhost:3003";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : forwardedProto;
  const resetUrl = `${protocol}://${host}/auth/callback?next=/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl,
  });

  if (error) {
    await supabase.from("security_audit_logs").insert({
      email, event_type: "PASSWORD_RESET_FAILED",
      ip_address: ipAddress, user_agent: userAgent,
      device, browser, platform, status: "FAILED", details: error.message,
    }).then(() => {});
    if (error.status === 429) {
      return { success: false, message: "Too many reset requests. Please wait a few minutes before trying again." };
    }
    return { success: false, message: "Unable to send reset email. Please try again shortly." };
  }

  await supabase.from("security_audit_logs").insert({
    email, event_type: "PASSWORD_RESET_REQUESTED",
    ip_address: ipAddress, user_agent: userAgent,
    device, browser, platform, status: "SUCCESS",
  }).then(() => {});

  return {
    success: true,
    message: "If an account exists for this email address, a password reset link has been sent.",
  };
}

export async function updatePasswordAction(password: string) {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "unknown";
  const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const { browser, platform, device } = parseUserAgent(userAgent);

  if (!user) {
    await supabase.from("security_audit_logs").insert({
      event_type: "PASSWORD_RESET_FAILED", ip_address: ipAddress,
      user_agent: userAgent, device, browser, platform,
      status: "FAILED", details: "No authenticated user session found.",
    }).then(() => {});
    return { success: false, message: "No active session found. The reset link may have expired." };
  }

  const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordPolicyRegex.test(password)) {
    return { success: false, message: "Password does not meet complexity requirements." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    await supabase.from("security_audit_logs").insert({
      email: user.email, user_id: user.id,
      event_type: "PASSWORD_RESET_FAILED", ip_address: ipAddress,
      user_agent: userAgent, device, browser, platform,
      status: "FAILED", details: error.message,
    }).then(() => {});
    return { success: false, message: error.message };
  }

  await supabase.from("security_audit_logs").insert({
    email: user.email, user_id: user.id,
    event_type: "PASSWORD_CHANGED", ip_address: ipAddress,
    user_agent: userAgent, device, browser, platform, status: "SUCCESS",
  }).then(() => {});

  await supabase.auth.signOut({ scope: "global" });

  return { success: true, message: "Password updated successfully." };
}
