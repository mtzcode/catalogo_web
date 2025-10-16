"use client";

import React, { useEffect, useState } from "react";
import JsonLd from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api";
import type { Produto } from "@/lib/types";
import { cloudinaryUrl } from "@/lib/cloudinary";

export default function OfertasPage() {
  const [products, setProducts] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts({
          page: 1,
          page_size: 48,
          order: "name_asc",
        });
        const onlyOffers = (data.items || []).filter(
          (p) => Boolean(p.promocaoAtiva) && p.precoPromocional != null
        );
        setProducts(onlyOffers);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar ofertas");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.slice(0, 48).map((p, idx) => {
      const image =
        p.imagemUrl ||
        (p.codigoBarras
          ? cloudinaryUrl(p.codigoBarras, { withExt: true })
          : undefined);
      const gtin13 =
        p.codigoBarras && /^\d{13}$/.test(p.codigoBarras)
          ? p.codigoBarras
          : undefined;
      return {
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Product",
          name: p.nome,
          description: p.descricao,
          ...(image ? { image } : {}),
          sku: String(p.id),
          ...(gtin13 ? { gtin13 } : {}),
          ...(p.categoria ? { category: p.categoria } : {}),
          offers: {
            "@type": "Offer",
            price: p.precoPromocional ?? p.preco,
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
          },
        },
      };
    }),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">Carregando</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔥</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={itemList} />
      {/* Header da página */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-8 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-4xl animate-bounce">🔥</span>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Ofertas Imperdíveis</h1>
              <p className="text-red-100">
                Produtos com os melhores preços para você!
              </p>
            </div>
            <span className="text-4xl animate-bounce">🔥</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Nenhuma oferta disponível
            </h2>
            <p className="text-gray-600 mb-6">
              No momento não temos produtos em promoção.
            </p>
            <p className="text-sm text-gray-500">
              Volte em breve para conferir nossas ofertas!
            </p>
          </div>
        ) : (
          <>
            {/* Contador de ofertas */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h2 className="font-semibold text-gray-800">
                      {products.length}{" "}
                      {products.length === 1
                        ? "Oferta Encontrada"
                        : "Ofertas Encontradas"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Aproveite enquanto durarem os estoques!
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Atualizado agora</div>
                  <div className="flex items-center space-x-1 text-primary">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-xs">Em tempo real</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de produtos em oferta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
              {products.map((p) => (
                <div key={p.id}>
                  <ProductCard p={p} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
