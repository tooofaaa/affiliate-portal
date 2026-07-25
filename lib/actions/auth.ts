"use server";

import { createClientServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function loginCustomer(formData: FormData) {
  const supabase = await createClientServer();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "customer") {
    await supabase.auth.signOut();
    return {
      success: false,
      message: "Unauthorized access: This portal is reserved for customers."
    };
  }

  revalidatePath("/");
  return { success: true, message: "Logged in successfully" };
}

export async function loginAffiliate(formData: FormData) {
  const supabase = await createClientServer();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    await supabase.auth.signOut();
    return { success: false, message: "Authentication failed." };
  }

  // Check affiliates table
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, status")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  if (!affiliate) {
    await supabase.auth.signOut();
    return { success: false, message: "Account not linked to an affiliate record" };
  }

  if (affiliate.status === "pending") {
    await supabase.auth.signOut();
    return { success: false, message: "Your account is pending admin approval" };
  }

  if (affiliate.status === "suspended") {
    await supabase.auth.signOut();
    return { success: false, message: "Your account has been suspended" };
  }

  revalidatePath("/");
  return { success: true, message: "Logged in successfully" };
}

export async function signupCustomer(formData: FormData) {
  const supabase = await createClientServer();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const headersList = await headers();
  const forwardedHost = headersList.get("x-forwarded-host");
  const forwardedProto = headersList.get("x-forwarded-proto") || "https";
  const host = forwardedHost || headersList.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : forwardedProto;
  const redirectTo = `${protocol}://${host}/auth/callback`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        role: "customer",
        name,
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // If Supabase auto-confirms (no email verification required), it returns a session
  if (data.session) {
    revalidatePath("/");
    return { success: true, message: "Signed up successfully. Redirecting to dashboard...", session: true };
  }

  return { success: true, message: "Signed up successfully. Please check your email to confirm.", session: false };
}

export async function signupAffiliate(formData: FormData) {
  const supabase = await createClientServer();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const headersList = await headers();
  const forwardedHost = headersList.get("x-forwarded-host");
  const forwardedProto = headersList.get("x-forwarded-proto") || "https";
  const host = forwardedHost || headersList.get("host") || "localhost:3003";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : forwardedProto;
  const redirectTo = `${protocol}://${host}/auth/callback`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        role: "affiliate",
        name,
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // Insert into affiliates with status pending
  if (data.user) {
    await supabase.from("affiliates").insert({
      portal_user_id: data.user.id,
      name,
      email,
      status: "pending",
      commission_pct: 0,
    });
  }

  if (data.session) {
    revalidatePath("/");
    return { success: true, message: "Signed up successfully. Your account is pending admin approval.", session: true };
  }

  return { success: true, message: "Signed up successfully. Please check your email to confirm.", session: false };
}

export async function logoutCustomer() {
  const supabase = await createClientServer();
  await supabase.auth.signOut();
  revalidatePath("/");
  return { success: true, message: "Logged out successfully" };
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

  if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
  else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) browser = "Safari";
  else if (/opr/i.test(userAgent)) browser = "Opera";
  else if (/edg/i.test(userAgent)) browser = "Edge";

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
  const host = forwardedHost || headersList.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : forwardedProto;
  const resetUrl = `${protocol}://${host}/auth/callback?next=/reset-password`;

  // Log reset requested
  await supabase.from("security_audit_logs").insert({
    email,
    event_type: "PASSWORD_RESET_REQUESTED",
    ip_address: ipAddress,
    user_agent: userAgent,
    device,
    browser,
    platform,
    status: "SUCCESS",
  });

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl,
  });

  if (error) {
    // Log reset failed
    await supabase.from("security_audit_logs").insert({
      email,
      event_type: "PASSWORD_RESET_FAILED",
      ip_address: ipAddress,
      user_agent: userAgent,
      device,
      browser,
      platform,
      status: "FAILED",
      details: error.message,
    });
    if (error.status === 429) {
      return { success: false, message: "Rate limit exceeded. Please wait before requesting again." };
    }
  } else {
    // Log reset sent successfully
    await supabase.from("security_audit_logs").insert({
      email,
      event_type: "PASSWORD_RESET_SENT",
      ip_address: ipAddress,
      user_agent: userAgent,
      device,
      browser,
      platform,
      status: "SUCCESS",
    });
  }

  // Generic success to prevent user enumeration
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
      event_type: "PASSWORD_RESET_FAILED",
      ip_address: ipAddress,
      user_agent: userAgent,
      device,
      browser,
      platform,
      status: "FAILED",
      details: "No authenticated user session found.",
    });
    return { success: false, message: "No active session found. The reset link may have expired." };
  }

  // Validate complexity: Min length 8, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordPolicyRegex.test(password)) {
    return { success: false, message: "Password does not meet complexity requirements." };
  }

  // Update password in Supabase
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    await supabase.from("security_audit_logs").insert({
      email: user.email,
      user_id: user.id,
      event_type: "PASSWORD_RESET_FAILED",
      ip_address: ipAddress,
      user_agent: userAgent,
      device,
      browser,
      platform,
      status: "FAILED",
      details: error.message,
    });
    return { success: false, message: error.message };
  }

  // Log successful password change
  await supabase.from("security_audit_logs").insert({
    email: user.email,
    user_id: user.id,
    event_type: "PASSWORD_CHANGED",
    ip_address: ipAddress,
    user_agent: userAgent,
    device,
    browser,
    platform,
    status: "SUCCESS",
  });

  // Revoke all active sessions globally
  await supabase.auth.signOut({ scope: "global" });

  return { success: true, message: "Password updated successfully." };
}

