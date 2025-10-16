"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SideMenu from "@/components/SideMenu";
import MenuButton from "@/components/MenuButton";
import CartButton from "@/components/CartButton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary as AppErrorBoundary } from "@/components/ErrorBoundary";
import { useMenuStore } from "@/providers/menuStore";

type BrandingConfig = {
  siteName?: string;
  logoUrl?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  tagline?: string;
  fantasyName?: string;
  address?: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
};

export default function RootLayoutContent({
  children,
  initialBranding,
}: {
  children: React.ReactNode;
  initialBranding?: BrandingConfig;
}) {
  const isMenuOpen = useMenuStore((s) => s.isOpen);
  const [siteName, setSiteName] = useState<string>(initialBranding?.siteName || "");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(initialBranding?.logoUrl || undefined);
  const [tagline, setTagline] = useState<string>(initialBranding?.tagline || "");
  const [fantasyName, setFantasyName] = useState<string>(initialBranding?.fantasyName || "");
  const [address, setAddress] = useState<string>(initialBranding?.address || "");
  const [phone, setPhone] = useState<string>(initialBranding?.phone || "");
  const [instagram, setInstagram] = useState<string>(initialBranding?.instagram || "");
  const [facebook, setFacebook] = useState<string>(initialBranding?.facebook || "");

  const [queryClient] = useState(() => new QueryClient());

  const toggleMenu = useMenuStore((s) => s.toggle);
  const closeMenu = useMenuStore((s) => s.close);

  useEffect(() => {
    const applyBranding = (cfg: BrandingConfig) => {
      const html = document.documentElement;
      // Garantir compatibilidade com estilos que dependem de data-theme
      if (!html.getAttribute('data-theme')) {
        html.setAttribute('data-theme', 'brand');
      }
      if (cfg.colorPrimary) html.style.setProperty('--brand-color-primary', cfg.colorPrimary);
      if (cfg.colorSecondary) html.style.setProperty('--brand-color-secondary', cfg.colorSecondary);
      if (cfg.logoUrl) html.style.setProperty('--logo-url', `url('${cfg.logoUrl}')`);
      if (cfg.siteName) setSiteName(cfg.siteName);
      if (cfg.logoUrl) setLogoUrl(cfg.logoUrl);
      if (cfg.tagline) setTagline(cfg.tagline);
      if (cfg.fantasyName) setFantasyName(cfg.fantasyName);
      if (cfg.address) setAddress(cfg.address);
      if (cfg.phone) setPhone(cfg.phone);
      if (cfg.instagram) setInstagram(cfg.instagram);
      if (cfg.facebook) setFacebook(cfg.facebook);
    };

    // Aplicar imediatamente o branding inicial do SSR para garantir variáveis CSS no cliente
    if (initialBranding) {
      applyBranding(initialBranding);
    }

    // Em seguida, tentar buscar branding atualizado da API (sem cache)
    fetch('/api/branding', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('branding não encontrado');
        const data: BrandingConfig = await res.json();
        applyBranding(data);
      })
      .catch(() => {
        // Sem branding, manter initialBranding/fallbacks
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <div suppressHydrationWarning>
          <SideMenu isOpen={isMenuOpen} onClose={closeMenu} siteName={siteName} tagline={tagline} fantasyName={fantasyName} address={address} phone={phone} instagram={instagram} facebook={facebook} />
          <header
            className="border-b bg-white sticky top-0 z-30"
            suppressHydrationWarning
          >
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MenuButton onClick={toggleMenu} isOpen={isMenuOpen} />
                <Link
                  href="/"
                  className="font-semibold text-primary hover:opacity-80 transition-colors flex items-center gap-2"
                >
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={siteName || 'Logo'}
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-md object-contain"
                      unoptimized
                      onError={() => {
                        // Se o asset do logo não existir, voltar para ícone padrão
                        setLogoUrl('/window.svg');
                      }}
                    />
                  ) : (
                    <Image
                      src={'/window.svg'}
                      alt={siteName || 'Logo'}
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-md object-contain"
                      unoptimized
                    />
                  )}
                  <span>{siteName}</span>
                </Link>
              </div>
              <CartButton />
            </div>
          </header>
          <main className="container mx-auto px-4 py-6">{children}</main>
        </div>
      </AppErrorBoundary>
    </QueryClientProvider>
  );
}
