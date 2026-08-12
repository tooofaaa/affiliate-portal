import { getAffiliatableMemberships } from "@/lib/actions/catalog";
import MembershipsContent from "@/components/features/catalog/MembershipsContent";

export default async function MembershipsPage() {
  const memberships = await getAffiliatableMemberships();
  return <MembershipsContent memberships={memberships} />;
}
