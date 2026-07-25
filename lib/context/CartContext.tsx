"use client";

import React, { createContext, useContext } from "react";

interface CartContextType {
  totalItems: number;
}

const CartContext = createContext<CartContextType>({ totalItems: 0 });

export function CartProvider({ children }: { children: React.ReactNode }) {
  return (
    <CartContext.Provider value={{ totalItems: 0 }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
