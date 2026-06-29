// =======================================================
// NAVBAR — componente de navegação principal
// Para alterar o nome da marca: substitui [MARCA] pelo nome real
// Para adicionar o logótipo: substitui o bloco de texto por <Image src="/logo.png" ... />
// =======================================================

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const BRAND_NAME = "[MARCA]"; // ← Substitui aqui pelo nome da tua empresa

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "/contactos", label: "Contactos" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo / Nome da marca */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* Se tiveres logótipo, substitui este bloco por:
                <Image src="/logo.png" alt={BRAND_NAME} width={140} height={40} />
            */}
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {BRAND_NAME.charAt(0)}
              </span>
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
              {BRAND_NAME}
            </span>
          </Link>

          {/* Links desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  router.pathname === link.href
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Botão menu mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                router.pathname === link.href
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
