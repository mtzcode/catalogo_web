'use client';

import { useState } from "react";
import Link from "next/link";
import SideMenu from "@/components/SideMenu";
import MenuButton from "@/components/MenuButton";
import CartButton from "@/components/CartButton";

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div suppressHydrationWarning>
      <SideMenu isOpen={isMenuOpen} onClose={closeMenu} />
      <header className="border-b bg-white sticky top-0 z-30" suppressHydrationWarning>
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MenuButton onClick={toggleMenu} isOpen={isMenuOpen} />
            <Link href="/" className="font-semibold hover:text-blue-600 transition-colors">Mercado Fácil</Link>
          </div>
          <CartButton />
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}