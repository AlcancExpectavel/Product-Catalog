import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getCategorias } from "../lib/produtos";
import BrandIcon from "./BrandIcon";

const BRAND_NAME = "Alcance Expectável";
const SUPPORTED_LANGUAGES = ["pt", "es", "en"];

function getGoogleTranslateLanguage() {
  const matches = document.cookie.matchAll(/(?:^|;\s*)googtrans=\/pt\/([a-z]+)/g);

  for (const match of matches) {
    if (SUPPORTED_LANGUAGES.includes(match[1])) return match[1];
  }

  return "pt";
}

function clearGoogleTranslateCookies() {
  const expiredCookie =
    "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax";

  // Remove o cookie sem Domain (host-only).
  document.cookie = expiredCookie;

  // O Google Translate pode criar o mesmo cookie no domínio atual ou num
  // domínio superior (por exemplo, .exemplo.pt quando estamos em www.exemplo.pt).
  const hostnameParts = window.location.hostname.split(".");
  const domains = new Set();

  if (hostnameParts.length > 1) {
    domains.add(window.location.hostname);

    for (let index = 1; index < hostnameParts.length - 1; index += 1) {
      domains.add(hostnameParts.slice(index).join("."));
    }
  }

  domains.forEach((domain) => {
    document.cookie = `${expiredCookie}; domain=.${domain}`;
  });
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pesquisa, setPesquisa] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [lang, setLang] = useState("pt");

  // Detecta a língua activa pelo cookie do Google Translate
  useEffect(() => {
    setLang(getGoogleTranslateLanguage());
  }, []);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefereDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(prefereDark);
    document.documentElement.classList.toggle("dark", prefereDark);
  }, []);

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setMenuOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const handlePesquisa = (e) => {
    e.preventDefault();
    if (pesquisa.trim()) {
      router.push(`/produtos?q=${encodeURIComponent(pesquisa.trim())}`);
      setPesquisa("");
    }
  };

  function switchLang(target) {
    if (!SUPPORTED_LANGUAGES.includes(target)) return;

    setLang(target);
    clearGoogleTranslateCookies();

    if (target !== "pt") {
      document.cookie =
        `googtrans=/pt/${target}; path=/; Max-Age=31536000; SameSite=Lax`;
    }

    window.location.reload();
  }

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/produtos", label: "Produtos" },
    { href: "/sobre", label: "Sobre nós" },
    { href: "/contactos", label: "Contactos" },
    { href: "/seguimento", label: "Seguimento de Pedidos" },
  ];

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <BrandIcon size={32} className="shrink-0" />
                <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors hidden sm:block notranslate" translate="no">
                  {BRAND_NAME}
                </span>
              </Link>
            </div>

            <div className="flex justify-center">
              <form onSubmit={handlePesquisa} className="w-full max-w-sm hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    value={pesquisa}
                    onChange={(e) => setPesquisa(e.target.value)}
                    placeholder="Procurar produtos..."
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg pl-4 pr-11 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  />
                  <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-r-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={toggleDark}
                title={darkMode ? "Modo claro" : "Modo escuro"}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:border-brand-400 hover:bg-brand-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors text-base"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              {/* Seletor de língua - 3 bandeiras (notranslate evita que o GT traduza os labels) */}
              <div className="flex items-center gap-1 notranslate" translate="no">
                <button
                  onClick={() => switchLang("pt")}
                  title="Português"
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-colors text-xs font-bold ${lang === "pt" ? "border-brand-400 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-gray-800"}`}
                >
                  <svg viewBox="0 0 20 14" className="w-5 h-3.5 rounded-sm shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <rect width="8" height="14" fill="#006600"/>
                    <rect x="8" width="12" height="14" fill="#FF0000"/>
                    <ellipse cx="8" cy="7" rx="3.2" ry="3.2" fill="#FFFF00"/>
                    <ellipse cx="8" cy="7" rx="2" ry="2" fill="white"/>
                  </svg>
                  <span className="notranslate">PT</span>
                </button>
                <button
                  onClick={() => switchLang("es")}
                  title="Español"
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-colors text-xs font-bold ${lang === "es" ? "border-brand-400 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-gray-800"}`}
                >
                  <svg viewBox="0 0 20 14" className="w-5 h-3.5 rounded-sm shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <rect width="20" height="14" fill="#AA151B"/>
                    <rect y="3" width="20" height="8" fill="#F1BF00"/>
                  </svg>
                  <span className="notranslate">ES</span>
                </button>
                <button
                  onClick={() => switchLang("en")}
                  title="English"
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-colors text-xs font-bold ${lang === "en" ? "border-brand-400 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-gray-800"}`}
                >
                  <svg viewBox="0 0 20 14" className="w-5 h-3.5 rounded-sm shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <rect width="20" height="14" fill="#012169"/>
                    <path d="M0,0 L20,14 M20,0 L0,14" stroke="white" strokeWidth="2.8"/>
                    <path d="M0,0 L20,14 M20,0 L0,14" stroke="#C8102E" strokeWidth="1.6"/>
                    <path d="M10,0 V14 M0,7 H20" stroke="white" strokeWidth="4"/>
                    <path d="M10,0 V14 M0,7 H20" stroke="#C8102E" strokeWidth="2.4"/>
                  </svg>
                  <span className="notranslate">EN</span>
                </button>
              </div>

              <Link href="/admin" title="Área de administração" className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </Link>

              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:block border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 h-11">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Categorias
              </button>

              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    router.pathname === link.href
                      ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-1">
            <form onSubmit={handlePesquisa} className="mb-3">
              <div className="relative">
                <input type="text" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} placeholder="Procurar produtos..." className="w-full border border-gray-300 rounded-lg pl-4 pr-11 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-brand-600 text-white rounded-r-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </form>
            <button onClick={() => { setSidebarOpen(true); setMenuOpen(false); }} className="w-full flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              Categorias
            </button>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`block px-4 py-2 rounded-lg text-sm font-medium ${router.pathname === link.href ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400" : "text-gray-600 hover:bg-gray-100"}`}>
                {link.label}
              </Link>
            ))}
            {/* Seletor de língua mobile */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 mt-2 notranslate" translate="no">
              <span className="text-xs text-gray-400 font-medium">Língua:</span>
              {[
                { code: "pt", label: "PT", flag: <svg viewBox="0 0 20 14" className="w-5 h-3.5 rounded-sm" xmlns="http://www.w3.org/2000/svg"><rect width="8" height="14" fill="#006600"/><rect x="8" width="12" height="14" fill="#FF0000"/><ellipse cx="8" cy="7" rx="3.2" ry="3.2" fill="#FFFF00"/><ellipse cx="8" cy="7" rx="2" ry="2" fill="white"/></svg> },
                { code: "es", label: "ES", flag: <svg viewBox="0 0 20 14" className="w-5 h-3.5 rounded-sm" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#AA151B"/><rect y="3" width="20" height="8" fill="#F1BF00"/></svg> },
                { code: "en", label: "EN", flag: <svg viewBox="0 0 20 14" className="w-5 h-3.5 rounded-sm" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#012169"/><path d="M0,0 L20,14 M20,0 L0,14" stroke="white" strokeWidth="2.8"/><path d="M0,0 L20,14 M20,0 L0,14" stroke="#C8102E" strokeWidth="1.6"/><path d="M10,0 V14 M0,7 H20" stroke="white" strokeWidth="4"/><path d="M10,0 V14 M0,7 H20" stroke="#C8102E" strokeWidth="2.4"/></svg> },
              ].map(({ code, label, flag }) => (
                <button key={code} onClick={() => { switchLang(code); setMenuOpen(false); }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors text-xs font-bold notranslate ${lang === code ? "border-brand-400 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:border-brand-300"}`}
                >
                  {flag} <span className="notranslate">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <BrandIcon size={28} className="shrink-0" />
            <span className="font-bold text-gray-900 dark:text-white notranslate" translate="no">{BRAND_NAME}</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <form onSubmit={(e) => { e.preventDefault(); if (pesquisa.trim()) { router.push(`/produtos?q=${encodeURIComponent(pesquisa.trim())}`); setPesquisa(""); setSidebarOpen(false); } }}>
            <div className="relative">
              <input
                type="text"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Procurar produtos..."
                className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-r-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Categorias</h2>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <Link
            href="/produtos"
            className="flex items-center justify-between px-5 py-3 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800"
          >
            Ver todos os produtos
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {categorias.length === 0 ? (
            <p className="px-5 py-4 text-sm text-gray-400">Ainda sem categorias</p>
          ) : (
            categorias.map((cat) => (
              <Link
                key={cat}
                href={`/produtos?categoria=${encodeURIComponent(cat)}`}
                className="flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-600 dark:hover:text-brand-400 transition-colors border-b border-gray-50 dark:border-gray-800 group"
              >
                {cat}
                <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))
          )}
        </nav>
      </div>
    </>
  );
}
