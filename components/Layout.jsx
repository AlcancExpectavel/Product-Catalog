// Layout principal — envolve todas as páginas com Navbar + Footer
import Navbar from "./Navbar";
import Footer from "./Footer";
import Head from "next/head";

const BRAND_NAME = "[MARCA]";

export default function Layout({ children, title, description }) {
  const pageTitle = title ? `${title} | ${BRAND_NAME}` : BRAND_NAME;
  const pageDescription = description || "Catálogo de produtos de qualidade.";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
