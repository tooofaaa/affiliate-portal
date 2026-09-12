import { getAffiliatableMemberships, getMyLinksMap } from "@/lib/actions/catalog";
import MembershipsContent from "@/components/features/catalog/MembershipsContent";

export default async function MembershipsPage() {
  const memberships = await getAffiliatableMemberships();
  const ids = memberships.map((m) => m.id as number);
  const initialLinks = await getMyLinksMap("membership", ids);
  return <MembershipsContent memberships={memberships} initialLinks={initialLinks} />;
}
