import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "../../components/Layout";
import ProductCard from "../../components/ProductCard";
import { getProduto, getProdutos } from "../../lib/produtos";

const MARKETPLACES = [
  {
    chave: "linkWorten",
    nome: "Worten",
    cor: "bg-red-600 hover:bg-red-700",
    logo: "W",
  },
  {
    chave: "linkFnac",
    nome: "Fnac",
    cor: "bg-yellow-500 hover:bg-yellow-600",
    logo: "F",
  },
  {
    chave: "linkPCComponentes",
    nome: "PCComponentes",
    cor: "bg-orange-500 hover:bg-orange-600",
    logo: "PC",
  },
];

function Accordion({ titulo, children }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <span className="font-semibold text-gray-900 dark:text-white">{titulo}</span>
        <svg
          className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 shrink-0 ${aberto ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {aberto && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}

export default function PaginaProduto({ produto, produtosRelacionados = [], crossellsNaoEncontrados = [] }) {
  const imagens = produto?.imagens ?? [];
  const [imagemAtiva, setImagemAtiva] = useState(0);
  const timerRef = useRef(null);

  const iniciarTimer = useCallback(() => {
    if (imagens.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setImagemAtiva((prev) => (prev + 1) % imagens.length);
    }, 8000);
  }, [imagens.length]);

  const navegar = useCallback((dir) => {
    setImagemAtiva((prev) => (prev + dir + imagens.length) % imagens.length);
    iniciarTimer();
  }, [imagens.length, iniciarTimer]);

  useEffect(() => {
    iniciarTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [iniciarTimer]);

  if (!produto) {
    return (
      <Layout title="Produto não encontrado">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <p className="text-gray-500 text-lg">Produto não encontrado.</p>
          <Link href="/produtos" className="btn-primary mt-6">
            Voltar ao catálogo
          </Link>
        </div>
      </Layout>
    );
  }

  const {
    nome, sku, categoria, descricao, descricaoCurta, preco,
    mostrarBotaoContacto = true,
    caracteristicas = [], inclui = [],
    perfeitoPara = [], parametrosTecnicos = [], dimensoes = [], crossells = [],
  } = produto;

  const temLinks = MARKETPLACES.some((m) => produto[m.chave]);
  const contactoHref = {
    pathname: "/contactos",
    query: {
      produto: nome,
      ...(sku ? { sku } : {}),
    },
  };

  return (
    <Layout title={nome} description={descricaoCurta || descricao?.substring(0, 160)}>

      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-brand-600">Início</Link>
            <span>/</span>
            <Link href="/produtos" className="hover:text-brand-600">Produtos</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium truncate">{nome}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <div>
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden aspect-square mb-3">
              {imagens.length > 0 ? (
                <Image
                  src={imagens[imagemAtiva]}
                  alt={nome}
                  fill
                  className="object-cover transition-opacity duration-500"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {imagens.length > 1 && (
                <>
                  <button
                    onClick={() => navegar(-1)}
                    aria-label="Imagem anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navegar(1)}
                    aria-label="Próxima imagem"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {imagens.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setImagemAtiva(i); iniciarTimer(); }}
                        className={`rounded-full transition-all duration-300 ${
                          i === imagemAtiva
                            ? "bg-white w-4 h-1.5"
                            : "bg-white/50 w-1.5 h-1.5"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {imagens.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {imagens.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setImagemAtiva(i); iniciarTimer(); }}
                    className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === imagemAtiva ? "border-brand-500" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt={`${nome} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {categoria && (
              <span className="inline-block bg-brand-100 dark:bg-brand-700/60 text-brand-700 dark:text-brand-100 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {categoria}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug mb-2">
              {nome}
            </h1>
            {sku && (
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Referência: {sku}</p>
            )}
            <div className="mb-6 space-y-3">
              {preco ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-[32px] font-extrabold text-brand-600 dark:text-brand-400">
                    {/\d/.test(preco) && !preco.includes("€") ? `${preco} €` : preco}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">IVA incluído</span>
                </div>
              ) : mostrarBotaoContacto ? (
                <div>
                  <Link href={contactoHref} className="btn-primary px-8 py-3.5 text-lg justify-center">
                    Pedir preço e encomendar
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ) : null}

              <div className="inline-flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                <svg className="w-4 h-4 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Preço B2B disponível -</span>
                <Link href={contactoHref} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                  contacte-nos
                </Link>
              </div>
            </div>
            {descricaoCurta && (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{descricaoCurta}</p>
            )}

            {temLinks && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Disponível em:</p>
                <div className="flex flex-wrap gap-3">
                  {MARKETPLACES.filter((m) => produto[m.chave]).map((m) => (
                    <a
                      key={m.chave}
                      href={produto[m.chave]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 ${m.cor} text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm`}
                    >
                      <span className="font-bold">{m.logo}</span>
                      Comprar na {m.nome}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {caracteristicas.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 mb-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Características principais</h2>
                <ul className="space-y-2">
                  {caracteristicas.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {inclui.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 rounded-xl p-5">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">O conjunto inclui</h2>
                <ul className="space-y-1.5">
                  {inclui.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2 mt-2">
              {perfeitoPara.length > 0 && (
                <Accordion titulo="Perfeito para">
                  <ul className="space-y-2 mt-3">
                    {perfeitoPara.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <svg className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Accordion>
              )}

              {parametrosTecnicos.length > 0 && (
                <Accordion titulo="Parâmetros Técnicos">
                  <dl className="mt-3 space-y-2">
                    {parametrosTecnicos.map((item, i) => {
                      const [chave, ...resto] = item.split(":");
                      const valor = resto.join(":").trim();
                      return valor ? (
                        <div key={i} className="flex gap-2 text-sm">
                          <dt className="font-medium text-gray-700 dark:text-gray-200 shrink-0">{chave.trim()}:</dt>
                          <dd className="text-gray-600 dark:text-gray-400">{valor}</dd>
                        </div>
                      ) : (
                        <div key={i} className="text-sm text-gray-600 dark:text-gray-400">{item}</div>
                      );
                    })}
                  </dl>
                </Accordion>
              )}

              {dimensoes.length > 0 && (
                <Accordion titulo="Dimensões">
                  <dl className="mt-3 space-y-2">
                    {dimensoes.map((item, i) => {
                      const matchUnidade = item.trim().match(/^([\d.,]+)\s*(kg|g|lbs?|cm|mm|m)$/i);
                      if (matchUnidade) {
                        const [, val, unidade] = matchUnidade;
                        const uLower = unidade.toLowerCase();
                        const label = /^(kg|g|lbs?)$/i.test(uLower) ? "Peso" : "Altura";
                        return (
                          <div key={i} className="flex gap-2 text-sm">
                            <dt className="font-medium text-gray-700 dark:text-gray-200 shrink-0 w-28">{label}:</dt>
                            <dd className="text-gray-600">{val} {unidade}</dd>
                          </div>
                        );
                      }
                      const matchTres = item.trim().match(/^([\d.,]+)\s*[×x]\s*([\d.,]+)\s*[×x]\s*([\d.,]+)\s*(.*)$/i);
                      if (matchTres) {
                        const [, l, a, p, unidade] = matchTres;
                        const u = unidade.trim();
                        const labels = ["Largura", "Altura", "Profundidade"];
                        return [l, a, p].map((val, j) => (
                          <div key={`${i}-${j}`} className="flex gap-2 text-sm">
                            <dt className="font-medium text-gray-700 dark:text-gray-200 shrink-0 w-28">{labels[j]}:</dt>
                            <dd className="text-gray-600">{val}{u ? ` ${u}` : ""}</dd>
                          </div>
                        ));
                      }
                      const [chave, ...resto] = item.split(":");
                      const valor = resto.join(":").trim();
                      return valor ? (
                        <div key={i} className="flex gap-2 text-sm">
                          <dt className="font-medium text-gray-700 dark:text-gray-200 shrink-0 w-28">{chave.trim()}:</dt>
                          <dd className="text-gray-600 dark:text-gray-400">{valor}</dd>
                        </div>
                      ) : (
                        <div key={i} className="text-sm text-gray-600 dark:text-gray-400">{item}</div>
                      );
                    })}
                  </dl>
                </Accordion>
              )}
            </div>
          </div>
        </div>

        {descricao && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Descrição completa</h2>
            <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {descricao}
            </div>
          </div>
        )}

        {(produtosRelacionados.length > 0 || crossellsNaoEncontrados.length > 0) && (() => {
          const totalSlots = 3;
          const reais = produtosRelacionados.slice(0, totalSlots);
          const placeholders = crossellsNaoEncontrados.slice(0, totalSlots - reais.length);
          return (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Produtos relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {reais.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
                {placeholders.map((entrada, i) => {
                  const match = entrada.match(/\(([^)]+)\)/);
                  const nome = match ? match[1] : entrada.split(/[\s(]/)[0];
                  return (
                    <div key={i} className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                      <div className="aspect-square bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <svg className="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-full">Em breve</span>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">SKU: {entrada.split(/[\s(]/)[0]}</p>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm leading-snug mb-1">{nome}</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Este produto será brevemente adicionado ao catálogo.</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const produtos = await getProdutos();
  return {
    paths: produtos.map((p) => ({ params: { id: p.id } })),
    fallback: "blocking",
  };
}

function serializarDoc(obj) {
  if (!obj) return null;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      v && typeof v === "object" && typeof v.toDate === "function"
        ? v.toDate().toISOString()
        : v,
    ])
  );
}

export async function getStaticProps({ params }) {
  const produto = await getProduto(params.id);
  if (!produto) return { notFound: true };

  let produtosRelacionados = [];
  let crossellsNaoEncontrados = [];

  if (produto.crossells?.length > 0) {
    const todosProdutos = await getProdutos();
    const skuMap = {};
    for (const p of todosProdutos) {
      if (p.sku) skuMap[p.sku.toUpperCase()] = p;
    }
    for (const entrada of produto.crossells) {
      const sku = entrada.split(/[\s(]/)[0].trim().toUpperCase();
      const found = skuMap[sku];
      if (found && found.id !== produto.id) {
        produtosRelacionados.push(serializarDoc(found));
      } else {
        crossellsNaoEncontrados.push(entrada);
      }
    }
  }

  return {
    props: {
      produto: serializarDoc(produto),
      produtosRelacionados,
      crossellsNaoEncontrados,
    },
    revalidate: 60,
  };
}
