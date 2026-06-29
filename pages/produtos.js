// =======================================================
// CATÁLOGO DE PRODUTOS
// =======================================================

import { useState, useMemo } from "react";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import { getProdutos, getCategorias } from "../lib/produtos";

export default function Produtos({ produtos, categorias }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [pesquisa, setPesquisa] = useState("");

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const matchCat =
        categoriaAtiva === "Todas" || p.categoria === categoriaAtiva;
      const matchPesquisa =
        pesquisa.trim() === "" ||
        p.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
        p.sku?.toLowerCase().includes(pesquisa.toLowerCase()) ||
        p.descricaoCurta?.toLowerCase().includes(pesquisa.toLowerCase());
      return matchCat && matchPesquisa;
    });
  }, [produtos, categoriaAtiva, pesquisa]);

  return (
    <Layout title="Produtos" description="Catálogo completo de produtos.">
      {/* Cabeçalho */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Catálogo de Produtos</h1>

          {/* Barra de pesquisa */}
          <div className="relative max-w-md">
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Pesquisar por nome ou SKU..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Filtros de categoria */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {["Todas", ...categorias].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoriaAtiva === cat
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grelha de produtos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {produtosFiltrados.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold text-lg">Nenhum produto encontrado</p>
            <p className="text-sm mt-1">Tenta outra pesquisa ou categoria.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {produtosFiltrados.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const [produtos, categorias] = await Promise.all([
      getProdutos(),
      getCategorias(),
    ]);

    const serializar = (p) => ({
      ...p,
      criadoEm: p.criadoEm?.toMillis?.() ?? null,
      atualizadoEm: p.atualizadoEm?.toMillis?.() ?? null,
    });

    return {
      props: {
        produtos: produtos.map(serializar),
        categorias,
      },
    };
  } catch {
    return { props: { produtos: [], categorias: [] } };
  }
}
