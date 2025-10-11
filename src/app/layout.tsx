import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "@/components/buttons.css";
import "./animations.css";
import RootLayoutContent from "@/components/RootLayoutContent";
import { CartProvider } from "@/providers/CartProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Mercado Fácil - Catálogo de Produtos",
    template: "%s | Mercado Fácil",
  },
  description:
    "Descubra os melhores produtos no Mercado Fácil. Catálogo completo com preços atualizados.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased bg-gray-50" suppressHydrationWarning>
        <CartProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </CartProvider>
      </body>
    </html>
  );
}
