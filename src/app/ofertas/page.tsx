'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { fetchProducts } from '@/lib/api';
import type { Produto } from '@/lib/types';

export default function OfertasPage() {
  const [products, setProducts] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts({ page: 1, page_size: 48, order: 'name_asc' });
        const onlyOffers = (data.items || []).filter((p) => Boolean(p.promocaoAtiva) && p.precoPromocional != null);
        setProducts(onlyOffers);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar ofertas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops! Algo deu errado</h2>
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
      {/* Header da página */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-8 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-4xl animate-bounce">🔥</span>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Ofertas Imperdíveis</h1>
              <p className="text-red-100">Produtos com os melhores preços para você!</p>
            </div>
            <span className="text-4xl animate-bounce">🔥</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhuma oferta disponível</h2>
            <p className="text-gray-600 mb-6">No momento não temos produtos em promoção.</p>
            <p className="text-sm text-gray-500">Volte em breve para conferir nossas ofertas!</p>
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
                      {products.length} {products.length === 1 ? 'Oferta Encontrada' : 'Ofertas Encontradas'}
                    </h2>
                    <p className="text-sm text-gray-600">Aproveite enquanto durarem os estoques!</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Atualizado agora</div>
                  <div className="flex items-center space-x-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Ao vivo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de produtos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <div key={product.id}>
                  <ProductCard p={product} />
                </div>
              ))}
            </div>

            {/* Call to action */}
            <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Não perca essas ofertas!</h3>
              <p className="mb-4 text-blue-100">Adicione seus produtos favoritos ao carrinho agora mesmo.</p>
              <div className="flex justify-center space-x-4">
                <Link href="/" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Ver Mais Produtos
                </Link>
                <Link href="/favoritos" className="border border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Meus Favoritos
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}