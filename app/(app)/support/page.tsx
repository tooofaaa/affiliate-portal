import SupportContent from "@/components/features/support/SupportContent";
import { getMyTickets, getAffiliateIdForCurrentUser } from "@/lib/actions/affiliate";

export default async function SupportPage() {
  const [{ data: tickets }, affiliateId] = await Promise.all([
    getMyTickets(),
    getAffiliateIdForCurrentUser(),
  ]);

  return <SupportContent tickets={tickets} affiliateId={affiliateId} />;
}
