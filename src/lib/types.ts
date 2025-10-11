export type Produto = {
  [x: string]: string | number | boolean | null | undefined;
  id: string | number;
  nome: string;
  descricao?: string;
  preco: number;
  precoPromocional?: number | null;
  promocaoAtiva?: boolean;
  categoria?: string | null;
  codigoBarras?: string | null;
  imagemUrl?: string | null;
  unit_type?: "unit" | "weight" | string | null;
  // extras opcionais
  pesavel?: string | null;
  data_promo_inic?: string | null;
  data_promo_final?: string | null;
};

export interface DataPage<T> {
  items: T[];
  meta: {
    total: number;
    page?: number;
    page_size?: number;
    hasMore?: boolean;
    count?: number;
  };
}