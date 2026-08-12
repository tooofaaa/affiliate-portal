import { getAffiliatablePackages } from "@/lib/actions/catalog";
import PackagesContent from "@/components/features/catalog/PackagesContent";

export default async function PackagesPage() {
  const packages = await getAffiliatablePackages();
  return <PackagesContent packages={packages} />;
}
