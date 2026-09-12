import { getAffiliatableProducts, getMyLinksMap } from "@/lib/actions/catalog";
import ProductsContent from "@/components/features/catalog/ProductsContent";

export default async function ProductsPage() {
  const products = await getAffiliatableProducts();
  const ids = products.map((p) => p.id as number);
  const initialLinks = await getMyLinksMap("product", ids);
  return <ProductsContent products={products} initialLinks={initialLinks} />;
}
