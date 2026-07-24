import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

const statusMap = {
  open:      { label: "Em Aberto",        bg: "bg-blue-100 dark:bg-blue-900/40",  color: "text-blue-800 dark:text-blue-300",  icon: "●" },
  pending:   { label: "Em Processamento", bg: "bg-amber-100 dark:bg-amber-900/40", color: "text-amber-800 dark:text-amber-300", icon: "⟳" },
  waiting:   { label: "A Aguardar",       bg: "bg-gray-100 dark:bg-gray-800",  color: "text-gray-600 dark:text-gray-400",  icon: "◷" },
  closed:    { label: "Concluído",        bg: "bg-green-100 dark:bg-green-900/40", color: "text-green-800 dark:text-green-300", icon: "✓" },
  cancelled: { label: "Cancelado",        bg: "bg-red-100 dark:bg-red-900/40",   color: "text-red-800 dark:text-red-300",   icon: "✕" },
};

const typeConfig = {
  exchange:     { label: "Troca de Produto", icon: "⇄",  colorClass: "text-amber-600",   bgClass: "bg-amber-50 dark:bg-amber-900/30" },
  refund:       { label: "Reembolso",        icon: "↩",  colorClass: "text-emerald-600", bgClass: "bg-emerald-50 dark:bg-emerald-900/30" },
  recolha:      { label: "Recolha",          icon: "↑",  colorClass: "text-indigo-600",  bgClass: "bg-indigo-50 dark:bg-indigo-900/30" },
  warehouse:    { label: "Warehouse",        icon: "🏭", colorClass: "text-sky-600",     bgClass: "bg-sky-50 dark:bg-sky-900/30" },
  "non-client": { label: "Consulta",         icon: "?",  colorClass: "text-purple-600",  bgClass: "bg-purple-50 dark:bg-purple-900/30" },
  oferta:       { label: "Oferta",           icon: "🎁", colorClass: "text-green-600",   bgClass: "bg-green-50 dark:bg-green-900/30" },
  recusado:     { label: "Recusado",         icon: "✕",  colorClass: "text-red-600",     bgClass: "bg-red-50 dark:bg-red-900/30" },
};

function fmt(str) {
  if (!str) return "-";
  if (str.includes("-")) {
    const [y, m, d] = str.split("-");
    return `${d}/${m}/${y}`;
  }
  return str;
}

function getTrackingUrl(tracking) {
  if (!tracking) return null;
  const t = tracking.trim().toUpperCase();
  if (t.startsWith("DDPT") || t.startsWith("CT") || t.startsWith("RR") || t.startsWith("CP")) {
    return `https://www.ctt.pt/feapl_2/app/open/objectSearch/objectSearch.jspx?request_locale=pt&objectCodeList=${tracking}`;
  }
  if (/^\d{4}\//.test(tracking.trim())) {
    const parts = tracking.trim().split("/");
    return `https://www.nacex.com/seguimientoDetalle.do?agencia_origen=${parts[0]}&numero_albaran=${parts[1] || ""}&estado=1&internacional=0&externo=N&usr=null&pas=null`;
  }
  return `https://s.correosexpress.com/SeguimientoSinCP/search-pt?tracking-number=${tracking}`;
}

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDaYdB_tk17Wg1OZmT0vhSBti-HW1QTwbA",
  authDomain: "sistema-fichas-tiempo-real.firebaseapp.com",
  projectId: "sistema-fichas-tiempo-real",
};

