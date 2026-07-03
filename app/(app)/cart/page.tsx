"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCart } from "@/lib/context/CartContext";
import { formatCurrency } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { checkoutCart } from "@/lib/actions/orders";

export default function CartPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0 || isCheckingOut) return;

    setIsCheckingOut(true);
    const res = await checkoutCart(items);
    setIsCheckingOut(false);

    if (res.success) {
      alert(res.message);
      clearCart();
      router.push("/orders");
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
            {t.nav.cart}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            {t.cart.subtitle}
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="danger" onClick={clearCart} className="w-fit cursor-pointer">
            {t.cart.clearCart}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🛒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.cart.emptyCart}</h2>
          <p className="text-gray-500 mb-6">{t.cart.emptyCartDesc}</p>
          <Link href="/suppliers">
            <Button variant="primary" className="cursor-pointer">{t.cart.browseSuppliers}</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items List */}
          <div className="flex-1 flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white transition-all hover:shadow-md"
                style={{
                  border: "1px solid rgba(99,102,241,0.1)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                }}
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.product.name}</h3>
                      <p className="text-sm text-indigo-500 font-medium mt-0.5">{item.product.supplierName}</p>
                    </div>
                    <div className="text-end">
                      <p className="font-bold text-gray-900">{formatCurrency(item.product.price, language)}</p>
                      <p className="text-xs text-gray-500">{t.cart.perUnit.replace('{unit}', item.product.unit)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 sm:mt-0">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-sm text-red-500 font-medium hover:text-red-600 transition-colors cursor-pointer"
                    >
                      {t.cart.remove}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div
              className="rounded-2xl p-6 bg-white sticky top-24"
              style={{
                border: "1px solid rgba(99,102,241,0.1)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.cart.orderSummary}</h3>
              
              <div className="flex flex-col gap-3 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>{t.cart.subtotal.replace('{count}', String(totalItems))}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totalPrice, language)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.cart.estimatedShipping}</span>
                  <span className="font-medium text-gray-900">{t.cart.calculatedAtCheckout}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.cart.taxes}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totalPrice * 0.05, language)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-gray-900 text-base">{t.cart.total}</span>
                  <span className="font-bold text-indigo-600 text-xl">{formatCurrency(totalPrice * 1.05, language)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 text-end">{t.cart.vatInclude}</p>
              </div>

              <Button 
                variant="primary" 
                className="w-full py-3 text-base shadow-indigo-500/25 cursor-pointer" 
                onClick={handleCheckout}
                isLoading={isCheckingOut}
              >
                {t.cart.proceedToCheckout}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
