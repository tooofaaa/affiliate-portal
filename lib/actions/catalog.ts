"use server";

import { createClientServer } from "@/lib/supabase/server";

export interface CatalogProduct {
  id: number;
  product_name: string;
  product_category: string;
  product_type: string;
  sell_price: number;
  amount_stock: number;
  moq: number;
  description: string;
  product_image: string;
  supplier_id: number;
  supplier_name?: string;
}

/** Get approved products visible to customers — the single shared catalog */
export async function getApprovedCatalog(params?: {
  search?: string;
  category?: string;
  supplierId?: number;
}): Promise<{ data: CatalogProduct[]; error: string | null }> {
  const supabase = await createClientServer();

  let query = supabase
    .from("products")
    .select("id, product_name, product_category, product_type, sell_price, amount_stock, moq, description, product_image, supplier_id, suppliers(enterprise_unique_id)")
    .eq("approval_status", "Approved")
    .eq("is_active", true)
    .gt("amount_stock", 0)
    .order("created_at", { ascending: false });

  if (params?.search) {
    query = query.ilike("product_name", `%${params.search}%`);
  }
  if (params?.category) {
    query = query.eq("product_category", params.category);
  }
  if (params?.supplierId) {
    query = query.eq("supplier_id", params.supplierId);
  }

  const { data, error } = await query;

  if (error) return { data: [], error: error.message };

  const mapped = (data || []).map((p: any) => ({
    id: p.id,
    product_name: p.product_name,
    product_category: p.product_category,
    product_type: p.product_type,
    sell_price: p.sell_price,
    amount_stock: p.amount_stock,
    moq: p.moq || 1,
    description: p.description || "",
    product_image: p.product_image || "",
    supplier_id: p.supplier_id,
    supplier_name: p.suppliers?.enterprise_unique_id || "Unknown Supplier",
  }));

  return { data: mapped, error: null };
}
