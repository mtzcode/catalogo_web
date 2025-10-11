const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

import type { DataPage, Produto } from "./types";

type ApiProduto = {
  id?: number | string;
  codigo?: string | number;
  nome?: string;
  descricao?: string;
  preco_venda?: number | string;
  preco?: number | string;
  promo_price?: number | null;
  precoPromocional?: number | null;
  promo_status?: string;
  promocaoAtiva?: boolean;
  categoria?: string | null;
  category?: string | null;
  codigo_barras?: string | null;
  codigoBarras?: string | null;
  barcode?: string | null;
  ean?: string | null;
  imagem_url?: string | null;
  imagemUrl?: string | null;
  unit_type?: string | null;
  pesavel?: string | null;
  data_promo_inic?: string | null;
  data_promo_final?: string | null;
  [key: string]: unknown;
};

async function mapProduto(apiItem: ApiProduto): Promise<Produto> {
  return {
    id: apiItem.id ?? apiItem.codigo ?? String(apiItem.id ?? apiItem.codigo),
    nome: apiItem.nome ?? apiItem.descricao ?? "Produto",
    descricao: apiItem.descricao ?? apiItem.nome ?? "",
    preco: Number(apiItem.preco_venda ?? apiItem.preco ?? 0),
    precoPromocional: apiItem.promo_price ?? apiItem.precoPromocional ?? null,
    promocaoAtiva: (apiItem.promo_status === "active") || (apiItem.promocaoAtiva ?? false),
    categoria: apiItem.categoria ?? apiItem.category ?? null,
    codigoBarras: apiItem.codigo_barras ?? apiItem.codigoBarras ?? apiItem.barcode ?? apiItem.ean ?? (
      typeof apiItem.id === "string" && /^\d{8,14}$/.test(apiItem.id)
        ? apiItem.id
        : (typeof apiItem.id === "number" && /^\d{8,14}$/.test(String(apiItem.id)) ? String(apiItem.id) : null)
    ),
    imagemUrl: apiItem.imagem_url ?? apiItem.imagemUrl ?? null,
    unit_type: apiItem.unit_type ?? null,
    pesavel: apiItem.pesavel ?? null,
    data_promo_inic: apiItem.data_promo_inic ?? null,
    data_promo_final: apiItem.data_promo_final ?? null,
  };
}

export async function fetchProducts(opts: {
  search?: string;
  category?: string;
  page?: number;
  page_size?: number;
  signal?: AbortSignal;
  order?: "name_asc" | "name_desc" | "price_asc" | "price_desc";
} = {}): Promise<DataPage<Produto>> {
  const page = opts.page ?? 1;
  const pageSize = opts.page_size ?? 24;
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (opts.search) params.set("q", opts.search);
  if (opts.category) params.set("category", opts.category);

  const url = `${API_BASE}/products?${params.toString()}`;
  let res: Response;
  try {
    res = await fetch(url, { signal: opts.signal });
  } catch {
    return { items: [], meta: { total: 0, page, page_size: pageSize, hasMore: false, count: 0 } };
  }
  if (!res.ok) {
    return { items: [], meta: { total: 0, page, page_size: pageSize, hasMore: false, count: 0 } };
  }
  const json = await res.json();
  const items: Produto[] = Array.isArray(json.items)
    ? await Promise.all(json.items.map(mapProduto))
    : Array.isArray(json)
    ? await Promise.all(json.map(mapProduto))
    : [];
  const total = json.meta?.total ?? json.total ?? json.count ?? items.length;
  const hasMore: boolean = Boolean(json.hasMore ?? json.meta?.hasMore ?? false);
  const count: number = Number(json.count ?? json.meta?.count ?? items.length);
  const metaPage: number = json.page ?? json.meta?.page ?? page;
  const metaPageSize: number = json.pageSize ?? json.meta?.page_size ?? pageSize;
  return { items, meta: { total, page: metaPage, page_size: metaPageSize, hasMore, count } };
}

export async function fetchCategories(signal?: AbortSignal): Promise<string[]> {
  const data = await fetchProducts({ page: 1, page_size: 200, signal });
  const cats = Array.from(new Set(
    data.items
      .map((p) => p.categoria)
      .filter(Boolean)
      .map((c) => String(c))
  ));
  return cats.sort((a, b) => a.localeCompare(b));
}