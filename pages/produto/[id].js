// =======================================================
// PÁGINA DE DETALHE DO PRODUTO
// =======================================================

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "../../components/Layout";
import ProductCard from "../../components/ProductCard";
import { getProduto, getProdutos } from "../../lib/produtos";

// Ícones de marketplace — adiciona/remove conforme necessário
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
    chave: "linkAmazon",
    nome: "Amazon",
    cor: "bg-orange-500 hover:bg-orange-600",
    logo: "A",
  },
];

function Accordion({ titulo, children }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{titulo}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0 ${aberto ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {aberto && (
        <div className="px-5 pb-5 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

export default function PaginaProduto({ produto, produtosRelacionados = [], crossellsNaoEncontrados = [] }) {
  const [imagemAtiva, setImagemAtiva] = useState(0);

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
    nome, sku, categoria, descricao, descricaoCurta,
    imagens = [], caracteristicas = [], inclui = [],
    perfeitoPara = [], parametrosTecnicos = [], dimensoes = [], crossells = [],
  } = produto;

  const temLinks = MARKETPLACES.some((m) => produto[m.chave]);

  return (
    <Layout title={nome} description={descricaoCurta || descricao?.substring(0, 160)}>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-brand-600">Início</Link>
            <span>/</span>
            <Link href="/produtos" className="hover:text-brand-600">Produtos</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{nome}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Galeria de imagens ── */}
          <div>
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square mb-3">
              {imagens.length > 0 ? (
                <Image
                  src={imagens[imagemAtiva]}
                  alt={nome}
                  fill
                  className="object-cover"
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
            </div>

            {/* Miniaturas */}
            {imagens.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {imagens.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImagemAtiva(i)}
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

          {/* ── Info ── */}
          <div>
            {categoria && (
              <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {categoria}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug mb-2">
              {nome}
            </h1>
            {sku && (
              <p className="text-sm text-gray-400 mb-4">Referência: {sku}</p>
            )}
            {descricaoCurta && (
              <p className="text-gray-600 leading-relaxed mb-6">{descricaoCurta}</p>
            )}

            {/* Links de marketplace */}
            {temLinks && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Disponível em:</p>
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

            {/* Características principais */}
            {caracteristicas.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <h2 className="font-semibold text-gray-900 mb-3">Características principais</h2>
                <ul className="space-y-2">
                  {caracteristicas.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* O conjunto inclui */}
            {inclui.length > 0 && (
              <div className="border border-gray-200 rounded-xl p-5">
                <h2 className="font-semibold text-gray-900 mb-3">O conjunto inclui</h2>
                <ul className="space-y-1.5">
                  {inclui.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Accordions */}
            <div className="space-y-2 mt-2">
              {perfeitoPara.length > 0 && (
                <Accordion titulo="Perfeito para">
                  <ul className="space-y-2 mt-3">
                    {perfeitoPara.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
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
                          <dt className="font-medium text-gray-700 shrink-0">{chave.trim()}:</dt>
                          <dd className="text-gray-600">{valor}</dd>
                        </div>
                      ) : (
                        <div key={i} className="text-sm text-gray-600">{item}</div>
                      );
                    })}
                  </dl>
                </Accordion>
              )}

              {dimensoes.length > 0 && (
                <Accordion titulo="Dimensões">
                  <dl className="mt-3 space-y-2">
                    {dimensoes.map((item, i) => {
                      // Tenta detectar formato "N unidade" com unidade reconhecida (ex: "2 kg", "55 cm")
                      const matchUnidade = item.trim().match(/^([\d.,]+)\s*(kg|g|lbs?|cm|mm|m)$/i);
                      if (matchUnidade) {
                        const [, val, unidade] = matchUnidade;
                        const uLower = unidade.toLowerCase();
                        const label = /^(kg|g|lbs?)$/i.test(uLower) ? "Peso" : "Altura";
                        return (
                          <div key={i} className="flex gap-2 text-sm">
                            <dt className="font-medium text-gray-700 shrink-0 w-28">{label}:</dt>
                            <dd className="text-gray-600">{val} {unidade}</dd>
                          </div>
                        );
                      }
                      // Tenta detectar formato "N × N × N [unidade]" ou "N x N x N [unidade]"
                      const matchTres = item.trim().match(/^([\d.,]+)\s*[×x]\s*([\d.,]+)\s*[×x]\s*([\d.,]+)\s*(.*)$/i);
                      if (matchTres) {
                        const [, l, a, p, unidade] = matchTres;
                        const u = unidade.trim();
                        const labels = ["Largura", "Altura", "Profundidade"];
                        return [l, a, p].map((val, j) => (
                          <div key={`${i}-${j}`} className="flex gap-2 text-sm">
                            <dt className="font-medium text-gray-700 shrink-0 w-28">{labels[j]}:</dt>
                            <dd className="text-gray-600">{val}{u ? ` ${u}` : ""}</dd>
                          </div>
                        ));
                      }
                      // Tenta formato "Chave: Valor"
                      const [chave, ...resto] = item.split(":");
                      const valor = resto.join(":").trim();
                      return valor ? (
                        <div key={i} className="flex gap-2 text-sm">
                          <dt className="font-medium text-gray-700 shrink-0 w-28">{chave.trim()}:</dt>
                          <dd className="text-gray-600">{valor}</dd>
                        </div>
                      ) : (
                        <div key={i} className="text-sm text-gray-600">{item}</div>
                      );
                    })}
                  </dl>
                </Accordion>
              )}
            </div>
          </div>
        </div>

        {/* ── Descrição completa ── */}
        {descricao && (
          <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Descrição completa</h2>
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
              {descricao}
            </div>
          </div>
        )}

        {/* ── Produtos relacionados ── */}
        {(produtosRelacionados.length > 0 || crossellsNaoEncontrados.length > 0) && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Produtos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {produtosRelacionados.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
              {crossellsNaoEncontrados.map((sku) => (
                <div key={sku} className="card p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[160px]">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Ref: {sku}</p>
                    <p className="text-sm text-gray-500">Em breve no catálogo</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <Link href="/produtos" className="btn-secondary">
            ← Voltar ao catálogo
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const produto = await getProduto(params.id);
    if (!produto) return { notFound: true };

    const serializar = (p) => ({
      ...p,
      criadoEm: p.criadoEm?.toMillis?.() ?? null,
      atualizadoEm: p.atualizadoEm?.toMillis?.() ?? null,
    });

    // Procura os produtos relacionados pelo SKU
    // Se existirem no catálogo → card clicável; se não → mostra o SKU como badge
    let produtosRelacionados = [];
    let crossellsNaoEncontrados = [];
    if (produto.crossells?.length > 0) {
      const todos = await getProdutos();
      // Extrai só o SKU (antes de qualquer espaço ou parêntese)
      const extrairSku = (s) => s.trim().split(/[\s(]/)[0].toLowerCase();
      const crossellsNorm = produto.crossells.map(extrairSku);
      const encontrados = todos.filter((p) => p.sku && crossellsNorm.includes(p.sku.trim().toLowerCase()) && p.id !== params.id);
      produtosRelacionados = encontrados.slice(0, 3).map(serializar);
      const skusEncontrados = encontrados.map((p) => p.sku.trim().toLowerCase());
      crossellsNaoEncontrados = produto.crossells.filter((s) => !skusEncontrados.includes(extrairSku(s))).slice(0, 3 - produtosRelacionados.length);
    }

    return {
      props: {
        produto: serializar(produto),
        produtosRelacionados,
        crossellsNaoEncontrados,
      },
    };
  } catch {
    return { notFound: true };
  }
}
