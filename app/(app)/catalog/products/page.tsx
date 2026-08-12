import { getAffiliatableProducts } from "@/lib/actions/catalog";
import ProductsContent from "@/components/features/catalog/ProductsContent";

export default async function ProductsPage() {
  const products = await getAffiliatableProducts();
  return <ProductsContent products={products} />;
}