export default function Seguimento() {
  const router = useRouter();
  const [inputVal, setInputVal] = useState("");
  const [postalVal, setPostalVal] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | result | error | notfound | multiple | wrongverif
  const [ticketData, setTicketData] = useState(null);
  const [multipleTickets, setMultipleTickets] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [notFoundId, setNotFoundId] = useState("");
  const [firebaseReady, setFirebaseReady] = useState(false);
  const lastTicketsRef = useRef([]);
  const lastInputRef = useRef("");
  const resultsRef = useRef(null);

  const initFirebase = () => {
    if (typeof window === "undefined" || !window.firebase) return;
    try {
      if (!window.firebase.apps?.find(a => a.name === "seguimento-app")) {
        window._seguimentoApp = window.firebase.initializeApp(FIREBASE_CONFIG, "seguimento-app");
      } else {
        window._seguimentoApp = window.firebase.apps.find(a => a.name === "seguimento-app");
      }
      setFirebaseReady(true);
    } catch {
      window._seguimentoApp = window.firebase.apps.find(a => a.name === "seguimento-app") || window.firebase.apps[0];
      setFirebaseReady(true);
    }
  };

  useEffect(() => {
    if (router.isReady && router.query.id) {
      setInputVal(router.query.id);
    }
  }, [router.isReady, router.query.id]);

  useEffect(() => {
    if (firebaseReady && router.query.id) {
      doSearch(router.query.id);
    }
  }, [firebaseReady, router.query.id]);

  useEffect(() => {
    if (state !== "idle" && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state]);

  function normalizePostal(p) {
    return p.replace(/[\s\-]/g, "").toUpperCase();
  }

  function verifyPostal(ticket, postal) {
    const stored = ticket.codPostal;
    if (!stored) return true;
    return normalizePostal(String(stored)) === normalizePostal(postal);
  }

  async function doSearch(id, postal) {
    const input = (id || inputVal).trim();
    const cp = (postal !== undefined ? postal : postalVal).trim();
    if (!input) return;
    if (input.length < 8) {
      setErrorMsg("O ID deve ter pelo menos 8 caracteres.");
      setState("error");
      return;
    }
    if (!cp) {
      setErrorMsg("Introduza o código postal para verificar a sua identidade.");
      setState("error");
      return;
    }
    setState("loading");
    try {
      const app = window._seguimentoApp || window.firebase.apps[0];
      const functions = window.firebase.functions(app);
      const fn = functions.httpsCallable("getTicketByPublicIdSecure");
      const result = await fn({ ticketId: input, codPostal: cp });

      if (!result.data.found) {
        setState("wrongverif");
        return;
      }

      const tickets = result.data.multiple ? result.data.tickets : [result.data.ticket];
      const verified = tickets.filter(t => verifyPostal(t, cp));

      if (verified.length === 0) {
        setState("wrongverif");
        return;
      }

      if (verified.length > 1) {
        lastTicketsRef.current = verified;
        lastInputRef.current = input;
        setMultipleTickets(verified);
        setState("multiple");
      } else {
        setTicketData(verified[0]);
        setState("result");
      }
    } catch (err) {
      setErrorMsg(err.message || "Erro desconhecido");
      setState("error");
    }
  }

  function handleSearch(e) {
    if (e) e.preventDefault();
    doSearch(inputVal, postalVal);
  }

  function showTicket(ticket) {
    setTicketData(ticket);
    setState("result");
  }

  function showMultiple() {
    setMultipleTickets(lastTicketsRef.current);
    setState("multiple");
  }

  const tc = ticketData ? (typeConfig[ticketData.type] || typeConfig["non-client"]) : null;
  const sc = ticketData ? (statusMap[ticketData.status] || statusMap.open) : null;

  return (
    <>
      <Head>
        <title>Seguimento de Pedidos - Alcance Expectável</title>
      </Head>

      <Script
        src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
        strategy="afterInteractive"
        onLoad={() => {
          const s = document.createElement("script");
          s.src = "https://www.gstatic.com/firebasejs/9.22.0/firebase-functions-compat.js";
          s.onload = initFirebase;
          document.head.appendChild(s);
        }}
      />

      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-16 px-4">
            <div className="max-w-2xl mx-auto text-center">

              <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 mb-5">
                <span>📍</span> Portal de Acompanhamento
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                Onde está o seu<br />
                <span className="text-indigo-600 dark:text-indigo-400">pedido?</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                Acompanhe em tempo real o estado do seu pedido, envio ou reembolso. Sem necessidade de conta ou login.
              </p>

              <form onSubmit={handleSearch} className="max-w-xl mx-auto space-y-2">
                <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-2xl p-2 border border-gray-200 dark:border-gray-700 shadow-lg shadow-indigo-100/50 dark:shadow-none">
                  <span className="flex items-center pl-2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    placeholder="ID do pedido (ex: 19318693 1)"
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm font-medium py-2"
                    autoComplete="off"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-2xl p-2 border border-gray-200 dark:border-gray-700 shadow-lg shadow-indigo-100/50 dark:shadow-none flex-1">
                    <span className="flex items-center pl-2 text-gray-400">📮</span>
                    <input
                      type="text"
                      value={postalVal}
                      onChange={e => setPostalVal(e.target.value)}
                      placeholder="Código postal (ex: 1000-001)"
                      className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm font-medium py-2"
                      autoComplete="postal-code"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    → Pesquisar
                  </button>
                </div>
              </form>
              <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                🔒 O ID encontra-se na invoice que recebeu. O código postal é usado para verificar a sua identidade.
              </p>

              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {["🚚 Estado do envio", "↩️ Reembolsos", "📦 Trocas", "🕐 Histórico", "🔒 Sem login"].map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div ref={resultsRef} className="max-w-2xl mx-auto px-4 py-10">

            {state === "loading" && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-16 text-center">
                <div className="w-12 h-12 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: "3px", borderStyle: "solid" }} />
                <p className="text-gray-500 dark:text-gray-400 font-medium">A pesquisar o seu pedido...</p>
              </div>
            )}

            {state === "notfound" && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-16 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🔍</div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Pedido não encontrado</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                  Não encontrámos nenhum pedido com o ID <strong>{notFoundId}</strong>. Verifique se o ID está correcto e tente novamente.
                </p>
              </div>
            )}

            {state === "wrongverif" && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-16 text-center">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Dados incorrectos</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                  Não foi possível encontrar um pedido com essa combinação de ID e código postal.<br />
                  Verifique os dados e tente novamente.
                </p>
              </div>
            )}

            {state === "error" && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-16 text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-950 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Erro ao pesquisar</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{errorMsg || "Ocorreu um erro inesperado. Por favor tente novamente."}</p>
              </div>
            )}

            {state === "multiple" && (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-l-4 border-indigo-200 dark:border-indigo-800 border-l-indigo-500 p-4 mb-4 flex items-start gap-3">
                  <span className="text-indigo-500 mt-0.5 flex-shrink-0">⊞</span>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                      {multipleTickets.length} pedidos encontrados com o ID{" "}
                      <span className="font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">{lastInputRef.current}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Clique num pedido para ver os detalhes completos.</div>
                  </div>
                </div>
                {multipleTickets.map((ticket, idx) => {
                  const tcc = typeConfig[ticket.type] || typeConfig["non-client"];
                  const scc = statusMap[ticket.status] || statusMap.open;
                  return (
                    <button
                      key={idx}
                      onClick={() => showTicket(ticket)}
                      className="w-full text-left bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-3 hover:shadow-lg hover:shadow-indigo-100/50 hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${tcc.bgClass} flex items-center justify-center text-lg flex-shrink-0`}>
                            {tcc.icon}
                          </div>
                          <div>
                            <div className="font-black text-gray-900 dark:text-white font-mono">{ticket.id}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">👤 {ticket.nome || "-"}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 ${scc.bg} ${scc.color} text-xs font-bold px-3 py-1 rounded-full`}>
                            {scc.icon} {scc.label}
                          </span>
                          <div className={`mt-1.5 inline-flex items-center gap-1 ${tcc.bgClass} ${tcc.colorClass} text-xs font-bold px-3 py-1 rounded-full`}>
                            {tcc.icon} {tcc.label}
                          </div>
                        </div>
                      </div>
                      <div className="px-5 py-3 flex gap-4 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                        <span>📅 {fmt(ticket.data)}</span>
                        {ticket.tracking && <span className="font-mono text-indigo-600 dark:text-indigo-400">▦ {ticket.tracking}</span>}
                        <span>🌍 {ticket.pais || "-"}</span>
                      </div>
                      <div className="px-5 pb-3 flex justify-end">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Ver detalhes →</span>
                      </div>
                    </button>
                  );
                })}
                <ContactCard />
              </>
            )}

            {state === "result" && ticketData && (
              <TicketResult
                ticket={ticketData}
                tc={tc}
                sc={sc}
                hasMultiple={lastTicketsRef.current.length > 1}
                onBack={showMultiple}
              />
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

function ContactCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center mt-4">
      <div className="text-lg font-black text-gray-900 dark:text-white mb-1.5">
        🎧 Precisa de ajuda?
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
        A nossa equipa está disponível para o ajudar com qualquer questão sobre o seu pedido.
      </p>
      <Link
        href="/contactos"
        className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
      >
        ✉️ Ir para Contactos
      </Link>
    </div>
  );
}

