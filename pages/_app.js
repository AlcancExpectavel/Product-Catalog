import "../styles/globals.css";
import Script from "next/script";

const themeInitScript = `
  (function () {
    try {
      var savedTheme = localStorage.getItem("theme");
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle(
        "dark",
        savedTheme === "dark" || (!savedTheme && prefersDark)
      );
    } catch (error) {
      document.documentElement.classList.toggle(
        "dark",
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
  })();
`;

export default function App({ Component, pageProps }) {
  return (
    <>
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: themeInitScript }}
      />
      {/* Google Translate Element - invisível, controlado via cookie */}
      <div id="google_translate_element" style={{ display: "none" }} />
      <Script
        id="gt-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'pt',
                includedLanguages: 'pt,es,en',
                autoDisplay: false,
              }, 'google_translate_element');
            }
          `,
        }}
      />
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <Component {...pageProps} />
    </>
  );
}
