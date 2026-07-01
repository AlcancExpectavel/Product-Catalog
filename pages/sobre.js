import Layout from "../components/Layout";

const BRAND_NAME = "Alcance Expectável";

export default function Sobre() {
  return (
    <Layout title="Sobre nós" description={`Conhece a história e missão da ${BRAND_NAME}.`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{BRAND_NAME}</h1>
        <p className="text-xl text-brand-600 font-medium mb-8">
          [Slogan da empresa]
        </p>

        <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
          <p>
            [História e missão da empresa.]
          </p>
          <p>
            [Continuar a descrição aqui...]
          </p>
        </div>
      </div>
    </Layout>
  );
}
