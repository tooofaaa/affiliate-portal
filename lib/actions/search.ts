"use server";

import { createClientServer } from "@/lib/supabase/server";
import { Product, SearchHistory } from "@/lib/types";

interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}

export async function searchProducts(
  query: string,
  filters: SearchFilters = {}
): Promise<{ data: Product[]; error: string | null }> {
  const supabase = await createClientServer();
  
  const { data: { user } } = await supabase.auth.getUser();

  // Log to search history if authenticated and query is not empty
  if (user && query.trim()) {
    await supabase.from("customer_search_history").insert({
      portal_user_id: user.id,
      query_text: query.trim(),
      filters_applied: filters,
    });
  }

  let dbQuery = supabase
    .from("products")
    .select("*, suppliers(supplier_name)")
    .eq("is_active", true)
    .eq("approval_status", "Approved");

  if (query.trim()) {
    dbQuery = dbQuery.or(`product_name.ilike.%${query}%,description.ilike.%${query}%`);
  }

  if (filters.category && filters.category !== "All") {
    dbQuery = dbQuery.eq("product_category", filters.category);
  }

  if (filters.minPrice !== undefined) {
    dbQuery = dbQuery.gte("sell_price", filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    dbQuery = dbQuery.lte("sell_price", filters.maxPrice);
  }

  if (filters.inStockOnly) {
    dbQuery = dbQuery.gt("amount_stock", 0);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error("searchProducts error:", error);
    return { data: [], error: error.message };
  }

  const products: Product[] = (data || []).map((p: any) => ({
    id: p.id,
    supplierId: p.supplier_id,
    supplierName: p.suppliers?.supplier_name || "Unknown",
    name: p.product_name,
    description: p.description || "",
    price: p.sell_price,
    unit: p.product_type || "Unit",
    imageUrl: p.product_image || null,
    category: p.product_category,
    inStock: p.amount_stock > 0,
    minOrderQty: p.moq || 1,
    sku: p.sku,
  }));

  return { data: products, error: null };
}

export async function getSearchHistory(): Promise<{ data: SearchHistory[]; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("customer_search_history")
    .select("*")
    .eq("portal_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

export async function clearSearchHistory(): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("customer_search_history")
    .delete()
    .eq("portal_user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
