export const metadata = {
  title: 'Ofertas Imperdíveis',
  description: 'Produtos com os melhores preços, atualizados em tempo real.',
  openGraph: {
    title: 'Ofertas Imperdíveis',
    description: 'Produtos com os melhores preços, atualizados em tempo real.',
    images: [
      {
        url: (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL : 'http://localhost:3012') + '/window.svg',
        width: 1200,
        height: 630,
        alt: 'Ofertas Imperdíveis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ofertas Imperdíveis',
    description: 'Produtos com os melhores preços, atualizados em tempo real.',
    images: [ (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL : 'http://localhost:3012') + '/window.svg' ],
  },
};

export default function OfertasLayout({ children }: { children: React.ReactNode }) {
  return children;
}