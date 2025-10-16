"use client";

import Link from "next/link";
import { useCart } from "@/providers/CartProvider";

export default function CartButton() {
  const { totalItems } = useCart();
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 px-3 h-9 rounded-md bg-primary text-white border border-transparent hover:opacity-90 active:opacity-95 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
      aria-label="Ir para o carrinho"
    >
      {/* ícone */}
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="17" cy="20" r="1" />
      </svg>
      <span className="text-xs">Carrinho</span>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
