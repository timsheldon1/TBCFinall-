const GTM_ID = 'GTM-M8GJZHCM';

/**
 * Exact text of the original inline GTM bootstrap script — must match
 * byte-for-byte (after \r\n -> \n normalization) or the CSP script-src
 * hash in public/_headers and public/.htaccess will silently block it.
 * If you ever need to change this, recompute the sha256 hash and update
 * both CSP config files.
 */
const GTM_BOOTSTRAP_SCRIPT =
  "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n" +
  "new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n" +
  "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n" +
  "'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n" +
  "})(window,document,'script','dataLayer','GTM-M8GJZHCM');";

let loaded = false;

/** Loads Google Tag Manager. Only call this after the visitor has given cookie consent. */
export function loadGTM() {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;

  const script = document.createElement('script');
  script.textContent = GTM_BOOTSTRAP_SCRIPT;
  document.head.appendChild(script);
}

export { GTM_ID };
