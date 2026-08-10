import { getAffiliateOnboardingData } from "@/lib/actions/onboarding";
import AppLayoutClient from "./AppLayoutClient";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let onboardingStatus = "incomplete";
  try {
    const data = await getAffiliateOnboardingData();
    onboardingStatus = data.onboarding_status;
  } catch {
    // ignore — banner is non-critical
  }

  return (
    <AppLayoutClient onboardingStatus={onboardingStatus}>
      {children}
    </AppLayoutClient>
  );
}
