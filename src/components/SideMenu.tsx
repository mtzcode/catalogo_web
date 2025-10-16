"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchCategories } from "@/lib/api";
import { useCart } from "@/providers/CartProvider";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  siteName?: string;
  tagline?: string;
  fantasyName?: string;
  address?: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
}

interface MenuItem {
  icon: React.ReactNode | string;
  label: string;
  href: string;
  description: string;
  comingSoon?: boolean;
  badge?: string;
}

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  siteName: siteNameProp,
  tagline: taglineProp,
  fantasyName,
  address,
  phone,
  instagram,
  facebook,
}) => {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [cats, setCats] = useState<string[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const { totalItems } = useCart();

  const siteName = siteNameProp || "";
  const tagline = taglineProp || "";

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (catOpen && cats.length === 0) {
      setCatLoading(true);
      fetchCategories()
        .then((list) => {
          setCats(list || []);
          setCatError(null);
        })
        .catch(() => setCatError("Não foi possível carregar categorias"))
        .finally(() => setCatLoading(false));
    }
  }, [catOpen, cats.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isOpen &&
        !target.closest(".side-menu") &&
        !target.closest(".menu-button")
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      if (window.innerWidth < 1024) {
        document.body.style.overflow = "hidden";
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const menuItems: MenuItem[] = [
    { icon: "🏠", label: "Início", href: "/", description: "Página principal" },
    {
      icon: "🔥",
      label: "Ofertas",
      href: "/ofertas",
      description: "Produtos em promoção",
      badge: "Novo",
    },
    {
      icon: "🛒",
      label: "Meu Carrinho",
      href: "/cart",
      description: "Itens selecionados",
    },
    {
      icon: "📞",
      label: "Contato",
      href: "/contato",
      description: "Fale conosco",
    },
  ];

  const acronym = (siteName || "MF").slice(0, 2).toUpperCase();

  return (
    <div suppressHydrationWarning>
      {isOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          side-menu fixed top-0 left-0 h-full bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          w-80 lg:w-72
        `}
      >
        <div className="flex items-center justify-between p-4 border-b bg-primary text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-sm">{acronym}</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg">{siteName}</h2>
              {tagline && <p className="text-white/80 text-xs">{tagline}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary rounded-lg transition-colors lg:hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
            aria-label="Fechar menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-1" suppressHydrationWarning>
            {menuItems.map((item, index) => {
              const isActive = isHydrated ? pathname === item.href : false;
              const isDisabled = item.comingSoon === true;
              return (
                <div key={index}>
                  {isDisabled ? (
                    <div className="flex items-center px-3 py-3 rounded-lg text-gray-400 cursor-not-allowed relative">
                      <span className="text-xl mr-3">{item.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-gray-400">
                          {item.description}
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        Em breve
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center px-3 py-3 rounded-lg transition-all duration-200
                        hover:bg-gray-50 hover:shadow-sm group relative
                        ${
                          isActive
                            ? "bg-white text-primary border-l-4 border-primary shadow-sm"
                            : "text-gray-700 hover:text-gray-900"
                        } focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300
                      `}
                    >
                      <span
                        className={`text-xl mr-3 transition-transform group-hover:scale-110 ${
                          isActive ? "filter brightness-110" : ""
                        }`}
                      >
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <div
                          className={`font-medium text-sm ${
                            isActive ? "text-primary" : "text-gray-900"
                          }`}
                        >
                          {item.label}
                        </div>
                        <div
                          className={`text-xs ${
                            isActive ? "text-primary" : "text-gray-500"
                          }`}
                        >
                          {item.description}
                        </div>
                      </div>
                      {item.badge && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      {item.href === "/cart" && totalItems > 0 && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                          {totalItems}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute right-2 w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </Link>
                  )}

                  {item.label === "Início" && (
                    <div className="mt-1">
                      <button
                        onClick={() => setCatOpen((v) => !v)}
                        className="flex items-center px-3 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-sm group relative w-full text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
                        aria-expanded={catOpen}
                        aria-controls="menu-categorias"
                        type="button"
                      >
                        <span className="text-xl mr-3">📂</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Categorias</div>
                          <div className="text-xs text-gray-500">
                            Explore por seção
                          </div>
                        </div>
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            catOpen ? "rotate-180" : ""
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      {catOpen && (
                        <div
                          id="menu-categorias"
                          className="max-h-60 overflow-y-auto pl-10 pr-4 py-2 space-y-1"
                        >
                          <Link
                            href="/"
                            onClick={onClose}
                            className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
                          >
                            Todas
                          </Link>
                          {catLoading && (
                            <div className="text-xs text-gray-400 px-3 py-2">
                              Carregando...
                            </div>
                          )}
                          {catError && (
                            <div className="text-xs text-red-500 px-3 py-2">
                              {catError}
                            </div>
                          )}
                          {!catLoading &&
                            !catError &&
                            cats.map((c) => (
                              <Link
                                href={`/categoria/${encodeURIComponent(c)}`}
                                key={c}
                                onClick={onClose}
                                className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
                                title={c}
                              >
                                {c}
                              </Link>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="border-t p-4 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">Versão 1.0.0</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SideMenu;
