import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="pt">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Esconde a página imediatamente se houver tradução activa,
            para evitar o flash do conteúdo em PT antes do GT traduzir */}
        <style>{`
          html.gt-translating { opacity: 0; }
          html { transition: opacity 0.25s ease; }
        `}</style>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var hasCookie = /googtrans=\\/pt\\/[a-z]+/.test(document.cookie);
            if (hasCookie) {
              document.documentElement.classList.add('gt-translating');
              // Mostra a página após o GT ter tempo de traduzir (~700ms)
              window.addEventListener('load', function() {
                setTimeout(function() {
                  document.documentElement.classList.remove('gt-translating');
                }, 700);
              });
            }
          })();
        `}} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
