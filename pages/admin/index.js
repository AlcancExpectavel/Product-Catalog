import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import {
  getProdutos,
  getCategorias,
  criarCategoria,
  criarProduto,
  atualizarProduto,
  removerProduto,
  uploadImagem,
} from "../../lib/produtos";
import Head from "next/head";

const BRAND_NAME = "Alcance Expectável";

const FORM_INICIAL = {
  nome: "",
  sku: "",
  categoria: "",
  descricaoCurta: "",
  descricao: "",
  caracteristicas: "",
  perfeitoPara: "",
  parametrosTecnicos: "",
  inclui: "",
  dimensoes: "",
  crossells: "",
  preco: "",
  mostrarBotaoContacto: true,
  linkWorten: "",
  linkFnac: "",
  linkPCComponentes: "",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [produtos, setProdutos] = useState([]);
  const [categoriasExistentes, setCategoriasExistentes] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState(false);
  const [vista, setVista] = useState("lista");
  const [pesquisaAdmin, setPesquisaAdmin] = useState("");
  const [ordenacao, setOrdenacao] = useState({ coluna: "nome", dir: "asc" });
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [imagensFicheiros, setImagensFicheiros] = useState([]);
  const [imagensExistentes, setImagensExistentes] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [confirmarRemover, setConfirmarRemover] = useState(null);
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const dragRef = useRef(null);
  const [dropTarget, setDropTarget] = useState(null); // { tipo, index }

  useEffect(() => {
    const urls = imagensFicheiros.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [imagensFicheiros]);

  useEffect(() => {
    if (mensagem?.texto !== "Produto atualizado!") return;

    const timer = setTimeout(() => setMensagem(null), 3000);
    return () => clearTimeout(timer);
  }, [mensagem]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/admin/login");
      } else {
        setUser(u);
        setLoading(false);
        carregarProdutos();
        getCategorias().then((cats) => {
          setCategoriasExistentes(cats);
          if (cats.length === 0) setNovaCategoria(true);
        }).catch(() => {});
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

  function abrirNovoProduto() {
    setForm(FORM_INICIAL);
    setImagensFicheiros([]);
    setImagensExistentes([]);
    setEditId(null);
    setNovaCategoria(categoriasExistentes.length === 0);
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
      perfeitoPara: (produto.perfeitoPara || []).join("\n"),
      parametrosTecnicos: (produto.parametrosTecnicos || []).join("\n"),
      inclui: (produto.inclui || []).join("\n"),
      dimensoes: (produto.dimensoes || []).join("\n"),
      crossells: (produto.crossells || []).join("\n"),
      preco: produto.preco || "",
      mostrarBotaoContacto: produto.preco?.trim()
        ? false
        : produto.mostrarBotaoContacto !== false,
      linkWorten: produto.linkWorten || "",
      linkFnac: produto.linkFnac || "",
      linkPCComponentes: produto.linkPCComponentes || "",
    });
    setImagensExistentes((produto.imagens || []).filter(Boolean));
    setImagensFicheiros([]);
    setEditId(produto.id);
    setNovaCategoria(false);
    setVista("formulario");
  }

  const SKU_REGEX = /\bSKU\d+\b/i;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
      return;
    }
    if (name === "preco") {
      setForm({
        ...form,
        preco: value,
        mostrarBotaoContacto: value.trim() === "",
      });
      return;
    }
    if (name === "sku") {
      setForm({ ...form, sku: value.replace(/[^A-Za-z0-9]/g, "") });
      return;
    }
    setForm({ ...form, [name]: value });
  }

  function handleFicheiros(e) {
    setImagensFicheiros(Array.from(e.target.files));
  }

  function removerImagemExistente(url) {
    setImagensExistentes((prev) => prev.filter((u) => u !== url));
  }

  function removerNovaImagem(index) {
    setImagensFicheiros((prev) => prev.filter((_, i) => i !== index));
  }

  function reordenar(tipo, from, to) {
    if (from === to) return;
    if (tipo === "existente") {
      setImagensExistentes((prev) => {
        const arr = [...prev];
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        return arr;
      });
    } else {
      setImagensFicheiros((prev) => {
        const arr = [...prev];
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        return arr;
      });
    }
  }

  async function handleGuardarCategoria() {
    const nome = form.categoria.trim();
    if (!nome) return;
    setGuardandoCategoria(true);
    try {
      await criarCategoria(nome);
      const cats = await getCategorias();
      setCategoriasExistentes(cats);
      setNovaCategoria(false);
      setMensagem({ tipo: "sucesso", texto: `Categoria "${nome}" guardada!` });
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao guardar categoria." });
    } finally {
      setGuardandoCategoria(false);
    }
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setGuardando(true);
    setMensagem(null);

    try {
      if (!editId && form.sku.trim()) {
        const skuNorm = form.sku.trim().toLowerCase();
        const duplicado = produtos.find((p) => p.sku?.trim().toLowerCase() === skuNorm);
        if (duplicado) {
          setMensagem({ tipo: "erro", texto: `O SKU "${form.sku.trim()}" já existe no produto "${duplicado.nome}".` });
          setGuardando(false);
          return;
        }
      }

      const toTitleCase = (str) =>
        str.trim().replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));

      const dados = {
        nome: toTitleCase(form.nome),
        sku: form.sku.trim(),
        categoria: form.categoria.trim(),
        descricaoCurta: form.descricaoCurta.trim(),
        descricao: form.descricao.trim(),
        caracteristicas: form.caracteristicas.split("\n").map((s) => s.trim()).filter(Boolean),
        perfeitoPara: form.perfeitoPara.split("\n").map((s) => s.trim()).filter(Boolean),
        parametrosTecnicos: form.parametrosTecnicos.split("\n").map((s) => s.trim()).filter(Boolean),
        inclui: form.inclui.split("\n").map((s) => s.trim()).filter(Boolean),
        dimensoes: form.dimensoes.split("\n").map((s) => s.trim()).filter(Boolean),
        crossells: form.crossells.split("\n").map((s) => s.trim()).filter(Boolean),
        preco: form.preco.trim(),
        mostrarBotaoContacto: form.mostrarBotaoContacto,
        linkWorten: form.linkWorten.trim(),
        linkFnac: form.linkFnac.trim(),
        linkPCComponentes: form.linkPCComponentes.trim(),
      };

      if (dados.categoria) await criarCategoria(dados.categoria);

      let produtoId = editId;

      if (!editId) {
        const ref = await criarProduto({ ...dados, imagens: [] });
        produtoId = ref.id;
      } else {
        await atualizarProduto(editId, { ...dados, imagens: imagensExistentes });
      }

      let novasUrls = [];
      for (const f of imagensFicheiros) {
        const url = await uploadImagem(f, produtoId);
        novasUrls.push(url);
      }

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 dark:text-gray-500">A carregar...</p>
      </div>
    );
  }

  return (
    <>
      <Head><title>Admin | {BRAND_NAME}</title></Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">

        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-bold text-gray-900 dark:text-gray-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{BRAND_NAME}</Link>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span className="text-sm text-brand-600 dark:text-brand-400 font-medium">Administração</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">{user?.email}</span>
              <button
                onClick={() => signOut(auth)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {mensagem && (
            <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
              mensagem.tipo === "sucesso"
                ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900"
                : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900"
            }`}>
              {mensagem.texto}
            </div>
          )}

          {vista === "lista" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Produtos <span className="text-gray-400 dark:text-gray-500 font-normal text-lg">({produtos.length})</span>
                </h1>
                <button onClick={abrirNovoProduto} className="btn-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Novo produto
                </button>
              </div>

              <div className="relative mb-4 max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={pesquisaAdmin}
                  onChange={(e) => setPesquisaAdmin(e.target.value)}
                  placeholder="Procurar produto, SKU ou categoria..."
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                {pesquisaAdmin && (
                  <button onClick={() => setPesquisaAdmin("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-300">×</button>
                )}
              </div>

              {produtos.length === 0 ? (
                <div className="card p-12 text-center text-gray-400">
                  <p className="text-lg font-medium mb-2">Nenhum produto ainda</p>
                  <p className="text-sm">Clica em "Novo produto" para adicionar o primeiro.</p>
                </div>
              ) : (() => {
                const q = pesquisaAdmin.toLowerCase();
                const filtrados = produtos.filter((p) =>
                  !q || p.nome?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.categoria?.toLowerCase().includes(q)
                );
                const ordenados = [...filtrados].sort((a, b) => {
                  if (ordenacao.coluna === "imagens") {
                    const va = a.imagens?.length || 0;
                    const vb = b.imagens?.length || 0;
                    return ordenacao.dir === "asc" ? va - vb : vb - va;
                  }
                  const va = (a[ordenacao.coluna] || "").toString().toLowerCase();
                  const vb = (b[ordenacao.coluna] || "").toString().toLowerCase();
                  return ordenacao.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
                });
                const toggleOrdem = (coluna) => setOrdenacao((o) => ({ coluna, dir: o.coluna === coluna && o.dir === "asc" ? "desc" : "asc" }));
                const Seta = ({ col }) => {
                  const ativa = ordenacao.coluna === col;
                  return (
                    <span className={`ml-1 inline-flex flex-col leading-none text-[10px] ${ativa ? "text-brand-600" : "text-gray-300"}`}>
                      <span className={ordenacao.dir === "asc" && ativa ? "text-brand-600" : ""}>▲</span>
                      <span className={ordenacao.dir === "desc" && ativa ? "text-brand-600" : ""}>▼</span>
                    </span>
                  );
                };
                return (
                  <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          <th className="px-4 py-3 cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300" onClick={() => toggleOrdem("nome")}>
                            Produto <Seta col="nome" />
                          </th>
                          <th className="px-4 py-3 text-center cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300" onClick={() => toggleOrdem("sku")}>
                            SKU <Seta col="sku" />
                          </th>
                          <th className="px-4 py-3 text-center cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300" onClick={() => toggleOrdem("categoria")}>
                            Categoria <Seta col="categoria" />
                          </th>
                          <th className="px-4 py-3 text-center cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300" onClick={() => toggleOrdem("imagens")}>
                            Imagens <Seta col="imagens" />
                          </th>
                          <th className="px-4 py-3 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {ordenados.length === 0 ? (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Nenhum resultado para "{pesquisaAdmin}"</td></tr>
                        ) : ordenados.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {p.imagens?.[0] ? (
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                                    <Image src={p.imagens[0]} alt={p.nome} fill sizes="40px" className="object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center text-gray-300 dark:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                <a href={`/produto/${p.id}`} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 dark:text-gray-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-1">{p.nome}</a>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">{p.sku || "-"}</td>
                            <td className="px-4 py-3 text-center">
                              {p.categoria ? (
                                <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">{p.categoria}</span>
                              ) : "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">{p.imagens?.length || 0}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => abrirEditar(p)}
                                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 px-3 py-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
                                >
                                  ✏️ Editar
                                </button>
                                <button
                                  onClick={() => setConfirmarRemover(p)}
                                  className="text-xs font-medium text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                >
                                  🗑️ Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </>
          )}

          {vista === "formulario" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setVista("lista")}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  ←
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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
                    {novaCategoria ? (
                      <div>
                        <div className="flex gap-2">
                          <input
                            name="categoria"
                            value={form.categoria}
                            onChange={handleChange}
                            className="input-field flex-1"
                            placeholder="Ex: Eletrónica, Jardim, Cozinha..."
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleGuardarCategoria}
                            disabled={!form.categoria.trim() || guardandoCategoria}
                            className="btn-primary px-3 py-2 text-xs whitespace-nowrap disabled:opacity-50"
                          >
                            {guardandoCategoria ? "..." : "✓ Guardar"}
                          </button>
                          {categoriasExistentes.length > 0 && (
                            <button
                              type="button"
                              onClick={() => { setNovaCategoria(false); setForm({ ...form, categoria: "" }); }}
                              className="btn-secondary px-3 py-2 text-xs whitespace-nowrap"
                            >
                              ← Voltar
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Clica em "✓ Guardar" para criar a categoria imediatamente no Firestore.</p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <select
                          name="categoria"
                          value={form.categoria}
                          onChange={handleChange}
                          className="input-field flex-1"
                        >
                          <option value="">- Selecionar categoria -</option>
                          {categoriasExistentes.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => { setNovaCategoria(true); setForm({ ...form, categoria: "" }); }}
                          className="btn-primary px-3 py-2 text-xs whitespace-nowrap"
                          title="Criar nova categoria"
                        >
                          + Nova
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="label">Preço</label>
                    <input name="preco" value={form.preco} onChange={handleChange} className="input-field" placeholder="Ex: 29,99 €" />
                  </div>
                  <div>
                    <span className="label">Ação junto ao preço</span>
                    <label className="min-h-[42px] flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 cursor-pointer bg-white dark:bg-gray-800 hover:border-brand-400 transition-colors">
                      <input
                        name="mostrarBotaoContacto"
                        type="checkbox"
                        checked={form.mostrarBotaoContacto}
                        onChange={handleChange}
                        disabled={Boolean(form.preco.trim())}
                        className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`text-sm font-medium ${
                        form.preco.trim()
                          ? "text-gray-400 dark:text-gray-500"
                          : "text-gray-700 dark:text-gray-200"
                      }`}>
                        Botão grande “Pedir preço e encomendar”
                      </span>
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Descrição curta</label>
                    <input name="descricaoCurta" value={form.descricaoCurta} onChange={handleChange} className={`input-field ${SKU_REGEX.test(form.descricaoCurta) ? "border-orange-400 focus:ring-orange-400" : ""}`} placeholder="1-2 frases resumo" />
                    {SKU_REGEX.test(form.descricaoCurta) && <p className="text-xs text-orange-500 mt-1">⚠️ A descrição parece conter um SKU - verifica se é intencional.</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Descrição completa</label>
                    <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={6} className={`input-field resize-none ${SKU_REGEX.test(form.descricao) ? "border-orange-400 focus:ring-orange-400" : ""}`} placeholder="Descrição detalhada do produto..." />
                    {SKU_REGEX.test(form.descricao) && <p className="text-xs text-orange-500 mt-1">⚠️ A descrição parece conter um SKU - verifica se é intencional.</p>}
                  </div>
                  <div>
                    <label className="label">Características principais <span className="text-gray-400 font-normal">(uma por linha)</span></label>
                    <textarea name="caracteristicas" value={form.caracteristicas} onChange={handleChange} rows={5} className="input-field resize-none" placeholder={"Potência: 1200W\nControlo remoto incluído\nTemperaturas: 16°C a 40°C"} />
                  </div>
                  <div>
                    <label className="label">O conjunto inclui <span className="text-gray-400 font-normal">(um por linha)</span></label>
                    <textarea name="inclui" value={form.inclui} onChange={handleChange} rows={5} className="input-field resize-none" placeholder={"1x Produto principal\n1x Controlo remoto\n1x Manual"} />
                  </div>
                  <div>
                    <label className="label">Perfeito para <span className="text-gray-400 font-normal">(um por linha - opcional)</span></label>
                    <textarea name="perfeitoPara" value={form.perfeitoPara} onChange={handleChange} rows={4} className="input-field resize-none" placeholder={"Salas de estar e quartos\nEscritórios\nPequenas lojas"} />
                  </div>
                  <div>
                    <label className="label">Parâmetros Técnicos <span className="text-gray-400 font-normal">(um por linha - opcional)</span></label>
                    <textarea name="parametrosTecnicos" value={form.parametrosTecnicos} onChange={handleChange} rows={4} className="input-field resize-none" placeholder={"Potência: 1200W\nTensão: 220V\nPeso: 1.6kg"} />
                  </div>
                  <div>
                    <label className="label">Dimensões <span className="text-gray-400 font-normal">(uma por linha - opcional)</span></label>
                    <textarea name="dimensoes" value={form.dimensoes} onChange={handleChange} rows={4} className="input-field resize-none" placeholder={"Largura: 28cm\nAltura: 32cm\nProfundidade: 20cm\nPeso: 1.6kg"} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Produtos relacionados / Crossells <span className="text-gray-400 font-normal">(um SKU por linha)</span></label>
                    <textarea name="crossells" value={form.crossells} onChange={handleChange} rows={3} className="input-field resize-none" placeholder={"SKU428\nSKU400"} />
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Links de marketplace <span className="text-gray-400 dark:text-gray-500 font-normal text-sm">(opcional)</span></h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { name: "linkWorten", label: "Worten", placeholder: "https://www.worten.pt/...", labelClass: "text-red-600" },
                      { name: "linkFnac", label: "Fnac", placeholder: "https://www.fnac.pt/...", labelClass: "text-yellow-500" },
                      { name: "linkPCComponentes", label: "PCComponentes", placeholder: "https://www.pccomponentes.pt/...", labelClass: "text-orange-500" },
                    ].map((m) => (
                      <div key={m.name}>
                        <label className={`label ${m.labelClass || ""}`}>{m.label}</label>
                        <input name={m.name} type="url" value={form[m.name]} onChange={handleChange} className="input-field" placeholder={m.placeholder} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Imagens</h2>
                  <p className="text-xs text-gray-400 mb-4">Arrasta as imagens para mudar a ordem. A primeira imagem é a principal. (Recomendado fazer depois de criar produto.)</p>

                  {imagensExistentes.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Imagens guardadas</p>
                      <div
                        className="flex flex-wrap items-center gap-3"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (dragRef.current?.tipo === "existente" && dropTarget) {
                            const from = dragRef.current.index;
                            let to = dropTarget.index;
                            if (to > from) to -= 1;
                            reordenar("existente", from, to);
                          }
                          dragRef.current = null;
                          setDropTarget(null);
                        }}
                      >
                        {imagensExistentes.map((url, i) => (
                          <div key={`${url}-${i}`} className="flex items-center">
                            {dropTarget?.tipo === "existente" && dropTarget?.index === i && (
                              <div className="w-1 h-20 bg-brand-500 rounded-full mr-3 shrink-0 pointer-events-none" />
                            )}
                            <div
                              draggable
                              onDragStart={() => { dragRef.current = { tipo: "existente", index: i }; }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                const rect = e.currentTarget.getBoundingClientRect();
                                const insertIndex = e.clientX < rect.left + rect.width / 2 ? i : i + 1;
                                setDropTarget({ tipo: "existente", index: insertIndex });
                              }}
                              onDragEnd={() => { dragRef.current = null; setDropTarget(null); }}
                              className="relative w-20 h-20 group cursor-grab active:cursor-grabbing rounded-lg ring-2 ring-transparent hover:ring-brand-400 transition-all"
                            >
                              {i === 0 && (
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10 whitespace-nowrap">
                                  Principal
                                </span>
                              )}
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <Image src={url} alt={`Imagem ${i + 1}`} fill sizes="80px" className="object-cover" />
                              </div>
                              <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <svg className="w-4 h-4 text-white drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M7 2a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zM7 8a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zM7 14a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4z" />
                                </svg>
                              </div>
                              <button
                                type="button"
                                onClick={() => removerImagemExistente(url)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                        {dropTarget?.tipo === "existente" && dropTarget?.index === imagensExistentes.length && (
                          <div className="w-1 h-20 bg-brand-500 rounded-full shrink-0 pointer-events-none" />
                        )}
                      </div>
                    </div>
                  )}

                  {imagensFicheiros.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Novas imagens (ainda não guardadas)</p>
                      <div
                        className="flex flex-wrap items-center gap-3"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (dragRef.current?.tipo === "nova" && dropTarget) {
                            const from = dragRef.current.index;
                            let to = dropTarget.index;
                            if (to > from) to -= 1;
                            reordenar("nova", from, to);
                          }
                          dragRef.current = null;
                          setDropTarget(null);
                        }}
                      >
                        {imagensFicheiros.map((f, i) => (
                          <div key={i} className="flex items-center">
                            {dropTarget?.tipo === "nova" && dropTarget?.index === i && (
                              <div className="w-1 h-20 bg-brand-500 rounded-full mr-3 shrink-0 pointer-events-none" />
                            )}
                            <div
                              draggable
                              onDragStart={() => { dragRef.current = { tipo: "nova", index: i }; }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                const rect = e.currentTarget.getBoundingClientRect();
                                const insertIndex = e.clientX < rect.left + rect.width / 2 ? i : i + 1;
                                setDropTarget({ tipo: "nova", index: insertIndex });
                              }}
                              onDragEnd={() => { dragRef.current = null; setDropTarget(null); }}
                              className="relative w-20 h-20 group cursor-grab active:cursor-grabbing rounded-lg ring-2 ring-transparent hover:ring-brand-400 transition-all"
                            >
                              {previewUrls[i] && (
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                  <img src={previewUrls[i]} alt={f.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <svg className="w-4 h-4 text-white drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M7 2a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zM7 8a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zM7 14a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4z" />
                                </svg>
                              </div>
                              <button
                                type="button"
                                onClick={() => removerNovaImagem(i)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                        {dropTarget?.tipo === "nova" && dropTarget?.index === imagensFicheiros.length && (
                          <div className="w-1 h-20 bg-brand-500 rounded-full shrink-0 pointer-events-none" />
                        )}
                      </div>
                    </div>
                  )}

                  <label className="block border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 rounded-xl p-6 text-center cursor-pointer transition-colors">
                    <input type="file" accept="image/*" multiple onChange={handleFicheiros} className="hidden" />
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-400">Clica para adicionar imagens (PNG, JPG, WEBP)</p>
                  </label>
                </div>

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
                      ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900"
                      : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900"
                  }`}>
                    {mensagem.texto}
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>

      {confirmarRemover && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">Remover produto?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
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
