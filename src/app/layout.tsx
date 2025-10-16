import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "@/components/buttons.css";
import "./animations.css";
import RootLayoutContent from "@/components/RootLayoutContent";
import { CartProvider } from "@/providers/CartProvider";
import { promises as fs } from "fs";
import path from "path";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

async function readBranding() {
  try {
    const appDir = process.cwd();
    const brandingPath = path.join(appDir, "branding.json");
    const buf = await fs.readFile(brandingPath);
    const json = JSON.parse(buf.toString());
    return json as {
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
      siteUrl?: string;
    };
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const branding = await readBranding();
  const siteName = branding.siteName || "";
  const logoUrl = branding.logoUrl || "/window.svg";
  const siteUrl = branding.siteUrl || "http://localhost:3012";
  const titleBase = siteName ? `${siteName} - Catálogo de Produtos` : `Catálogo de Produtos`;
  return {
    title: {
      default: titleBase,
      template: siteName ? `%s | ${siteName}` : `%s`,
    },
    description: siteName
      ? `Descubra os melhores produtos no ${siteName}. Catálogo completo com preços atualizados.`
      : `Descubra os melhores produtos. Catálogo completo com preços atualizados.`,
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: "website",
      siteName: siteName || undefined,
      title: titleBase,
      description: siteName
        ? `Descubra os melhores produtos no ${siteName}. Catálogo completo com preços atualizados.`
        : `Descubra os melhores produtos. Catálogo completo com preços atualizados.`,
      url: siteUrl,
      images: [
        {
          url: `${siteUrl}${logoUrl}`,
          width: 1200,
          height: 630,
          alt: siteName ? `${siteName} — Catálogo de Produtos` : `Catálogo de Produtos`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleBase,
      description: siteName
        ? `Descubra os melhores produtos no ${siteName}. Catálogo completo com preços atualizados.`
        : `Descubra os melhores produtos. Catálogo completo com preços atualizados.`,
      images: [`${siteUrl}${logoUrl}`],
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const branding = await readBranding();
  const brandPrimary = branding.colorPrimary;
  const brandSecondary = branding.colorSecondary;
  const logoCssUrl = branding.logoUrl ? `url('${branding.logoUrl}')` : undefined;
  const htmlStyle = (brandPrimary || brandSecondary || logoCssUrl)
    ? ({ ["--brand-color-primary" as any]: brandPrimary, ["--brand-color-secondary" as any]: brandSecondary, ["--logo-url" as any]: logoCssUrl } as React.CSSProperties)
    : undefined;

  return (
    <html lang="pt-BR" className={poppins.variable} data-theme="brand" style={htmlStyle}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased bg-gray-50" suppressHydrationWarning>
        <CartProvider>
          <RootLayoutContent initialBranding={branding}>{children}</RootLayoutContent>
        </CartProvider>
      </body>
    </html>
  );
}