function TicketResult({ ticket, tc, sc, hasMultiple, onBack }) {
  const timeline = buildTimeline(ticket);
  const statusBox = buildStatusBox(ticket);

  const infoItems = [];
  infoItems.push({ icon: "🏷️", label: "Tipo de Pedido", value: tc.label });
  infoItems.push({ icon: "📅", label: "Data de Criação", value: fmt(ticket.data) });
  infoItems.push({ icon: "🌍", label: "País", value: ticket.pais || "-" });

  if (ticket.type !== "refund") {
    let carrier = ticket.transportadora || "";
    if (!carrier && ticket.tracking) {
      const tr = ticket.tracking.trim().toUpperCase();
      if (tr.startsWith("DDPT") || tr.startsWith("CT") || tr.startsWith("RR") || tr.startsWith("CP")) carrier = "CTT";
      else if (/^\d{4}\//.test(tr)) carrier = "NACEX";
      else carrier = "CORREOS Express";
    }
    infoItems.push({ icon: "🚚", label: "Transportadora", value: carrier || "-" });
  }

  if (ticket.dataEnvio) infoItems.push({ icon: "📤", label: "Data de Envio", value: fmt(ticket.dataEnvio) });
  if (ticket.dataRecolha) infoItems.push({ icon: "📆", label: "Data de Recolha", value: fmt(ticket.dataRecolha) });
  if (ticket.dataChegada) infoItems.push({ icon: "🏭", label: "Chegada ao Armazém", value: fmt(ticket.dataChegada) });
  if (ticket.valorPago) infoItems.push({ icon: "💶", label: "Valor", value: `€${parseFloat(ticket.valorPago).toFixed(2)}` });

  if (ticket.type === "refund") {
    let payDate = ticket.dataPagamento || "";
    if (ticket.refundHistory?.length > 0) {
      const comps = ticket.refundHistory
        .filter(h => h.status === "Completado" || h.status === "completado")
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      if (comps.length > 0) payDate = new Date(comps[0].date).toISOString().split("T")[0];
    }
    if (payDate) infoItems.push({ icon: "🧾", label: "Data de Pagamento", value: fmt(payDate) });
  } else if (ticket.dataPagamento) {
    infoItems.push({ icon: "🧾", label: "Data de Pagamento", value: fmt(ticket.dataPagamento) });
  }

  return (
    <>
      {hasMultiple && (
        <div className="mb-4">
          <button
            onClick={onBack}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
          >
            ← Ver todos os pedidos
          </button>
        </div>
      )}

      {ticket.totalRelated > 1 && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 border-l-4 border-l-amber-500 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <span className="text-amber-500 flex-shrink-0">⊞</span>
          <div>
            <div className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">
              Encontrámos {ticket.totalRelated} pedidos com este ID
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-400">A mostrar o pedido mais recente: <strong>{ticket.id}</strong></div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-4">

        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${tc.bgClass} flex items-center justify-center text-2xl flex-shrink-0`}>
              {tc.icon}
            </div>
            <div>
              <div className="text-lg font-black text-gray-900 dark:text-white font-mono">{ticket.id}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                👤 {ticket.nome || "-"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 ${sc.bg} ${sc.color} text-xs font-bold px-4 py-1.5 rounded-full`}>
              {sc.icon} {sc.label}
            </span>
            <div className={`mt-2 inline-flex items-center gap-1.5 ${tc.bgClass} ${tc.colorClass} text-xs font-bold px-3 py-1 rounded-full`}>
              {tc.icon} {tc.label}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-gray-50 dark:divide-gray-800">
          {infoItems.map((item, i) => (
            <div key={i} className="p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <span>{item.icon}</span> {item.label}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.value}</div>
            </div>
          ))}

          {ticket.tracking && (
            <div className="col-span-2 p-4 border-t border-gray-50 dark:border-gray-800">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                ▦ Nº Tracking
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md text-sm font-semibold">
                  {ticket.tracking}
                </span>
                {(() => {
                  const url = getTrackingUrl(ticket.tracking);
                  return url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-indigo-700 transition-colors">
                      Rastrear →
                    </a>
                  ) : null;
                })()}
                <button
                  onClick={() => navigator.clipboard.writeText(ticket.tracking)}
                  className="text-xs border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Copiar"
                >
                  📋
                </button>
              </div>
            </div>
          )}
        </div>

        {statusBox && (
          <div className="mx-6 my-5">
            <div className={`rounded-2xl p-5 border ${statusBox.borderClass} ${statusBox.bgClass}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-xl ${statusBox.iconBg} flex items-center justify-center text-lg flex-shrink-0`}>
                  {statusBox.icon}
                </div>
                <div className={`font-bold text-sm ${statusBox.titleColor}`}>{statusBox.title}</div>
              </div>
              <div className={`text-sm leading-relaxed ${statusBox.detailColor}`} dangerouslySetInnerHTML={{ __html: statusBox.detail }} />
            </div>
          </div>
        )}

        <div className="px-6 pb-6">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
            📋 Histórico do Pedido
          </div>
          <div className="space-y-0">
            {timeline.map((item, idx) => {
              const isLast = idx === timeline.length - 1;
              const isActive = isLast && ticket.status !== "closed" && ticket.status !== "cancelled";
              return (
                <div key={idx} className="flex gap-4 relative pb-5 last:pb-0">
                  {!isLast && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-gradient-to-b from-gray-200 dark:from-gray-700 to-transparent" />
                  )}
                  <div className={`w-8 h-8 rounded-full ${item.bgClass} flex items-center justify-center text-sm flex-shrink-0 border-2 border-white dark:border-gray-900 shadow-sm`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <div
                      className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 flex-wrap"
                      dangerouslySetInnerHTML={{
                        __html: item.event + (isActive
                          ? ' <span class="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-semibold">Actual</span>'
                          : ""),
                      }}
                    />
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      📅 {item.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ContactCard />
    </>
  );
}

function buildStatusBox(ticket) {
  const type = ticket.type;

  if (type === "oferta") {
    const isSent = !!ticket.dataEnvio;
    const isDone = ticket.status === "closed";
    if (isDone) return { bgClass: "bg-green-50 dark:bg-green-950", borderClass: "border-green-200 dark:border-green-800", iconBg: "bg-green-100 dark:bg-green-900", icon: "✅", title: "Oferta Enviada", titleColor: "text-green-800 dark:text-green-200", detailColor: "text-green-700 dark:text-green-300", detail: `A oferta foi enviada com sucesso.${ticket.tracking ? ` Tracking: <strong class="font-mono">${ticket.tracking}</strong>` : ""}${ticket.dataEnvio ? ` · Enviado em: <strong>${fmt(ticket.dataEnvio)}</strong>` : ""}` };
    if (isSent) return { bgClass: "bg-blue-50 dark:bg-blue-950", borderClass: "border-blue-200 dark:border-blue-800", iconBg: "bg-blue-100 dark:bg-blue-900", icon: "📤", title: "Oferta Enviada", titleColor: "text-blue-800 dark:text-blue-200", detailColor: "text-blue-700 dark:text-blue-300", detail: `A oferta foi enviada e está a caminho.${ticket.tracking ? ` Tracking: <strong class="font-mono">${ticket.tracking}</strong>` : ""}` };
    return { bgClass: "bg-green-50 dark:bg-green-950", borderClass: "border-green-200 dark:border-green-800", iconBg: "bg-green-100 dark:bg-green-900", icon: "🎁", title: "Em Preparação", titleColor: "text-green-800 dark:text-green-200", detailColor: "text-green-700 dark:text-green-300", detail: "A sua oferta está a ser preparada pela nossa equipa. Será enviada em breve." };
  }

  if (type === "recusado") {
    const isSent = !!ticket.dataEnvio;
    const isDone = ticket.status === "closed";
    if (isDone) return { bgClass: "bg-green-50 dark:bg-green-950", borderClass: "border-green-200 dark:border-green-800", iconBg: "bg-green-100 dark:bg-green-900", icon: "✅", title: "Processado", titleColor: "text-green-800 dark:text-green-200", detailColor: "text-green-700 dark:text-green-300", detail: `O pedido foi processado com sucesso.${ticket.dataEnvio ? ` · Processado em: <strong>${fmt(ticket.dataEnvio)}</strong>` : ""}` };
    if (isSent) return { bgClass: "bg-red-50 dark:bg-red-950", borderClass: "border-red-200 dark:border-red-800", iconBg: "bg-red-100 dark:bg-red-900", icon: "🚫", title: "Recusado - Em Processamento", titleColor: "text-red-800 dark:text-red-200", detailColor: "text-red-700 dark:text-red-300", detail: `O pedido foi recusado e está a ser processado.${ticket.tracking ? ` Tracking: <strong class="font-mono">${ticket.tracking}</strong>` : ""}` };
    return { bgClass: "bg-red-50 dark:bg-red-950", borderClass: "border-red-200 dark:border-red-800", iconBg: "bg-red-100 dark:bg-red-900", icon: "⏳", title: "Recusado - Pendente", titleColor: "text-red-800 dark:text-red-200", detailColor: "text-red-700 dark:text-red-300", detail: "O pedido foi recusado e está a aguardar processamento." };
  }

  if (type === "exchange") {
    const isSent = !!ticket.dataEnvio;
    const isDone = ticket.status === "closed";
    if (isDone) return { bgClass: "bg-green-50 dark:bg-green-950", borderClass: "border-green-200 dark:border-green-800", iconBg: "bg-green-100 dark:bg-green-900", icon: "✅", title: "Troca Concluída", titleColor: "text-green-800 dark:text-green-200", detailColor: "text-green-700 dark:text-green-300", detail: `O produto foi enviado com sucesso.${ticket.tracking ? ` Tracking: <strong class="font-mono">${ticket.tracking}</strong>` : ""}${ticket.dataEnvio ? ` · Enviado em: <strong>${fmt(ticket.dataEnvio)}</strong>` : ""}` };
    if (isSent) return { bgClass: "bg-blue-50 dark:bg-blue-950", borderClass: "border-blue-200 dark:border-blue-800", iconBg: "bg-blue-100 dark:bg-blue-900", icon: "📤", title: "Produto Enviado", titleColor: "text-blue-800 dark:text-blue-200", detailColor: "text-blue-700 dark:text-blue-300", detail: `O produto foi enviado e está a caminho.${ticket.tracking ? ` Tracking: <strong class="font-mono">${ticket.tracking}</strong>` : ""}` };
    if (ticket.hasPendingRecolha) return { bgClass: "bg-amber-50 dark:bg-amber-950", borderClass: "border-amber-200 dark:border-amber-800", iconBg: "bg-amber-100 dark:bg-amber-900", icon: "📦", title: "A Aguardar Chegada do Produto", titleColor: "text-amber-800 dark:text-amber-200", detailColor: "text-amber-700 dark:text-amber-300", detail: "Estamos a aguardar a chegada do seu produto ao nosso armazém para efectuar o envio do artigo de substituição." };
    return { bgClass: "bg-indigo-50 dark:bg-indigo-950", borderClass: "border-indigo-200 dark:border-indigo-800", iconBg: "bg-indigo-100 dark:bg-indigo-900", icon: "⟳", title: "Em Processamento", titleColor: "text-indigo-800 dark:text-indigo-200", detailColor: "text-indigo-700 dark:text-indigo-300", detail: "A sua troca está a ser processada pela nossa equipa. Será contactado assim que houver novidades." };
  }

  if (type === "recolha") {
    const isDone = ticket.status === "closed";
    const hasArrived = !!ticket.dataChegada;
    const hasPickup = !!ticket.dataRecolha;
    if (isDone) return { bgClass: "bg-green-50 dark:bg-green-950", borderClass: "border-green-200 dark:border-green-800", iconBg: "bg-green-100 dark:bg-green-900", icon: "✅", title: "Recolha Concluída", titleColor: "text-green-800 dark:text-green-200", detailColor: "text-green-700 dark:text-green-300", detail: "O produto foi recolhido e processado com sucesso." };
    if (hasArrived) return { bgClass: "bg-blue-50 dark:bg-blue-950", borderClass: "border-blue-200 dark:border-blue-800", iconBg: "bg-blue-100 dark:bg-blue-900", icon: "🏭", title: "Produto no Armazém", titleColor: "text-blue-800 dark:text-blue-200", detailColor: "text-blue-700 dark:text-blue-300", detail: `O produto chegou ao nosso armazém em <strong>${fmt(ticket.dataChegada)}</strong> e está a ser processado.` };
    if (hasPickup) return { bgClass: "bg-amber-50 dark:bg-amber-950", borderClass: "border-amber-200 dark:border-amber-800", iconBg: "bg-amber-100 dark:bg-amber-900", icon: "🚚", title: "Recolha Agendada", titleColor: "text-amber-800 dark:text-amber-200", detailColor: "text-amber-700 dark:text-amber-300", detail: `A recolha está agendada para <strong>${fmt(ticket.dataRecolha)}</strong>. Por favor certifique-se de que o produto está embalado e disponível para recolha.` };
    return { bgClass: "bg-indigo-50 dark:bg-indigo-950", borderClass: "border-indigo-200 dark:border-indigo-800", iconBg: "bg-indigo-100 dark:bg-indigo-900", icon: "⏳", title: "Recolha Pendente", titleColor: "text-indigo-800 dark:text-indigo-200", detailColor: "text-indigo-700 dark:text-indigo-300", detail: "A sua recolha está a ser processada pela nossa equipa. Será contactado para agendar a data de recolha." };
  }

  if (type === "refund") {
    const isDone = ticket.status === "closed";
    const isProc = ticket.status === "pending";
    let cfg;
    if (isDone) cfg = { bgClass: "bg-green-50 dark:bg-green-950", borderClass: "border-green-200 dark:border-green-800", iconBg: "bg-green-100 dark:bg-green-900", icon: "✅", title: "Reembolso Processado", titleColor: "text-green-800 dark:text-green-200", detailColor: "text-green-700 dark:text-green-300" };
    else if (isProc) cfg = { bgClass: "bg-blue-50 dark:bg-blue-950", borderClass: "border-blue-200 dark:border-blue-800", iconBg: "bg-blue-100 dark:bg-blue-900", icon: "⟳", title: "Em Processamento", titleColor: "text-blue-800 dark:text-blue-200", detailColor: "text-blue-700 dark:text-blue-300" };
    else cfg = { bgClass: "bg-amber-50 dark:bg-amber-950", borderClass: "border-amber-200 dark:border-amber-800", iconBg: "bg-amber-100 dark:bg-amber-900", icon: "⏳", title: "A Aguardar Processamento", titleColor: "text-amber-800 dark:text-amber-200", detailColor: "text-amber-700 dark:text-amber-300" };

    let lastCompletedDate = ticket.dataPagamento || "";
    if (ticket.refundHistory?.length > 0) {
      const comps = ticket.refundHistory.filter(h => h.status === "Completado" || h.status === "completado").sort((a, b) => new Date(b.date) - new Date(a.date));
      if (comps.length > 0) lastCompletedDate = new Date(comps[0].date).toISOString().split("T")[0];
    }
    let detail = "";
    if (ticket.valorPago) detail += `Valor: <strong>€${parseFloat(ticket.valorPago).toFixed(2)}</strong>`;
    if (isDone && lastCompletedDate) detail += `&nbsp;·&nbsp;Pago em: <strong>${fmt(lastCompletedDate)}</strong>`;
    if (!isDone && ticket.statusReembolso) detail += (detail ? "<br>" : "") + `Estado: <strong>${ticket.statusReembolso}</strong>`;
    if (!detail) detail = "Em análise pela nossa equipa. Será contactado em breve.";
    if (isDone) detail += `<br><span style="font-size:0.78rem;opacity:0.85;">⏱ O valor pode demorar 2 a 5 dias úteis a reflectir na sua conta bancária, dependendo do banco.</span>`;
    cfg.detail = detail;
    return cfg;
  }

  return null;
}

function buildTimeline(ticket) {
  const items = [];
  items.push({ icon: "➕", bgClass: "bg-indigo-100 dark:bg-indigo-900", event: "Pedido criado e registado", date: fmt(ticket.data) });

  if (ticket.type === "recolha") {
    if (ticket.tracking) {
      const url = getTrackingUrl(ticket.tracking);
      const link = url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#f59e0b;font-weight:700;text-decoration:none;">${ticket.tracking} ↗</a>` : `<strong>${ticket.tracking}</strong>`;
      items.push({ icon: "▦", bgClass: "bg-amber-100 dark:bg-amber-900", event: `Tracking: ${link}`, date: fmt(ticket.data) });
    }
    if (ticket.dataRecolha) items.push({ icon: "🚚", bgClass: "bg-amber-100 dark:bg-amber-900", event: "Recolha agendada pelo transportador", date: fmt(ticket.dataRecolha) });
    if (ticket.dataChegada) items.push({ icon: "🏭", bgClass: "bg-purple-100 dark:bg-purple-900", event: "Produto chegou ao armazém", date: fmt(ticket.dataChegada) });
  }

  if (ticket.type === "oferta" || ticket.type === "recusado") {
    if (ticket.tracking) {
      const url = getTrackingUrl(ticket.tracking);
      const link = url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0ea5e9;font-weight:700;text-decoration:none;">${ticket.tracking} ↗</a>` : `<strong>${ticket.tracking}</strong>`;
      items.push({ icon: "▦", bgClass: "bg-sky-100 dark:bg-sky-900", event: `Tracking: ${link}`, date: ticket.dataEnvio ? fmt(ticket.dataEnvio) : "-" });
    }
    if (ticket.dataEnvio) items.push({ icon: "📤", bgClass: "bg-green-100 dark:bg-green-900", event: ticket.type === "oferta" ? "Oferta enviada para o cliente" : "Processado e enviado", date: fmt(ticket.dataEnvio) });
  }

  if (ticket.type === "exchange") {
    if (ticket.tracking) {
      const url = getTrackingUrl(ticket.tracking);
      const link = url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0ea5e9;font-weight:700;text-decoration:none;">${ticket.tracking} ↗</a>` : `<strong>${ticket.tracking}</strong>`;
      items.push({ icon: "▦", bgClass: "bg-sky-100 dark:bg-sky-900", event: `Tracking: ${link}`, date: ticket.dataEnvio ? fmt(ticket.dataEnvio) : "-" });
    }
    if (ticket.dataEnvio) items.push({ icon: "📤", bgClass: "bg-green-100 dark:bg-green-900", event: "Produto enviado para o cliente", date: fmt(ticket.dataEnvio) });
  }

  if (ticket.type === "refund") {
    if (ticket.refundHistory?.length > 0) {
      const sorted = [...ticket.refundHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
      sorted.forEach((h, idx) => {
        const isLast = idx === sorted.length - 1;
        const isComp = h.status === "Completado" || h.status === "completado";
        const isErr = h.status?.includes("INCORRETO");
        const isCor = h.status?.includes("CORRIGIDO");
        const d = new Date(h.date);
        const dateStr = d.toLocaleDateString("pt-PT");
        const timeStr = d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
        let icon, bgClass, event;
        if (isComp && isLast) { icon = "✅"; bgClass = "bg-green-100 dark:bg-green-900"; event = "Reembolso transferido com sucesso"; }
        else if (isComp && !isLast) { icon = "❌"; bgClass = "bg-red-100 dark:bg-red-900"; event = "Tentativa de pagamento - devolvido pelo banco"; }
        else if (isErr) { icon = "⚠️"; bgClass = "bg-red-100 dark:bg-red-900"; event = "IBAN incorrecto - aguarda correcção"; }
        else if (isCor) { icon = "✏️"; bgClass = "bg-blue-100 dark:bg-blue-900"; event = "IBAN corrigido pelo cliente"; }
        else { icon = "⏳"; bgClass = "bg-amber-100 dark:bg-amber-900"; event = `${h.status}`; }
        items.push({ icon, bgClass, event, date: `${dateStr} às ${timeStr}` });
      });
    } else if (ticket.dataPagamento) {
      items.push({ icon: "💸", bgClass: "bg-green-100 dark:bg-green-900", event: "Reembolso transferido com sucesso", date: fmt(ticket.dataPagamento) });
    }
  }

  const lastMap = {
    closed:    { icon: "✅", bgClass: "bg-green-100 dark:bg-green-900",  event: "Pedido concluído com sucesso" },
    pending:   { icon: "⟳",  bgClass: "bg-amber-100 dark:bg-amber-900", event: ticket.type === "exchange" ? "A aguardar chegada do produto ao armazém" : "Em processamento pela equipa" },
    waiting:   { icon: "⏳", bgClass: "bg-gray-100 dark:bg-gray-800",   event: ticket.type === "exchange" ? "A aguardar chegada do produto ao armazém" : "A aguardar chegada do produto" },
    open:      { icon: "●",  bgClass: "bg-indigo-100 dark:bg-indigo-900", event: "Em análise pela equipa" },
    cancelled: { icon: "✕",  bgClass: "bg-red-100 dark:bg-red-900",     event: "Pedido cancelado" },
  };
  const last = lastMap[ticket.status] || lastMap.open;
  items.push({ ...last, date: "-" });
  return items;
}
