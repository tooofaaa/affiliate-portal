"use server";

import { createClientServer, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { DEMO_MODE } from "@/lib/demo";

export async function loginAffiliate(formData: FormData) {
  const supabase = await createClientServer();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (DEMO_MODE) {
      const { data: demoData, error: demoErr } = await supabase.auth.signInWithPassword({
        email: 'demo.affiliate@portal.test',
        password: 'Demo1234!',
      });
      if (!demoErr && demoData.user) {
        const { data: demoAff } = await supabase.from('affiliates')
          .select('status').eq('portal_user_id', demoData.user.id).maybeSingle();
        if (demoAff?.status === 'active') {
          return { success: true };
        }
      }
    }
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

  if (affiliate.status === "suspended" && user?.email !== 'demo.affiliate@portal.test') {
    await supabase.auth.signOut();
    return { success: false, message: "Your account has been suspended" };
  }

  revalidatePath("/");
  return { success: true, message: "Logged in successfully" };
}

export async function signupAffiliate(formData: FormData) {
  const supabase = await createClientServer();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const phone = (formData.get("phone") as string) ?? "";

  // Basic input validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "Password must be at least 8 characters." };
  }
  if (!name || name.trim().length === 0) {
    return { success: false, message: "Full name is required." };
  }

  // Use admin client to create user with email auto-confirmed (no email verification step)
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "affiliate",
      name: name.trim(),
    },
  });

  if (error) {
    return { success: false, message: "Unable to create account. Please check your details and try again." };
  }

  if (!data.user) {
    return { success: false, message: "Account creation failed. Please try again shortly." };
  }

  const { error: insertError } = await adminClient.from("affiliates").insert({
    portal_user_id: data.user.id,
    name: name.trim(),
    email,
    contact_number: phone.trim() || null,
    status: "active",
    commission_pct: 0,
  });

  if (insertError) {
    await adminClient.auth.admin.deleteUser(data.user.id);
    console.error("affiliates insert failed, rolled back auth user:", insertError.message);
    return { success: false, message: "Account creation failed. Please try again shortly." };
  }

  // Auto-login so the user lands directly on the dashboard
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return { success: true, message: "Account created. Please log in.", session: false };
  }

  return { success: true, message: "Registration successful! Setting up your profile...", onboarding: true, session: true };
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

  // Edge and Opera must be checked before Chrome — their UA strings contain "Chrome"
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
  const host = forwardedHost || headersList.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : forwardedProto;
  const resetUrl = `${protocol}://${host}/auth/callback?next=/reset-password`;

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
      return { success: false, message: "Too many reset requests. Please wait a few minutes before trying again." };
    }
    return { success: false, message: "Unable to send reset email. Please try again shortly." };
  }

  // Log only after a successful send — one event, one row
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

