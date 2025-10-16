import CatalogClient from "@/components/CatalogClient";
import JsonLd from "@/components/JsonLd";
import { fetchCategories, fetchProducts } from "@/lib/api";
import type { Produto } from "@/lib/types";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { Suspense } from "react";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoriaPage({ params }: PageProps) {
  const { slug } = await params;
  const category = decodeURIComponent(slug || "");
  const [initial, allCats] = await Promise.all([
    fetchProducts({ page: 1, page_size: 24, order: "name_asc", category }),
    fetchCategories(),
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: (initial.items || [])
      .slice(0, 24)
      .map((p: Produto, idx: number) => {
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
            ...(p.preco
              ? {
                  offers: {
                    "@type": "Offer",
                    price: p.preco,
                    priceCurrency: "BRL",
                    availability: "https://schema.org/InStock",
                  },
                }
              : {}),
          },
        };
      }),
  };

  return (
    <>
      <JsonLd data={itemList} />
      <Suspense
        fallback={
          <div
            className="text-xs text-gray-500"
            role="status"
            aria-live="polite"
          >
            Carregando categoria...
          </div>
        }
      >
        <CatalogClient
          initialItems={initial.items}
          initialTotal={initial.meta.total}
          initialCategories={allCats}
          initialCategory={category}
        />
      </Suspense>
    </>
  );
}
