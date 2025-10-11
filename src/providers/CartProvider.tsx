'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Produto } from '@/lib/types';
import { computeLineTotal } from "@/lib/weightUtil";

export type CartItem = {
  product: Produto;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  add: (p: Produto, qty?: number) => void;
  remove: (id: Produto['id']) => void;
  clear: () => void;
  inc: (id: Produto['id']) => void;
  dec: (id: Produto['id']) => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'catalogo_web_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // carregar do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
  }, []);

  // persistir no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = (p: Produto, qty: number = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => String(it.product.id) === String(p.id));
      if (idx >= 0) {
        const clone = [...prev];
        clone[idx] = { ...clone[idx], qty: clone[idx].qty + qty };
        return clone;
      }
      return [...prev, { product: p, qty }];
    });
  };

  const remove = (id: Produto['id']) => {
    setItems((prev) => prev.filter((it) => String(it.product.id) !== String(id)));
  };

  const clear = () => setItems([]);

  const inc = (id: Produto['id']) => {
    setItems((prev) => prev.map((it) => (String(it.product.id) === String(id) ? { ...it, qty: it.qty + 1 } : it)));
  };

  const dec = (id: Produto['id']) => {
    setItems((prev) => prev.flatMap((it) => {
      if (String(it.product.id) !== String(id)) return [it];
      const nextQty = it.qty - 1;
      if (nextQty <= 0) return [];
      return [{ ...it, qty: nextQty }];
    }));
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const isPromo = !!it.product.promocaoAtiva && !!it.product.precoPromocional;
      const basePrice = isPromo ? (it.product.precoPromocional as number) : Number(it.product.preco || 0);
      const lineTotal = computeLineTotal(it.product, basePrice, it.qty);
      return sum + lineTotal;
    }, 0);
  }, [items]);

  const totalItems = useMemo(() => items.reduce((s, it) => s + it.qty, 0), [items]);

  const value: CartContextValue = {
    items,
    add,
    remove,
    clear,
    inc,
    dec,
    totalItems,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}