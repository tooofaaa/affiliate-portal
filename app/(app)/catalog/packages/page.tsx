import { getAffiliatablePackages, getMyLinksMap } from "@/lib/actions/catalog";
import PackagesContent from "@/components/features/catalog/PackagesContent";

export default async function PackagesPage() {
  const packages = await getAffiliatablePackages();
  const ids = packages.map((p) => p.id as number);
  const initialLinks = await getMyLinksMap("package", ids);
  return <PackagesContent packages={packages} initialLinks={initialLinks} />;
}
