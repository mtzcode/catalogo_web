'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/providers/CartProvider';
import { getUnitPricePer100g, computeLineTotal, formatQtyGrams, isWeightProduct } from "@/lib/weightUtil";
import { cloudinaryUrl } from "@/lib/cloudinary";

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}



// remove buildItemsSummary function (summary is now on /checkout)

export default function CartPage() {
  const { items, inc, dec, remove, clear, subtotal } = useCart();
  const [errorIds, setErrorIds] = React.useState<Set<string>>(new Set());

  // Modais e formulários
  // removed modal states and forms (handled in /checkout)
  // const [pickupOpen, setPickupOpen] = useState(false);
  // const [deliveryOpen, setDeliveryOpen] = useState(false);
  // const [pickupForm, setPickupForm] = useState({ nome: '', telefone: '', pagamento: 'Pix' as 'Dinheiro' | 'Cartao' | 'Pix' });
  // const [deliveryForm, setDeliveryForm] = useState({ nome: '', telefone: '', cep: '', endereco: '', numero: '', bairro: '', complemento: '', cidade: '', uf: '' });

  

  if (!items || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-3">Seu carrinho</h1>
        <div className="rounded-xl border bg-white p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-center text-tertiary mb-4">Seu carrinho está vazio</div>
          <Link href="/" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-secondary text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">
            Ver produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-3">Seu carrinho</h1>
      <div className="rounded-xl border bg-white p-4">
        <div className="divide-y">
          {items.map(({ product, qty }) => {
            const isPromo = !!product.promocaoAtiva && !!product.precoPromocional;
            const basePrice = isPromo ? (product.precoPromocional as number) : Number(product.preco || 0);
            const unitPrice = getUnitPricePer100g(product, basePrice);
            const lineTotal = computeLineTotal(product, basePrice, qty);
            // Produto de peso: considera unit_type === 'weight' ou campo pesavel preenchido
            const isWeight = isWeightProduct(product);
            return (
              <div key={product.id} className="py-3 flex items-center gap-3">
                <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.imagemUrl || product.codigoBarras ? (
                    errorIds.has(String(product.id)) ? (
                      <div className="flex flex-col items-center justify-center text-tertiary select-none h-full">
                        <div className="h-10 w-10 rounded-md bg-quaternary/60 flex items-center justify-center mb-1">
                          <svg viewBox="0 0 24 24" className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 8l1.5 12h9L18 8H6z" />
                            <path d="M9 8a3 3 0 116 0" />
                          </svg>
                        </div>
                        <span className="text-[10px]">Sem imagem</span>
                      </div>
                    ) : (
                      <Image
                        src={product.imagemUrl ?? cloudinaryUrl(product.codigoBarras!, { withExt: true, transformations: ["f_auto", "q_auto:good", "c_limit", "w_200"] })}
                        alt={product.nome}
                        width={64}
                        height={64}
                        className="object-contain"
                        unoptimized
                        onError={() => {
                          setErrorIds(prev => {
                            const next = new Set(prev);
                            next.add(String(product.id));
                            return next;
                          });
                        }}
                      />
                    )
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 8l1.5 12h9L18 8H6z" />
                      <path d="M9 8a3 3 0 116 0" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{product.nome}</div>
                  <div className="text-xs text-tertiary">{formatBRL(unitPrice)}{isWeight ? ' /100g' : ''} {formatQtyGrams(product, qty)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => dec(product.id)} className="h-8 w-8 rounded-md border flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">-</button>
                  <div className="w-8 text-center text-sm">{qty}</div>
                  <button onClick={() => inc(product.id)} className="h-8 w-8 rounded-md border flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">+</button>
                </div>
                <div className="w-24 text-right text-sm font-semibold">{formatBRL(lineTotal)}</div>
                <button onClick={() => remove(product.id)} className="h-8 w-8 rounded-md border flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300" aria-label="Remover item">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 6h12M9 6V4h6v2m-8 2l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-4">
          <button onClick={clear} className="text-sm text-red-600 hover:text-red-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">Limpar carrinho</button>
          <div className="text-sm">
            Subtotal: <span className="font-semibold">{formatBRL(subtotal)}</span>
          </div>
        </div>

        
        <div className="mt-4">
          <Link href="/checkout" className="w-full inline-flex items-center justify-center h-10 rounded-md bg-secondary text-white text-sm font-medium hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">Continuar</Link>
        </div>
      </div>
    </div>
  );
}