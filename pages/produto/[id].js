// =======================================================
// PÁGINA DE DETALHE DO PRODUTO
// =======================================================

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "../../components/Layout";
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

export default function PaginaProduto({ produto }) {
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
    crossells = [],
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

        {/* ── Crossells ── */}
        {crossells.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Produtos relacionados</h2>
            <div className="flex gap-3 flex-wrap">
              {crossells.map((sku, i) => (
                <span key={i} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                  {sku}
                </span>
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

    return {
      props: {
        produto: {
          ...produto,
          criadoEm: produto.criadoEm?.toMillis?.() ?? null,
          atualizadoEm: produto.atualizadoEm?.toMillis?.() ?? null,
        },
      },
    };
  } catch {
    return { notFound: true };
  }
}
