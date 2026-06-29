// =======================================================
// HOMEPAGE
// =======================================================

import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import { getProdutos } from "../lib/produtos";

const BRAND_NAME = "[MARCA]";

export default function Home({ produtosDestaque }) {
  return (
    <Layout
      title="Início"
      description={`Catálogo oficial de produtos ${BRAND_NAME}. Encontra tudo o que precisas.`}
    >
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            {/* Substitui pelo slogan da tua empresa */}
            Qualidade que podes confiar
          </h1>
          <p className="text-brand-100 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            {/* Substitui pela descrição da empresa */}
            Descobre o nosso catálogo completo de produtos pensados para o teu conforto e estilo de vida.
          </p>
          <Link href="/produtos" className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors text-base">
            Ver catálogo completo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Destaques ── */}
      {produtosDestaque.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-brand-600 font-semibold text-sm mb-1 uppercase tracking-wider">Catálogo</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Produtos em destaque</h2>
            </div>
            <Link href="/produtos" className="text-brand-600 hover:text-brand-700 font-semibold text-sm hidden sm:flex items-center gap-1">
              Ver todos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosDestaque.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/produtos" className="btn-secondary">Ver todos os produtos</Link>
          </div>
        </section>
      )}

      {/* ── Porquê nós ── */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Porquê escolher-nos?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                titulo: "Qualidade garantida",
                desc: "Todos os produtos passam por rigorosos controlos de qualidade antes de chegar até si.",
              },
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                titulo: "Entrega rápida",
                desc: "Processamos os pedidos com rapidez para que receba os seus produtos o mais breve possível.",
              },
              {
                icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
                titulo: "Suporte dedicado",
                desc: "A nossa equipa está disponível para ajudar com qualquer questão sobre os nossos produtos.",
              },
            ].map((item) => (
              <div key={item.titulo} className="text-center">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

// Carrega os primeiros 8 produtos para a homepage (Server-Side Rendering)
export async function getServerSideProps() {
  try {
    const todos = await getProdutos();
    const produtosDestaque = todos.slice(0, 8).map((p) => ({
      ...p,
      criadoEm: p.criadoEm?.toMillis?.() ?? null,
      atualizadoEm: p.atualizadoEm?.toMillis?.() ?? null,
    }));
    return { props: { produtosDestaque } };
  } catch {
    return { props: { produtosDestaque: [] } };
  }
}
