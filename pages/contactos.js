// =======================================================
// PÁGINA DE CONTACTOS — substitui os dados reais
// =======================================================

import Layout from "../components/Layout";

export default function Contactos() {
  return (
    <Layout title="Contactos" description="Entra em contacto connosco.">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contactos</h1>
        <p className="text-gray-500 mb-12">Estamos disponíveis para te ajudar. Entra em contacto connosco.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
              titulo: "Email",
              valor: "[EMAIL]",
              href: "mailto:[EMAIL]",
            },
            {
              icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
              titulo: "Telefone",
              valor: "[TELEFONE]",
              href: "tel:[TELEFONE]",
            },
          ].map((c) => (
            <a
              key={c.titulo}
              href={c.href}
              className="card p-6 flex items-start gap-4 hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-600 transition-colors">
                <svg className="w-5 h-5 text-brand-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{c.titulo}</p>
                <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{c.valor}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}
