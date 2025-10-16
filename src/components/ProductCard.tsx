'use client';
import React from "react";
import type { Produto } from "@/lib/types";
import Image from "next/image";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { useCart } from "@/providers/CartProvider";
import { getUnitPricePer100g, isWeightProduct } from "@/lib/weightUtil";

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function ProductCard({ p }: { p: Produto }) {
  const cleanImageUrl = typeof p.imagemUrl === "string" && p.imagemUrl.trim().length > 0 ? p.imagemUrl : null;
  const imageSrc = cleanImageUrl ?? (p.codigoBarras ? cloudinaryUrl(p.codigoBarras, { withExt: true, transformations: ["f_auto", "q_auto:good", "c_limit", "w_400"] }) : undefined);
  const hasImage = Boolean(imageSrc);
  const isPromo = !!p.promocaoAtiva && !!p.precoPromocional;
  const basePrice = Number(p.preco || 0);
  const finalPrice = isPromo ? (p.precoPromocional as number) : basePrice;
  const finalPricePer100g = getUnitPricePer100g(p, finalPrice);
  const originalPricePer100g = getUnitPricePer100g(p, basePrice);
  const priceClass = isPromo ? "text-red-700" : "text-primary";
  const discountPct = isPromo && basePrice > 0
    ? Math.max(0, Math.round(((basePrice - finalPrice) / basePrice) * 100))
    : null;
  // Produto de peso: considera unit_type === 'weight' ou campo pesavel preenchido
  const isWeight = isWeightProduct(p);
  const { add } = useCart();
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="rounded-lg border bg-white hover:shadow-md transition-all duration-300 btn-hover relative flex flex-col h-full">
      {isPromo && (
        <div className="absolute top-2 left-2 z-20 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
          {discountPct ? `-${discountPct}%` : 'OFERTA'}
        </div>
      )}

      {/* Imagem / Placeholder */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-[rgba(0,0,0,0.03)] p-2">
        {hasImage ? (
          imgError ? (
            <div className="flex flex-col items-center justify-center text-tertiary select-none h-full">
              <div className="h-12 w-12 rounded-md bg-quaternary/60 flex items-center justify-center mb-1">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 8l1.5 12h9L18 8H6z" />
                  <path d="M9 8a3 3 0 116 0" />
                </svg>
              </div>
              <span className="text-xs">Sem imagem</span>
            </div>
          ) : (
            <Image src={imageSrc} alt={p.nome} className="w-full h-full object-contain rounded-md" width={400} height={400} unoptimized onError={() => setImgError(true)} />
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-tertiary select-none h-full">
            <div className="h-12 w-12 rounded-md bg-quaternary/60 flex items-center justify-center mb-1">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 8l1.5 12h9L18 8H6z" />
                <path d="M9 8a3 3 0 116 0" />
              </svg>
            </div>
            <span className="text-xs">Sem imagem</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-3 sm:p-2 flex-1 flex flex-col">
        <div className="font-medium text-xs sm:text-xs leading-tight line-clamp-2 min-h-[2rem] sm:min_h-[1.5rem]">
          {p.nome}
        </div>

        {p.codigoBarras && (
          <div className="text-[10px] sm:text-[10px] text-tertiary mt-1.5 sm:mt-1 truncate">EAN: {p.codigoBarras}</div>
        )}

        {p.categoria && (
          <div className="text-[10px] sm:text-[10px] text-tertiary mt-1.5 sm:mt-1 truncate">{p.categoria}</div>
        )}

        {/* Preços */}
        <div className="mt-2 sm:mt-1.5">
          <div className="flex items-center justify-center gap-2">
            {isPromo && (
              <span className="flex items-center gap-1 text-[11px] sm:text-[10px] text-tertiary line-through">
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 10l-7-7H5a2 2 0 00-2 2v7l7 7 9-9z" />
                  <circle cx="7.5" cy="7.5" r="1.5" />
                </svg>
                {formatBRL(isWeight ? originalPricePer100g : basePrice)}{isWeight ? ' /100g' : ''}
                </span>
              )}
            <span className={`flex items-center gap-1 text-sm sm:text-xs font-semibold ${priceClass}`}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 10l-7-7H5a2 2 0 00-2 2v7l7 7 9-9z" />
                <circle cx="7.5" cy="7.5" r="1.5" />
              </svg>
              {formatBRL(isWeight ? finalPricePer100g : finalPrice)}{isWeight ? ' /100g' : ''}
              </span>
            </div>
          </div>

        {/* Rodapé com botão Adicionar */}
        <div className="mt-3 sm:mt-2">
          <button onClick={() => add && add(p)} className="w-full h-9 sm:h-8 rounded-md bg-primary text-white text-xs sm:text-[13px] font-medium hover:opacity-90 active:opacity-95 transition flex items-center justify-center gap-1">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16M4 12h16" />
            </svg>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
// Nota: removido o texto auxiliar "preço por 100g" do card.