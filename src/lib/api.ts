import type { DataPage, Produto } from "./types";

const DEFAULT_LOCAL_API = "http://localhost:8080";
const API_BASE = (() => {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envBase) return envBase;
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    const port = "8080"; // Porta padrão do backend em desenvolvimento
    return `${protocol}//${hostname}:${port}`;
  }
  return DEFAULT_LOCAL_API;
})();

// Padroniza revalidate por ambiente (development/staging/production)
const appEnv = (
  process.env.NEXT_PUBLIC_APP_ENV ||
  process.env.APP_ENV ||
  process.env.NODE_ENV ||
  "development"
).toLowerCase();
export const PAGE_REVALIDATE: number =
  appEnv === "development" ? 0 : appEnv === "staging" ? 60 : 300;
const FETCH_REVALIDATE: number = PAGE_REVALIDATE;

type ApiProduto = {
  id?: number | string;
  codigo?: string | number;
  sku?: string | number;
  nome?: string;
  name?: string;
  descricao?: string;
  description?: string;
  preco_venda?: number | string;
  preco?: number | string;
  price?: number | string;
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
  image?: string | null;
  unit_type?: string | null;
  pesavel?: string | null;
  data_promo_inic?: string | null;
  data_promo_final?: string | null;
  [key: string]: unknown;
};

async function mapProduto(apiItem: ApiProduto): Promise<Produto> {
  // Normaliza preços (strings -> números) e status de promoção baseado em datas e preço válido
  const precoBase = Number(apiItem.preco_venda ?? apiItem.preco ?? apiItem.price ?? 0);
  const rawPromo = apiItem.promo_price ?? apiItem.precoPromocional ?? null;
  const precoPromocional = rawPromo == null ? null : Number(rawPromo);

  const inicioStr = apiItem.data_promo_inic ?? null;
  const finalStr = apiItem.data_promo_final ?? null;
  const inicioDate = inicioStr ? new Date(inicioStr) : null;
  const finalDate = finalStr ? new Date(finalStr) : null;
  const now = new Date();

  // Válido quando há preço menor que o base e maior que zero
  const hasValidPromoPrice =
    typeof precoPromocional === "number" &&
    isFinite(precoPromocional) &&
    precoPromocional > 0 &&
    (precoBase > 0 ? precoPromocional < precoBase : true);

  // Janela de validade por data (se fornecida)
  const withinDateWindow = (() => {
    if (inicioDate && finalDate) return inicioDate <= now && now <= finalDate;
    if (inicioDate && !finalDate) return inicioDate <= now;
    if (!inicioDate && finalDate) return now <= finalDate;
    return true; // sem datas -> não restringe
  })();

  const flagAtivo = apiItem.promo_status === "active" || Boolean(apiItem.promocaoAtiva);
  const promocaoAtiva = Boolean(hasValidPromoPrice && withinDateWindow && (flagAtivo || inicioDate || finalDate));

  return {
    id: apiItem.id ?? apiItem.codigo ?? apiItem.sku ?? String(apiItem.id ?? apiItem.codigo ?? apiItem.sku),
    nome: apiItem.nome ?? apiItem.name ?? apiItem.descricao ?? "Produto",
    descricao: apiItem.descricao ?? apiItem.description ?? apiItem.nome ?? "",
    preco: precoBase,
    precoPromocional,
    promocaoAtiva,
    categoria: apiItem.categoria ?? apiItem.category ?? null,
    // Exibir código de barras mesmo que não seja um EAN de 8-14 dígitos (ex.: '47')
    codigoBarras:
      (apiItem.codigo_barras ?? apiItem.codigoBarras ?? apiItem.barcode ?? apiItem.ean ?? apiItem.sku ?? null) != null
        ? String(apiItem.codigo_barras ?? apiItem.codigoBarras ?? apiItem.barcode ?? apiItem.ean ?? apiItem.sku)
        : null,
    imagemUrl: apiItem.imagem_url ?? apiItem.imagemUrl ?? apiItem.image ?? null,
    unit_type: apiItem.unit_type ?? null,
    pesavel: apiItem.pesavel ?? null,
    data_promo_inic: inicioStr,
    data_promo_final: finalStr,
  };
}

export async function fetchProducts(
  opts: {
    search?: string;
    category?: string;
    page?: number;
    page_size?: number;
    signal?: AbortSignal;
    order?: "name_asc" | "name_desc" | "price_asc" | "price_desc";
  } = {}
): Promise<DataPage<Produto>> {
  const page = opts.page ?? 1;
  const pageSize = opts.page_size ?? 24;
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  // Somente produtos ativos por padrão
  params.set("onlyActive", "1");
  if (opts.search) params.set("q", opts.search);
  if (opts.category) params.set("category", opts.category);

  const base = API_BASE.replace(/\/+$/, "");
  const url = `${base}/api/products?${params.toString()}`;
  let res: Response;
  try {
    const isServer = typeof window === "undefined";
    const fetchOpts: RequestInit = opts.signal ? { signal: opts.signal } : {};
    if (isServer) {
      (fetchOpts as RequestInit & { next?: { revalidate: number } }).next = {
        revalidate: FETCH_REVALIDATE,
      };
    }
    res = await fetch(url, fetchOpts);
  } catch {
    return {
      items: [],
      meta: { total: 0, page, page_size: pageSize, hasMore: false, count: 0 },
    };
  }
  if (!res.ok) {
    return {
      items: [],
      meta: { total: 0, page, page_size: pageSize, hasMore: false, count: 0 },
    };
  }
  const json = await res.json();
  const rawItems = Array.isArray(json.items)
    ? json.items
    : Array.isArray(json.data)
    ? json.data
    : Array.isArray(json)
    ? json
    : [];
  const items: Produto[] = await Promise.all(rawItems.map(mapProduto));
  const total = Number(
    json.meta?.total ?? json.total ?? json.count ?? rawItems.length
  );
  const metaPage: number = Number(json.meta?.page ?? json.page ?? page);
  const metaPageSize: number = Number(
    json.meta?.pageSize ?? json.meta?.page_size ?? json.pageSize ?? pageSize
  );
  const count: number = Number(json.meta?.count ?? json.count ?? items.length);
  const hasMore: boolean = Boolean(
    json.meta?.hasMore ?? json.hasMore ?? metaPage * metaPageSize < total
  );
  return {
    items,
    meta: { total, page: metaPage, page_size: metaPageSize, hasMore, count },
  };
}

export async function fetchCategories(signal?: AbortSignal): Promise<string[]> {
  const data = await fetchProducts({ page: 1, page_size: 200, signal });
  const cats = Array.from(
    new Set(
      data.items
        .map((p) => p.categoria)
        .filter(Boolean)
        .map((c) => String(c))
    )
  );
  // Use uma ordenação determinística com locale fixo para evitar hydration mismatch entre servidor e cliente
  return cats.sort((a, b) =>
    a.localeCompare(b, "pt-BR", { sensitivity: "base" })
  );
}
