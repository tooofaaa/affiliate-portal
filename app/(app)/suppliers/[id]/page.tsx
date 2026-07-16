"use client";

import { useCart } from "@/lib/context/CartContext";
import { formatCurrency } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Supplier, Product } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface DBProduct {
  id: number;
  supplier_id: number;
  product_name: string;
  product_name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  sell_price: number | null;
  unit_of_measure: string | null;
  product_image: string | null;
  product_category: string | null;
  amount_stock: number;
  min_order_qty: number | null;
}

export default function SupplierDetailsPage() {
  const { id } = useParams() as { id: string };
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const isAr = language === "ar";
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Search and filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadData() {
      setIsLoading(true);
      const [supplierRes, productsRes] = await Promise.all([
        supabase.from('suppliers').select('id, enterprise_unique_id, supplier_name, logo_url, categories').eq('id', id).single(),
        supabase.from('products').select('*').eq('supplier_id', id).eq('approval_status', 'Approved')
      ]);

      if (supplierRes.data) {
        setSupplier({
          id: supplierRes.data.id,
          name: supplierRes.data.enterprise_unique_id || `Provider #${supplierRes.data.id}`,
          description: t.supplierDetail.trustedSupplier,
          logoUrl: "",
          categories: supplierRes.data.categories || ["General"],
          rating: 5.0,
          deliveryTime: "",
          location: ""
        } as Supplier);
      }

      if (productsRes.data) {
        const mappedProducts = (productsRes.data as DBProduct[]).map((p) => {
          const pName = (isAr && p.product_name_ar) ? p.product_name_ar : p.product_name;
          const pDesc = (isAr && p.description_ar) ? p.description_ar : (p.description || t.supplierDetail.highQuality);
          const sName = supplierRes.data?.enterprise_unique_id ? String(supplierRes.data.enterprise_unique_id) : `Provider #${p.supplier_id}`;
          return {
            id: p.id,
            supplierId: p.supplier_id,
            supplierName: sName,
            name: pName,
            description: pDesc,
            price: p.sell_price || 0,
            unit: p.unit_of_measure || "pcs",
            imageUrl: p.product_image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
            category: p.product_category || "General",
            inStock: p.amount_stock > 0,
            minOrderQty: p.min_order_qty || 1
          };
        }) as Product[];
        setProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
      }
      
      setIsLoading(false);
    }
    
    loadData();

    // Live sync for supplier details and products
    const channel = supabase
      .channel(`supplier-details-${id}-realtime`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "suppliers", filter: `id=eq.${id}` },
        () => {
          loadData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products", filter: `supplier_id=eq.${id}` },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, isAr, t]);

  // Apply frontend search filters dynamically
  useEffect(() => {
    let result = products;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (inStockOnly) {
      result = result.filter(p => p.inStock);
    }

    if (maxPrice !== "") {
      result = result.filter(p => p.price <= maxPrice);
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, inStockOnly, maxPrice, products]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-500">{t.supplierDetail.loading}</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.supplierDetail.notFound}</h2>
        <p className="text-gray-500 mb-6">{t.supplierDetail.notFoundDesc}</p>
        <Link href="/suppliers">
          <Button variant="primary" className="cursor-pointer">{t.supplierDetail.backButton}</Button>
        </Link>
      </div>
    );
  }

  const handleAdd = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const qty = quantities[productId] || product.minOrderQty;
      addToCart(product, qty);
      setQuantities(prev => ({ ...prev, [productId]: product.minOrderQty }));
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Back link */}
      <Link href="/suppliers" className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 inline-flex items-center gap-1 w-fit cursor-pointer">
        {t.supplierDetail.back}
      </Link>

      {/* Supplier Header */}
      <div
        className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center"
        style={{
          background: "linear-gradient(135deg, #0f1117 0%, #131720 100%)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div className="w-24 h-24 rounded-2xl bg-indigo-50/10 flex-shrink-0 flex items-center justify-center border border-indigo-500/20">
          <svg className="w-10 h-10 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
          </svg>
        </div>
        <div className="flex-1 text-white">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{supplier.name}</h1>
            <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-md border border-indigo-500/20">
              Verified Provider
            </span>
          </div>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-3xl font-light">
            {supplier.description}
          </p>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border cursor-pointer ${
            selectedCategory === "All"
              ? "bg-indigo-50 text-indigo-600 border-indigo-200"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          {t.supplierDetail.allProducts}
        </button>
        {supplier.categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border cursor-pointer ${
              selectedCategory === cat
                ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Filters Controls */}
      <div
        className="rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(99,102,241,0.1)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
        }}
      >
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder={t.supplierDetail.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <input
              type="checkbox"
              id="instock"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label htmlFor="instock" className="text-xs font-semibold text-gray-600 cursor-pointer">{t.supplierDetail.inStockOnly}</label>
          </div>
          
          <div className="w-38">
            <input
              type="number"
              placeholder={t.supplierDetail.maxPrice}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : "")}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-white"
            style={{
              border: "1px solid rgba(99,102,241,0.1)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              {!product.inStock && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold text-sm border border-red-200">
                     {t.supplierDetail.outOfStock}
                  </span>
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{product.category}</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price, language)}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                {product.description}
              </p>
              
              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-gray-500">{t.supplierDetail.qty}</label>
                  <input
                    type="number"
                    min={product.minOrderQty}
                    value={quantities[product.id] || product.minOrderQty}
                    onChange={(e) => setQuantities(prev => ({ ...prev, [product.id]: parseInt(e.target.value) || product.minOrderQty }))}
                    disabled={!product.inStock}
                    className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <Button 
                  variant="primary" 
                  className="flex-1 shadow-indigo-500/25 cursor-pointer"
                  disabled={!product.inStock}
                  onClick={() => handleAdd(product.id)}
                >
                  {t.supplierDetail.addToCart}
                </Button>
              </div>
              <p className="text-[10px] text-center mt-2 text-gray-400 font-medium">
                {t.supplierDetail.minOrder.replace('{qty}', String(product.minOrderQty)).replace('{unit}', product.unit)}
              </p>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
            {t.supplierDetail.noProducts}
          </div>
        )}
      </div>
    </div>
  );
}
