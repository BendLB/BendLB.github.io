/* Bandeau commun du book : inséré en haut de chaque page projet.
   Isolé dans un shadow DOM pour ne pas hériter des styles de la page. */
(function () {
  var PROJETS = [
    ["livre", "(Le Livre)³"],
    ["balance", "Balance énergie"],
    ["calcul", "Calcul mental"],
    ["brown", "Grains de Brown"],
    ["vie", "Jeu de la vie"],
    ["traversee", "Traversée optimale"],
    ["improbable", "L'échelle de l'improbable"],
    ["pi", "Chasse à π"],
    ["fourier", "Fourier Épicycles"],
    ["float", "Anatomie d'un float"],
    ["morse", "Télégraphe Morse"],
    ["allure", "Convertisseur d'allure"],
    ["monkey", "Monkey Memory"]
  ];
  var ME = document.currentScript && document.currentScript.src;
  var ROOT = ME ? new URL(".", ME).href : new URL("../", location.href).href;
  if (document.getElementById("book-banner")) return;

  var slug = (location.pathname.split("/").pop() || "").replace(/\.html?$/, "");
  var i = -1;
  for (var k = 0; k < PROJETS.length; k++) if (PROJETS[k][0] === slug) i = k;
  var prev = i >= 0 ? PROJETS[(i - 1 + PROJETS.length) % PROJETS.length] : null;
  var next = i >= 0 ? PROJETS[(i + 1) % PROJETS.length] : null;
  var pos = i >= 0 ? String(i + 1).padStart(2, "0") + " / " + PROJETS.length : "";

  try {
    if (!document.querySelector('link[data-book-fonts]')) {
      var l = document.createElement("link");
      l.rel = "stylesheet";
      l.setAttribute("data-book-fonts", "");
      l.href = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700&family=JetBrains+Mono:wght@500&display=swap";
      (document.head || document.documentElement).appendChild(l);
    }
  } catch (e) {}

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  var host = document.createElement("div");
  host.id = "book-banner";
  host.style.cssText = "display:block;position:relative;z-index:60;align-self:stretch;box-sizing:border-box;width:auto;max-width:none;flex:none;";
  var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

  root.innerHTML =
    '<style>' +
    ':host{all:initial;display:block}' +
    'nav{--bg:#18202B;--fg:#E8ECEF;--muted:#9AA5B1;--accent:#8EA2FF;--line:#2A3542;' +
      'background:var(--bg);color:var(--fg);border-bottom:1px solid var(--line);' +
      'display:flex;align-items:center;gap:12px;padding:8px 16px;min-height:44px;box-sizing:border-box;' +
      'font:500 13px/1.3 "JetBrains Mono",ui-monospace,Menlo,monospace;}' +
    'a{color:inherit;text-decoration:none;border-radius:6px;display:inline-flex;align-items:center;gap:8px;min-height:32px;padding:0 8px}' +
    'a:hover{background:rgba(255,255,255,.07)}' +
    'a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}' +
    '.home{margin-left:-8px;min-width:0}' +
    '.mono{width:26px;height:26px;border-radius:5px;background:var(--accent);color:var(--bg);display:grid;place-items:center;' +
      'font:700 15px/1 "Bricolage Grotesque","Helvetica Neue",Arial,sans-serif;flex:none}' +
    '.who{font:700 14px/1.2 "Bricolage Grotesque","Helvetica Neue",Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.who span{color:var(--muted);font-weight:500}' +
    '.pos{color:var(--muted);letter-spacing:.06em;margin-left:auto;white-space:nowrap}' +
    '.step{color:var(--muted);white-space:nowrap}' +
    '.step b{color:var(--fg);font-weight:500}' +
    '.step:hover{color:var(--fg)}' +
    '@media (max-width:640px){.step .t,.pos{display:none}nav{gap:4px}}' +
    '</style>' +
    '<nav aria-label="Navigation du book">' +
      '<a class="home" href="' + ROOT + 'index.html"><span class="mono" aria-hidden="true">B</span>' +
        '<span class="who">Benoît de la Batut</span></a>' +
      '<span class="pos"></span>' +
      (prev ? '<a class="step" href="' + ROOT + 'projets/' + prev[0] + '.html" aria-label="Projet précédent : ' + esc(prev[1]) + '">‹ <span class="t"><b>' + esc(prev[1]) + '</b></span></a>' : '') +
      (next ? '<a class="step" href="' + ROOT + 'projets/' + next[0] + '.html" aria-label="Projet suivant : ' + esc(next[1]) + '"><span class="t"><b>' + esc(next[1]) + '</b></span> ›</a>' : '') +
    '</nav>';

  function fit() {
    var b = document.body;
    if (!b) return;
    var cs = getComputedStyle(b);
    host.style.marginLeft = "-" + cs.paddingLeft;
    host.style.marginRight = "-" + cs.paddingRight;
    host.style.marginTop = "-" + cs.paddingTop;
    host.style.marginBottom = cs.paddingTop;
  }
  function mount() {
    if (!document.body) return false;
    if (host.parentNode !== document.body || document.body.firstChild !== host) document.body.insertBefore(host, document.body.firstChild);
    fit();
    return true;
  }
  if (!mount()) document.addEventListener("DOMContentLoaded", mount);
  document.addEventListener("DOMContentLoaded", mount);
  window.addEventListener("load", function () { mount(); });
  window.addEventListener("resize", fit);
})();
