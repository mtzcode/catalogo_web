"use client";

import { useEffect, useState, useTransition, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchProducts } from "@/lib/api";
import type { Produto } from "@/lib/types";
import { SimpleProductGrid } from "./ProductGrid";

interface CatalogClientProps {
  initialItems: Produto[];
  initialTotal: number;
  initialCategories: string[];
}

export default function CatalogClient({ initialItems, initialTotal, initialCategories }: CatalogClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const searchParams = useSearchParams();
  const chipsRef = useRef<HTMLDivElement | null>(null);

  const [items, setItems] = useState<Produto[]>(initialItems || []);
  const [total, setTotal] = useState(initialTotal || 0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Removido: carregamento de categorias na página principal
  // useEffect(() => {
  //   if (!categories || categories.length === 0) {
  //     fetchCategories()
  //       .then(setCategories)
  //       .catch(() => setCategories([]));
  //   }
  // }, [categories]);

  // Ler categoria da URL (?category=...)
  useEffect(() => {
    const catParam = searchParams.get("category");
    setCategory(catParam || undefined);
  }, [searchParams]);

  useEffect(() => {
    const container = chipsRef.current;
    if (!container) return;
    const activeId = category ? `cat-${encodeURIComponent(category)}` : "cat-__all__";
    const el = document.getElementById(activeId);
    if (el) {
      const target = el as HTMLElement;
      const elLeft = target.offsetLeft;
      const elWidth = target.offsetWidth;
      const containerWidth = container.clientWidth;
      const left = Math.max(0, elLeft - (containerWidth / 2 - elWidth / 2));
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [category, initialCategories]);

  useEffect(() => {
    const controller = new AbortController();
    startTransition(() => {
      fetchProducts({ search: search || undefined, category: category || undefined, page: 1, page_size: 24, order: "name_asc", signal: controller.signal })
        .then((data) => {
          setItems(data.items);
          setTotal(data.meta.total);
          setHasMore(Boolean(data.meta.hasMore));
          setPage(1);
        })
        .catch((e: unknown) => {
          if (e instanceof Error && e.name === "AbortError") return;
          setError(e instanceof Error ? e.message : "Erro ao carregar produtos");
        });
    });
    return () => controller.abort();
  }, [search, category]);

  // Carregar próxima página
  const loadMore = useCallback(async () => {
    if (loadingMore || isPending || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchProducts({
        search: search || undefined,
        category: category || undefined,
        page: nextPage,
        page_size: 24,
        order: "name_asc",
      });
      setItems((prev) => [...prev, ...data.items]);
      setHasMore(Boolean(data.meta.hasMore));
      setPage(nextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar mais produtos");
    } finally {
      setLoadingMore(false);
    }
  // deps for callback
  }, [loadingMore, isPending, hasMore, page, search, category]);

  // IntersectionObserver para rolagem infinita
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadMore();
          }
        }
      },
      { root: null, threshold: 0.1, rootMargin: "400px" }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
    };
  }, [loadMore]);

  return (
    <div className="flex flex-col gap-5">
      <div className="sticky top-14 z-30 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-3">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold mb-2 text-center">Produtos</h1>
          <div className="flex items-center shadow-sm hover:shadow-md transition-all duration-300">
            <div className="h-10 w-10 flex items-center justify-center rounded-l-md bg-primary">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="11" cy="11" r="7"></circle>
                <path d="M21 21l-4.3-4.3"></path>
              </svg>
            </div>
            <input
              className="h-10 flex-1 rounded-r-md border border-gray-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 px-3 text-sm transition-all duration-300"
               placeholder="Buscar por nome ou código de barras..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               aria-label="Buscar produtos por nome ou código de barras"
             />
          </div>
          {isPending && (
            <div className="text-xs text-gray-500 flex items-center gap-2" role="status" aria-live="polite">
              <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              </svg>
              Carregando...
            </div>
          )}
        </div>
      </div>

      {/* Categorias visíveis na página principal */}
      <div className="-mt-2">
        <div ref={chipsRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
          <Link
            id="cat-__all__"
            href="/"
            className={`whitespace-nowrap text-xs rounded-full border px-3 py-1.5 transition ${!category ? "bg-primary text-white border-primary" : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"}`}
            title="Todas as categorias"
          >
            Todas
          </Link>
          {initialCategories?.map((c) => (
            <Link
              id={`cat-${encodeURIComponent(c)}`}
              href={`/?category=${encodeURIComponent(c)}`}
              key={c}
              className={`whitespace-nowrap text-xs rounded-full border px-3 py-1.5 transition ${category === c ? "bg-primary text-white border-primary" : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"}`}
              title={c}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-[rgba(255,0,0,.05)] border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <SimpleProductGrid items={items} />

      {total > 0 && (
        <div className="text-xs text-gray-500 text-center">{items.length} de {total} produtos</div>
      )}
      <div ref={sentinelRef} className="h-8 w-full" aria-hidden="true" />
      {loadingMore && (
        <div className="text-xs text-gray-500 flex items-center justify-center gap-2 py-2" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
          Carregando mais...
        </div>
      )}
      <style jsx>{`
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}