// =======================================================
// PAINEL DE ADMINISTRAÇÃO — dashboard principal
// Acesso via: /admin  (redireciona para login se não autenticado)
// =======================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import {
  getProdutos,
  criarProduto,
  atualizarProduto,
  removerProduto,
  uploadImagem,
} from "../../lib/produtos";
import Head from "next/head";

const BRAND_NAME = "[MARCA]";

// Campos de um produto — ajusta conforme necessário
const FORM_INICIAL = {
  nome: "",
  sku: "",
  categoria: "",
  descricaoCurta: "",
  descricao: "",
  caracteristicas: "",  // uma por linha
  inclui: "",           // um por linha
  crossells: "",        // um por linha
  linkWorten: "",
  linkFnac: "",
  linkAmazon: "",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado
  const [produtos, setProdutos] = useState([]);
  const [vista, setVista] = useState("lista"); // "lista" | "formulario"
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [imagensFicheiros, setImagensFicheiros] = useState([]);
  const [imagensExistentes, setImagensExistentes] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [confirmarRemover, setConfirmarRemover] = useState(null);

  // Autenticação
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/admin/login");
      } else {
        setUser(u);
        setLoading(false);
        carregarProdutos();
      }
    });
    return unsub;
  }, [router]);

  async function carregarProdutos() {
    try {
      const lista = await getProdutos();
      setProdutos(lista);
    } catch (e) {
      console.error(e);
    }
  }

  // Formulário
  function abrirNovoProduto() {
    setForm(FORM_INICIAL);
    setImagensFicheiros([]);
    setImagensExistentes([]);
    setEditId(null);
    setVista("formulario");
  }

  function abrirEditar(produto) {
    setForm({
      nome: produto.nome || "",
      sku: produto.sku || "",
      categoria: produto.categoria || "",
      descricaoCurta: produto.descricaoCurta || "",
      descricao: produto.descricao || "",
      caracteristicas: (produto.caracteristicas || []).join("\n"),
      inclui: (produto.inclui || []).join("\n"),
      crossells: (produto.crossells || []).join("\n"),
      linkWorten: produto.linkWorten || "",
      linkFnac: produto.linkFnac || "",
      linkAmazon: produto.linkAmazon || "",
    });
    setImagensExistentes(produto.imagens || []);
    setImagensFicheiros([]);
    setEditId(produto.id);
    setVista("formulario");
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFicheiros(e) {
    setImagensFicheiros(Array.from(e.target.files));
  }

  function removerImagemExistente(url) {
    setImagensExistentes((prev) => prev.filter((u) => u !== url));
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setGuardando(true);
    setMensagem(null);

    try {
      // Converte campos multi-linha em arrays
      const dados = {
        nome: form.nome.trim(),
        sku: form.sku.trim(),
        categoria: form.categoria.trim(),
        descricaoCurta: form.descricaoCurta.trim(),
        descricao: form.descricao.trim(),
        caracteristicas: form.caracteristicas.split("\n").map((s) => s.trim()).filter(Boolean),
        inclui: form.inclui.split("\n").map((s) => s.trim()).filter(Boolean),
        crossells: form.crossells.split("\n").map((s) => s.trim()).filter(Boolean),
        linkWorten: form.linkWorten.trim(),
        linkFnac: form.linkFnac.trim(),
        linkAmazon: form.linkAmazon.trim(),
      };

      let produtoId = editId;

      // Cria ou atualiza
      if (!editId) {
        const ref = await criarProduto({ ...dados, imagens: [] });
        produtoId = ref.id;
      } else {
        await atualizarProduto(editId, { ...dados, imagens: imagensExistentes });
      }

      // Upload de novas imagens
      let novasUrls = [];
      for (const f of imagensFicheiros) {
        const url = await uploadImagem(f, produtoId);
        novasUrls.push(url);
      }

      // Combina imagens existentes + novas
      if (novasUrls.length > 0) {
        const todasImagens = [...imagensExistentes, ...novasUrls];
        await atualizarProduto(produtoId, { imagens: todasImagens });
      }

      setMensagem({ tipo: "sucesso", texto: editId ? "Produto atualizado!" : "Produto criado!" });
      await carregarProdutos();
      setVista("lista");
    } catch (err) {
      console.error(err);
      setMensagem({ tipo: "erro", texto: "Erro ao guardar. Tenta de novo." });
    } finally {
      setGuardando(false);
    }
  }

  async function handleRemover(produto) {
    try {
      await removerProduto(produto.id, produto.imagens || []);
      setMensagem({ tipo: "sucesso", texto: "Produto removido." });
      await carregarProdutos();
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao remover." });
    }
    setConfirmarRemover(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">A carregar...</p>
      </div>
    );
  }

  return (
    <>
      <Head><title>Admin | {BRAND_NAME}</title></Head>
      <div className="min-h-screen bg-gray-50">

        {/* Barra superior admin */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-900">{BRAND_NAME}</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-brand-600 font-medium">Administração</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400 hidden sm:block">{user?.email}</span>
              <button
                onClick={() => signOut(auth)}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* Mensagem de feedback */}
          {mensagem && (
            <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
              mensagem.tipo === "sucesso"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {mensagem.texto}
            </div>
          )}

          {/* ── LISTA DE PRODUTOS ── */}
          {vista === "lista" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Produtos <span className="text-gray-400 font-normal text-lg">({produtos.length})</span>
                </h1>
                <button onClick={abrirNovoProduto} className="btn-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Novo produto
                </button>
              </div>

              {produtos.length === 0 ? (
                <div className="card p-12 text-center text-gray-400">
                  <p className="text-lg font-medium mb-2">Nenhum produto ainda</p>
                  <p className="text-sm">Clica em "Novo produto" para adicionar o primeiro.</p>
                </div>
              ) : (
                <div className="card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wider">
                        <th className="px-4 py-3">Produto</th>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Categoria</th>
                        <th className="px-4 py-3">Imagens</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {produtos.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {p.imagens?.[0] ? (
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                  <Image src={p.imagens[0]} alt={p.nome} fill className="object-cover" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-300">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <span className="font-medium text-gray-900 line-clamp-1">{p.nome}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{p.sku || "—"}</td>
                          <td className="px-4 py-3">
                            {p.categoria ? (
                              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{p.categoria}</span>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{p.imagens?.length || 0}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => abrirEditar(p)}
                                className="text-xs font-medium text-brand-600 hover:text-brand-700 px-3 py-1 rounded-lg hover:bg-brand-50 transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => setConfirmarRemover(p)}
                                className="text-xs font-medium text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                Remover
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── FORMULÁRIO PRODUTO ── */}
          {vista === "formulario" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setVista("lista")}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  ←
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {editId ? "Editar produto" : "Novo produto"}
                </h1>
              </div>

              <form onSubmit={handleGuardar} className="space-y-6">
                <div className="card p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="label">Nome do produto *</label>
                    <input name="nome" required value={form.nome} onChange={handleChange} className="input-field" placeholder="Ex: Climatizador portátil 3 em 1" />
                  </div>
                  <div>
                    <label className="label">SKU / Referência</label>
                    <input name="sku" value={form.sku} onChange={handleChange} className="input-field" placeholder="Ex: SKU540" />
                  </div>
                  <div>
                    <label className="label">Categoria</label>
                    <input name="categoria" value={form.categoria} onChange={handleChange} className="input-field" placeholder="Ex: Para o Ambiente" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Descrição curta</label>
                    <input name="descricaoCurta" value={form.descricaoCurta} onChange={handleChange} className="input-field" placeholder="1-2 frases resumo" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Descrição completa</label>
                    <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={6} className="input-field resize-none" placeholder="Descrição detalhada do produto..." />
                  </div>
                  <div>
                    <label className="label">Características principais <span className="text-gray-400 font-normal">(uma por linha)</span></label>
                    <textarea name="caracteristicas" value={form.caracteristicas} onChange={handleChange} rows={5} className="input-field resize-none" placeholder={"Potência: 1200W\nControlo remoto incluído\nTemperaturas: 16°C a 40°C"} />
                  </div>
                  <div>
                    <label className="label">O conjunto inclui <span className="text-gray-400 font-normal">(um por linha)</span></label>
                    <textarea name="inclui" value={form.inclui} onChange={handleChange} rows={5} className="input-field resize-none" placeholder={"1x Produto principal\n1x Controlo remoto\n1x Manual"} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Produtos relacionados / Crossells <span className="text-gray-400 font-normal">(um SKU por linha)</span></label>
                    <textarea name="crossells" value={form.crossells} onChange={handleChange} rows={3} className="input-field resize-none" placeholder={"SKU428\nSKU400"} />
                  </div>
                </div>

                {/* Links marketplace */}
                <div className="card p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Links de marketplace <span className="text-gray-400 font-normal text-sm">(opcional)</span></h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { name: "linkWorten", label: "Worten", placeholder: "https://www.worten.pt/..." },
                      { name: "linkFnac", label: "Fnac", placeholder: "https://www.fnac.pt/..." },
                      { name: "linkAmazon", label: "Amazon", placeholder: "https://www.amazon.es/..." },
                    ].map((m) => (
                      <div key={m.name}>
                        <label className="label">{m.label}</label>
                        <input name={m.name} type="url" value={form[m.name]} onChange={handleChange} className="input-field" placeholder={m.placeholder} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Imagens */}
                <div className="card p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Imagens</h2>

                  {/* Imagens já guardadas */}
                  {imagensExistentes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2">Imagens actuais (clica no × para remover)</p>
                      <div className="flex flex-wrap gap-3">
                        {imagensExistentes.map((url) => (
                          <div key={url} className="relative w-20 h-20 group">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                              <Image src={url} alt="Imagem produto" fill className="object-cover" />
                            </div>
                            <button
                              type="button"
                              onClick={() => removerImagemExistente(url)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload novas imagens */}
                  <label className="block border-2 border-dashed border-gray-200 hover:border-brand-400 rounded-xl p-6 text-center cursor-pointer transition-colors">
                    <input type="file" accept="image/*" multiple onChange={handleFicheiros} className="hidden" />
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {imagensFicheiros.length > 0 ? (
                      <p className="text-sm text-brand-600 font-medium">{imagensFicheiros.length} ficheiro(s) selecionado(s)</p>
                    ) : (
                      <p className="text-sm text-gray-400">Clica para selecionar imagens (PNG, JPG, WEBP)</p>
                    )}
                  </label>
                </div>

                {/* Botões */}
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={guardando} className="btn-primary">
                    {guardando ? "A guardar..." : editId ? "Guardar alterações" : "Criar produto"}
                  </button>
                  <button type="button" onClick={() => setVista("lista")} className="btn-secondary">
                    Cancelar
                  </button>
                </div>

                {mensagem && (
                  <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
                    mensagem.tipo === "sucesso"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {mensagem.texto}
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmação de remoção */}
      {confirmarRemover && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Remover produto?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Vais remover <strong>{confirmarRemover.nome}</strong>. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleRemover(confirmarRemover)} className="btn-danger flex-1 justify-center">
                Sim, remover
              </button>
              <button onClick={() => setConfirmarRemover(null)} className="btn-secondary flex-1 justify-center">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
