'use client';

import React from 'react';
import type { Produto } from '@/lib/types';
import { computeLineTotal } from '@/lib/weightUtil';
import { useCartStore } from './cartStore';

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

// Mantemos o CartProvider para compatibilidade com a árvore de componentes.
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Hook compatível com a API anterior, agora baseado em Zustand.
export function useCart(): CartContextValue {
  const items = useCartStore((s) => s.items);
  const add = useCartStore((s) => s.add);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const inc = useCartStore((s) => s.inc);
  const dec = useCartStore((s) => s.dec);

  const subtotal = React.useMemo(() => {
    return items.reduce((sum, it) => {
      const isPromo = !!it.product.promocaoAtiva && !!it.product.precoPromocional;
      const basePrice = isPromo ? (it.product.precoPromocional as number) : Number(it.product.preco || 0);
      const lineTotal = computeLineTotal(it.product, basePrice, it.qty);
      return sum + lineTotal;
    }, 0);
  }, [items]);

  const totalItems = React.useMemo(() => items.reduce((s, it) => s + it.qty, 0), [items]);

  return {
    items,
    add,
    remove,
    clear,
    inc,
    dec,
    totalItems,
    subtotal,
  };
}