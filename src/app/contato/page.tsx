'use client'

import React, { useEffect, useState } from 'react'

interface BrandingContact {
  siteName?: string
  tagline?: string
  fantasyName?: string
  address?: string
  phone?: string
  instagram?: string
  facebook?: string
}



export default function ContatoPage() {
  const [data, setData] = useState<BrandingContact>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/branding', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Falha ao carregar branding')
        const json = await res.json()
        setData(json || {})
      })
      .catch(() => setError('Não foi possível carregar as informações de contato.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">Carregando</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📨</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">Tentar Novamente</button>
        </div>
      </div>
    )
  }

  const { fantasyName, address, phone, instagram, facebook, siteName, tagline } = data

  const onlyDigits = (v: string) => v.replace(/\D+/g, '')
  const telDigits = onlyDigits(phone || '')
  const displayName = 'Sobre Nós'

  // Removido: botão Abrir WhatsApp

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da página */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white py-8 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
              {/* Removido texto abaixo do título (tagline) */}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fantasyName && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏬</span>
                <div>
                  <div className="font-semibold text-gray-800">Nome Fantasia</div>
                  <div className="text-sm text-gray-600">{fantasyName}</div>
                </div>
              </div>
            </div>
          )}

          {address && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📍</span>
                <div>
                  <div className="font-semibold text-gray-800">Endereço</div>
                  <div className="text-sm text-gray-600">{address}</div>
                </div>
              </div>
            </div>
          )}

          {phone && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📞</span>
                  <div>
                    <div className="font-semibold text-gray-800">Telefone</div>
                    <div className="text-sm text-gray-600">
                      <a href={`tel:${telDigits}`} className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">{phone}</a>
                    </div>
                  </div>
                </div>
                {/* Removido botão Abrir WhatsApp */}
              </div>
            </div>
          )}

          {(instagram || facebook) && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🌐</span>
                <div>
                  <div className="font-semibold text-gray-800">Redes sociais</div>
                  <div className="flex gap-3 mt-1">
                    {instagram && (
                      <a href={instagram} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-md text-sm bg-primary text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">Instagram</a>
                    )}
                    {facebook && (
                      <a href={facebook} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300">Facebook</a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}