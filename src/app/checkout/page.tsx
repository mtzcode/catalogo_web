'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/providers/CartProvider'
import type { CartItem } from '@/providers/CartProvider'
import { computeLineTotal, getUnitPricePer100g, formatQtyGrams, isWeightProduct } from "@/lib/weightUtil";
import { m, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'

type PickupFormValues = {
  nome: string;
  telefone: string;
  pagamento: 'Dinheiro' | 'Cartao' | 'Pix';
}

type DeliveryFormValues = {
  nome: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  complemento: string;
  cidade: string;
  uf: string;
  pagamento: 'Dinheiro' | 'Cartao' | 'Pix';
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function onlyDigits(v: string) {
  return (v || '').replace(/\D/g, '')
}

function dotFill(left: string, right: string, targetLen = 40) {
  const dots = Math.max(4, targetLen - left.length - right.length)
  return '.'.repeat(dots)
}

function buildItemsSummary(items: CartItem[]): string {
  return items
    .map(({ product, qty }) => {
      const isPromo = !!product.promocaoAtiva && !!product.precoPromocional;
      const basePrice = isPromo ? (product.precoPromocional as number) : Number(product.preco || 0);
      const unitPrice = getUnitPricePer100g(product, basePrice);
      const lineTotal = computeLineTotal(product, basePrice, qty);
      const displayQty = formatQtyGrams(product, qty);
      const unitLabel = isWeightProduct(product) ? ' /100g' : ''
      return `• ${product.nome} — ${formatBRL(unitPrice)}${unitLabel} x ${displayQty} = ${formatBRL(lineTotal)}`;
    })
    .join('\n');
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart()

  const [pickupOpen, setPickupOpen] = useState(false)
  const [deliveryOpen, setDeliveryOpen] = useState(false)

  // React Hook Form for pickup
  const { register: registerPickup, getValues: getPickupValues, watch: watchPickup, setValue: setPickupValue } = useForm<PickupFormValues>({
    defaultValues: { nome: '', telefone: '', pagamento: 'Pix' },
  })

  // React Hook Form for delivery
  const { register: registerDelivery, getValues: getDeliveryValues, watch: watchDelivery, setValue: setDeliveryValue } = useForm<DeliveryFormValues>({
    defaultValues: { nome: '', telefone: '', cep: '', endereco: '', numero: '', bairro: '', complemento: '', cidade: '', uf: '', pagamento: 'Pix' },
  })
  const cepWatch = watchDelivery('cep')

  const [lastCepFetched, setLastCepFetched] = useState<string>('')

  const [brandingPhone, setBrandingPhone] = useState<string>('')

  useEffect(() => {
    fetch('/api/branding', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        if (data && data.phone) setBrandingPhone(data.phone)
      })
      .catch(() => {})
  }, [])

  async function lookupCEP(rawCep: string) {
    const cep = onlyDigits(rawCep)
    if (cep.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (data && !data.erro) {
        const current = getDeliveryValues()
        setDeliveryValue('cep', cep)
        setDeliveryValue('endereco', data.logradouro || current.endereco)
        setDeliveryValue('bairro', data.bairro || current.bairro)
        setDeliveryValue('cidade', data.localidade || current.cidade)
        setDeliveryValue('uf', (data.uf || current.uf || '').toUpperCase())
        setLastCepFetched(cep)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const digits = onlyDigits(cepWatch || '')
    if (digits.length === 8 && digits !== lastCepFetched) {
      lookupCEP(digits)
    }
  }, [cepWatch, lastCepFetched])

  function openWhatsApp(message: string) {
    const storePhone = onlyDigits(brandingPhone || '')
    const base = storePhone ? `https://wa.me/${storePhone}` : 'https://wa.me/'
    const url = `${base}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  function handleSendPickup() {
    const { nome, telefone, pagamento } = getPickupValues()
    if (!nome || !telefone) {
      alert('Informe nome e telefone.')
      return
    }
    const itemLines = items.flatMap(({ product, qty }) => {
      const isPromo = !!product.promocaoAtiva && !!product.precoPromocional
      const basePrice = isPromo ? (product.precoPromocional as number) : Number(product.preco || 0)
      const unitPrice = getUnitPricePer100g(product, basePrice)
      const lineTotal = computeLineTotal(product, basePrice, qty)
      const displayQty = formatQtyGrams(product, qty)
      const isWeight = isWeightProduct(product)
      const nameLine = String(product.nome || '').toUpperCase()
      const qtyLabel = isWeight ? `${displayQty}` : `${displayQty} un`
      const left = `${qtyLabel} x ${formatBRL(unitPrice)}`
      const right = `${formatBRL(lineTotal)}`
      const dots = dotFill(left, right, 40)
      return [
        nameLine,
        `${left} ${dots} ${right}`,
        '',
      ]
    })

    const pagamentoLabel = pagamento === 'Cartao' ? 'Cartão' : pagamento

    const msg = [
      '═══════════════════════════',
      '     🔔 NOVO PEDIDO',
      '═══════════════════════════',
      '',
      `Cliente: ${nome}`,
      `Fone: ${telefone}`,
      '',
      '───────────────────────────',
      ...itemLines,
      '───────────────────────────',
      '',
      `SUBTOTAL ................ ${formatBRL(subtotal)}`,
      '',
      `💵 Pagamento: ${pagamentoLabel}`,
      '🏪 RETIRADA NA LOJA',
    ].join('\n')
    openWhatsApp(msg)
    clear()
  }

  function handleSendDelivery() {
    const { nome, telefone, cep, endereco, numero, bairro, complemento, cidade, uf, pagamento } = getDeliveryValues()
    if (!nome || !telefone || !cep || !endereco || !numero || !bairro) {
      alert('Preencha os campos obrigatórios: nome, telefone, CEP, endereço, número e bairro.')
      return
    }

    const itemLines = items.flatMap(({ product, qty }) => {
      const isPromo = !!product.promocaoAtiva && !!product.precoPromocional
      const basePrice = isPromo ? (product.precoPromocional as number) : Number(product.preco || 0)
      const unitPrice = getUnitPricePer100g(product, basePrice)
      const lineTotal = computeLineTotal(product, basePrice, qty)
      const displayQty = formatQtyGrams(product, qty)
      const isWeight = isWeightProduct(product)
      const nameLine = String(product.nome || '').toUpperCase()
      const qtyLabel = isWeight ? `${displayQty}` : `${displayQty} un`
      const left = `${qtyLabel} x ${formatBRL(unitPrice)}`
      const right = `${formatBRL(lineTotal)}`
      const dots = dotFill(left, right, 40)
      return [
        nameLine,
        `${left} ${dots} ${right}`,
        '',
      ]
    })

    const pagamentoLabel = pagamento === 'Cartao' ? 'Cartão' : pagamento

    const msg = [
      '═══════════════════════════',
      '     🔔 NOVO PEDIDO',
      '═══════════════════════════',
      '',
      `Cliente: ${nome}`,
      `Fone: ${telefone}`,
      '',
      '───────────────────────────',
      ...itemLines,
      '───────────────────────────',
      '',
      `SUBTOTAL ................ ${formatBRL(subtotal)}`,
      '',
      `💵 Pagamento: ${pagamentoLabel}`,
      '🚚 ENTREGA NO ENDEREÇO',
      `CEP: ${cep}`,
      `Endereço: ${endereco}, Nº ${numero}`,
      `Bairro: ${bairro}${complemento ? `, Complemento: ${complemento}` : ''}`,
    ].join('\n')
    openWhatsApp(msg)
    clear()
  }

  if (!items || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-3">Checkout</h1>
        <div className="rounded-xl border bg-white p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-center text-tertiary mb-4">Seu carrinho está vazio</div>
          <Link href="/" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-secondary text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">
            Ver produtos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>
      <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Resumo do Pedido acima (coluna lateral com margem inferior) */}
        <div className="lg:col-span-1 order-first lg:order-none mb-8 lg:mb-0">
          <div className="bg-white rounded-xl border p-6 sticky top-6">
            <h2 className="text-lg font-medium mb-4">Resumo do Pedido</h2>
            <div className="space-y-3 mb-4">
              {items.map(({ product, qty }) => {
                const isPromo = !!product.promocaoAtiva && !!product.precoPromocional
                const basePrice = isPromo ? Number(product.precoPromocional as number) : Number(product.preco || 0);
                const unitPrice = getUnitPricePer100g(product, basePrice);
                const lineTotal = computeLineTotal(product, basePrice, qty);
                const displayQty = formatQtyGrams(product, qty);
                const isWeight = isWeightProduct(product);
                return (
                  <div key={`${product.codigo || product.id || product.nome}-${qty}`} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium line-clamp-1">{product.nome}</div>
                      <div className="text-tertiary">Qtd: {displayQty}</div>
                      <div className="text-[11px] text-tertiary">Preço unitário: {formatBRL(unitPrice)}{isWeight ? ' /100g' : ''}</div>
                    </div>
                    <div className="font-medium">
                      {formatBRL(lineTotal)}
                    </div>
                  </div>
                )
              })}
            </div>
            <hr className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-tertiary text-center">
              Ao finalizar, você concorda com nossos termos de uso.
            </div>
          </div>
        </div>

        {/* Bloco de como prefere receber abaixo, com margem para não grudar */}
        <div className="lg:col-span-2 mt-8 lg:mt-0">
          <h1 className="text-2xl font-semibold mb-3">Checkout</h1>
          <div className="rounded-xl border bg-white p-6 mt-4">
            <h2 className="text-lg font-semibold mb-2">Como você prefere receber?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button onClick={() => setPickupOpen(true)} className="h-24 border rounded-md p-4 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">
                <div className="font-medium">Retirar na loja</div>
                <div className="text-xs text-tertiary">Preencha seus dados e forma de pagamento</div>
              </button>
              <button onClick={() => setDeliveryOpen(true)} className="h-24 border rounded-md p-4 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">
                <div className="font-medium">Entregar no endereço</div>
                <div className="text-xs text-tertiary">Informe seu endereço completo</div>
              </button>
            </div>
          </div>

          {/* Modal Retirar na loja */}
          <AnimatePresence>
          {pickupOpen && (
            <m.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <m.div className="absolute inset-0 bg-black/40" onClick={() => setPickupOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              <m.div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-5" initial={{ y: 40, scale: 0.98, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 20, scale: 0.98, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                {/* conteúdo original do modal */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Retirar na loja</h3>
                  <button onClick={() => setPickupOpen(false)} className="text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">✕</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Nome completo</label>
                    <input {...registerPickup('nome', { required: true })} className="w-full border rounded-md h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Telefone (WhatsApp)</label>
                    <input {...registerPickup('telefone', { required: true })} className="w-full border rounded-md h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300" placeholder="(11) 99999-9999" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Forma de pagamento</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Dinheiro','Cartao','Pix'] as const).map((p) => (
                        <button key={p} type="button" onClick={() => setPickupValue('pagamento', p)} className={`h-10 border rounded-md text-sm ${watchPickup('pagamento') === p ? 'bg-white border-primary' : ''} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300`}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <button onClick={handleSendPickup} className="w-full h-10 rounded-md bg-secondary text-white text-sm font-medium hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">Enviar pedido via WhatsApp</button>
                  </div>
                </div>
              </m.div>
            </m.div>
          )}
          </AnimatePresence>

          {/* Modal Entregar no endereço */}
          <AnimatePresence>
          {deliveryOpen && (
            <m.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <m.div className="absolute inset-0 bg-black/40" onClick={() => setDeliveryOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              <m.div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-5" initial={{ y: 40, scale: 0.98, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 20, scale: 0.98, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                {/* conteúdo original do modal */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Entregar no endereço</h3>
                  <button onClick={() => setDeliveryOpen(false)} className="text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">✕</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Nome completo</label>
                    <input {...registerDelivery('nome', { required: true })} className="w-full border rounded-md h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Telefone (WhatsApp)</label>
                    <input {...registerDelivery('telefone', { required: true })} className="w-full border rounded-md h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300" placeholder="(11) 99999-9999" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">CEP</label>
                    <input {...registerDelivery('cep', { required: true })} onChange={(e) => { const v = e.target.value; setDeliveryValue('cep', v, { shouldValidate: true }); const digits = onlyDigits(v); if (digits.length === 8 && digits !== lastCepFetched) { lookupCEP(v) } }} onBlur={(e) => lookupCEP(e.target.value)} className="w-full border rounded-md h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300" placeholder="00000-000" />
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-4">
                      <label className="block text sm mb-1">Endereço</label>
                      <input {...registerDelivery('endereco', { required: true })} className="w-full border rounded-md h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm mb-1">Número</label>
                      <input {...registerDelivery('numero', { required: true, pattern: /^\d{1,4}$/ })} onChange={(e) => { const digits = onlyDigits(e.target.value).slice(0, 4); setDeliveryValue('numero', digits, { shouldValidate: true }); }} maxLength={4} inputMode="numeric" pattern="\\d*" placeholder="0000" className="w-full border rounded-md h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm mb-1">Bairro</label>
                      <input {...registerDelivery('bairro', { required: true })} className="w-full border rounded-md h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Complemento</label>
                      <input {...registerDelivery('complemento')} className="w-full border rounded-md h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm mb-1">Cidade</label>
                      <input {...registerDelivery('cidade', { required: true })} className="w-full border rounded-md h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">UF</label>
                      <input {...registerDelivery('uf', { required: true, pattern: /^[A-Za-z]{2}$/ })} onChange={(e) => setDeliveryValue('uf', e.target.value.toUpperCase(), { shouldValidate: true })} className="w-full border rounded-md h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Forma de pagamento</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Dinheiro','Cartao','Pix'] as const).map((p) => (
                        <button key={p} type="button" onClick={() => setDeliveryValue('pagamento', p)} className={`h-10 border rounded-md text-sm ${watchDelivery('pagamento') === p ? 'bg-white border-primary' : ''} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300`}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <button onClick={handleSendDelivery} className="w-full h-10 rounded-md bg-secondary text-white text-sm font-medium hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">Enviar pedido via WhatsApp</button>
                  </div>
                </div>
              </m.div>
            </m.div>
          )}
          </AnimatePresence>

          {/* restante do componente */}

          <div className="mt-4">
            <Link href="/cart" className="text-sm text-secondary hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">Voltar ao carrinho</Link>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}