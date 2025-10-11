"use client";

import React from "react";
import type { Produto } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function SimpleProductGrid({ items, className = "" }: { items: Produto[]; className?: string; }) {
  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9h.01M15 9h.01M9 15h.01M15 15h.01" />
            </svg>
          </div>
          <p className="text-sm">Nenhum produto encontrado</p>
          <p className="text-xs text-gray-400 mt-1">Tente ajustar os filtros de busca</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 md:gap-3 ${className}`}>
      {items.map((item) => (
        <div key={item.id}>
          <ProductCard p={item} />
        </div>
      ))}
    </div>
  );
}