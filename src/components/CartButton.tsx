"use client";

import Link from "next/link";

import { useCart } from "@/providers/CartProvider";

export default function CartButton() {
  const { totalItems } = useCart();
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 px-3 h-9 rounded-md bg-primary text-white border border-transparent hover:opacity-90 active:opacity-95 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
      aria-label="Abrir carrinho"
      suppressHydrationWarning
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M6 6h15l-1.5 8.5a2 2 0 01-2 1.7H9.5a2 2 0 01-2-1.6L6 4.5" />
        <circle cx="10" cy="20" r="1.5" />
        <circle cx="17" cy="20" r="1.5" />
      </svg>
      <span className="text-sm font-medium">Carrinho</span>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5">{totalItems}</span>
      )}
    </Link>
  );
}