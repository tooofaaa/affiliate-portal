import { getAffiliateOnboardingData } from "@/lib/actions/onboarding";
import AppLayoutClient from "./AppLayoutClient";

type OnboardingStatus = "incomplete" | "submitted" | "approved" | "declined" | null;

function coerceOnboardingStatus(value: unknown): OnboardingStatus {
  return value === "incomplete" || value === "submitted" || value === "approved" || value === "declined"
    ? value
    : null;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let onboardingStatus: OnboardingStatus = null;
  try {
    const data = await getAffiliateOnboardingData();
    onboardingStatus = coerceOnboardingStatus(data.onboarding_status);
  } catch {
    // ignore — banner is non-critical
  }

  return (
    <AppLayoutClient onboardingStatus={onboardingStatus}>
      {children}
    </AppLayoutClient>
  );
}