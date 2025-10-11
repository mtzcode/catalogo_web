import CatalogClient from "@/components/CatalogClient";
import { fetchCategories, fetchProducts } from "@/lib/api";

export default async function Home() {
  const [initial, initialCats] = await Promise.all([
    fetchProducts({ page: 1, page_size: 24, order: "name_asc" }),
    fetchCategories(),
  ]);

  return (
    <CatalogClient
      initialItems={initial.items}
      initialTotal={initial.meta.total}
      initialCategories={initialCats}
    />
  );
}
