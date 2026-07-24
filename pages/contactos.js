import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

const CAMPOS_INICIAL = {
  primeiroNome: "",
  ultimoNome: "",
  telemovel: "",
  email: "",
  produto: "",
  mensagem: "",
};

export default function Contactos() {
  const router = useRouter();
  const [form, setForm] = useState(CAMPOS_INICIAL);
  const [erros, setErros] = useState({});
  const [estado, setEstado] = useState("idle"); 

  useEffect(() => {
    if (!router.isReady) return;

    const nomeProduto = Array.isArray(router.query.produto)
      ? router.query.produto[0]
      : router.query.produto;
    const sku = Array.isArray(router.query.sku)
      ? router.query.sku[0]
      : router.query.sku;

    if (!nomeProduto && !sku) return;

    const produtoSelecionado = [sku, nomeProduto].filter(Boolean).join(" - ");
    setForm((atual) => (
      atual.produto
        ? atual
        : { ...atual, produto: produtoSelecionado }
    ));
  }, [router.isReady, router.query.produto, router.query.sku]);

  function atualizar(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (erros[name]) setErros((er) => ({ ...er, [name]: "" }));
  }

  function validar() {
    const novosErros = {};
    if (!form.primeiroNome.trim()) novosErros.primeiroNome = "Campo obrigatório";
    if (!form.ultimoNome.trim()) novosErros.ultimoNome = "Campo obrigatório";
    if (!form.telemovel.trim()) novosErros.telemovel = "Campo obrigatório";
    else if (!/^[\d\s\+\-\(\)]{7,}$/.test(form.telemovel))
      novosErros.telemovel = "Número inválido";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      novosErros.email = "Email inválido";
    if (!form.produto.trim()) novosErros.produto = "Indica o produto ou SKU";
    return novosErros;
  }

  async function enviar(e) {
    e.preventDefault();
    const novosErros = validar();
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }
    setEstado("a-enviar");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setEstado("enviado");
        setForm(CAMPOS_INICIAL);
      } else {
        const data = await res.json();
        setEstado("erro");
        console.error(data.erro);
      }
    } catch {
      setEstado("erro");
    }
  }

  return (
    <Layout title="Contactos" description="Estamos disponíveis para te ajudar. Preenche o formulário e entraremos em contacto brevemente.">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Peça um Contacto</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">
            Interessado num produto? Preencha o formulário e entramos em contacto o mais rapidamente possível.
          </p>
        </div>

        {estado === "enviado" ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pedido enviado!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Recebemos o teu interesse. Alguém da nossa equipa irá contactar-te o mais rapidamente possível.
            </p>
            <button
              onClick={() => setEstado("idle")}
              className="btn-secondary text-sm"
            >
              Enviar outro pedido
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate className="card p-8 space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="primeiroNome">
                  Primeiro nome <span className="text-red-500">*</span>
                </label>
                <input
                  id="primeiroNome"
                  name="primeiroNome"
                  type="text"
                  value={form.primeiroNome}
                  onChange={atualizar}
                  placeholder="João"
                  className={`input-field ${erros.primeiroNome ? "border-red-400 focus:ring-red-400" : ""}`}
                />
                {erros.primeiroNome && <p className="text-red-500 text-xs mt-1">{erros.primeiroNome}</p>}
              </div>
              <div>
                <label className="label" htmlFor="ultimoNome">
                  Último nome <span className="text-red-500">*</span>
                </label>
                <input
                  id="ultimoNome"
                  name="ultimoNome"
                  type="text"
                  value={form.ultimoNome}
                  onChange={atualizar}
                  placeholder="Silva"
                  className={`input-field ${erros.ultimoNome ? "border-red-400 focus:ring-red-400" : ""}`}
                />
                {erros.ultimoNome && <p className="text-red-500 text-xs mt-1">{erros.ultimoNome}</p>}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="telemovel">
                Telemóvel <span className="text-red-500">*</span>
              </label>
              <input
                id="telemovel"
                name="telemovel"
                type="tel"
                value={form.telemovel}
                onChange={atualizar}
                placeholder="+351 912 345 678"
                className={`input-field ${erros.telemovel ? "border-red-400 focus:ring-red-400" : ""}`}
              />
              {erros.telemovel && <p className="text-red-500 text-xs mt-1">{erros.telemovel}</p>}
            </div>

            <div>
              <label className="label" htmlFor="email">
                Email <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={atualizar}
                placeholder="joao@exemplo.com"
                className={`input-field ${erros.email ? "border-red-400 focus:ring-red-400" : ""}`}
              />
              {erros.email && <p className="text-red-500 text-xs mt-1">{erros.email}</p>}
            </div>

            <div>
              <label className="label" htmlFor="produto">
                Produto ou SKU de interesse <span className="text-red-500">*</span>
              </label>
              <input
                id="produto"
                name="produto"
                type="text"
                value={form.produto}
                onChange={atualizar}
                placeholder="ex: Aspirador sem fios SKU583 ou nome do produto"
                className={`input-field ${erros.produto ? "border-red-400 focus:ring-red-400" : ""}`}
              />
              {erros.produto && <p className="text-red-500 text-xs mt-1">{erros.produto}</p>}
            </div>

            <div>
              <label className="label" htmlFor="mensagem">
                Mensagem adicional <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                id="mensagem"
                name="mensagem"
                rows={4}
                value={form.mensagem}
                onChange={atualizar}
                placeholder="Quantidade pretendida, dúvidas,preferência de hora de contacto ou qualquer outra informação..."
                className="input-field resize-none"
              />
            </div>

            {estado === "erro" && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm">
                Ocorreu um erro ao enviar. Por favor tenta novamente.
              </div>
            )}

            <button
              type="submit"
              disabled={estado === "a-enviar"}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {estado === "a-enviar" ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  A enviar...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar pedido
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Os campos marcados com <span className="text-red-500">*</span> são obrigatórios.
              Os teus dados são usados apenas para responder ao teu pedido.
            </p>
          </form>
        )}
      </div>
    </Layout>
  );
}
