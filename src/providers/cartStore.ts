'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Produto } from '@/lib/types';

export type CartItem = {
  product: Produto;
  qty: number;
};

interface CartStore {
  items: CartItem[];
  add: (p: Produto, qty?: number) => void;
  remove: (id: Produto['id']) => void;
  clear: () => void;
  inc: (id: Produto['id']) => void;
  dec: (id: Produto['id']) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p, qty = 1) => {
        const prev = get().items;
        const idx = prev.findIndex((it) => String(it.product.id) === String(p.id));
        if (idx >= 0) {
          const clone = [...prev];
          clone[idx] = { ...clone[idx], qty: clone[idx].qty + qty };
          set({ items: clone });
        } else {
          set({ items: [...prev, { product: p, qty }] });
        }
      },
      remove: (id) => set({ items: get().items.filter((it) => String(it.product.id) !== String(id)) }),
      clear: () => set({ items: [] }),
      inc: (id) => {
        const next = get().items.map((it) => (String(it.product.id) === String(id) ? { ...it, qty: it.qty + 1 } : it));
        set({ items: next });
      },
      dec: (id) => {
        const next = get().items.flatMap((it) => {
          if (String(it.product.id) !== String(id)) return [it];
          const q = it.qty - 1;
          if (q <= 0) return [];
          return [{ ...it, qty: q }];
        });
        set({ items: next });
      },
    }),
    {
      name: 'cart-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);