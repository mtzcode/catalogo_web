export function isWeightProduct(p: { unit_type?: string | null; pesavel?: string | null }) {
  // Ajustado conforme requisitado: considerar produto de peso APENAS quando pesavel === 'L' ou 'S' (case-insensitive)
  const flag = (p.pesavel || '').toUpperCase();
  return flag === 'L' || flag === 'S';
}

export function getUnitPricePer100g(p: { unit_type?: string | null; pesavel?: string | null }, basePrice: number) {
  return isWeightProduct(p) ? basePrice / 10 : basePrice;
}

export function computeLineTotal(p: { unit_type?: string | null; pesavel?: string | null }, basePrice: number, qty: number) {
  // Para itens pesáveis (L/S), cada unidade no carrinho representa 100g
  return isWeightProduct(p) ? (basePrice / 10) * qty : basePrice * qty;
}

export function formatQtyGrams(p: { unit_type?: string | null; pesavel?: string | null }, qty: number) {
  return isWeightProduct(p) ? `${qty * 100}g` : String(qty);
}