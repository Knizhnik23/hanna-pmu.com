/*
 * Сборка страниц: node build.js
 * Берёт тексты из assets/js/i18n.js (немецкий — язык по умолчанию)
 * и контакты из assets/js/config.js, собирает index.html, impressum.html, datenschutz.html.
 * Править тексты — в i18n.js, потом снова запустить сборку.
 */
const fs = require("fs");
const vm = require("vm");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + "/assets/js/i18n.js", "utf8"), ctx);
vm.runInContext(fs.readFileSync(__dirname + "/assets/js/config.js", "utf8"), ctx);
const DE = ctx.window.I18N.de;
const CFG = ctx.window.SITE_CONFIG;
const VERSION = Date.now().toString(36);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tx = (k) => { if (!(k in DE)) throw new Error("Missing key: " + k); return esc(DE[k]); };
/* element with translatable text */
const T = (tag, key, attrs = "") => `<${tag}${attrs ? " " + attrs : ""} data-i18n="${key}">${tx(key)}</${tag}>`;
/* translatable attribute */
const A = (attr, key) => `${attr}="${tx(key)}" data-i18n-${attr}="${key}"`;
const icon = (id, cls = "ic") => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${id}"></use></svg>`;
const waHref = `https://wa.me/${CFG.whatsapp}`;
const tgHref = `https://t.me/${CFG.telegram}`;
const igHref = `https://instagram.com/${CFG.instagram}`;

/* ---------- small parts ---------- */
const btnWa = (labelKey, { variant = "primary", theme = "dark", service = "", msg = "", block = false, extra = "" } = {}) =>
  `<a class="btn btn--${variant} btn--on-${theme}${block ? " btn--block" : ""}${extra ? " " + extra : ""}" href="${waHref}" target="_blank" rel="noopener" data-wa${service ? ` data-wa-service="${service}"` : ""}${msg ? ` data-wa-msg="${msg}"` : ""}>${icon("wa")}${T("span", labelKey)}</a>`;
const linkTg = (key = "cta.telegram", theme = "dark") =>
  `<a class="tlink tlink--on-${theme}" href="${tgHref}" target="_blank" rel="noopener" data-tg>${Array.isArray(key) ? T("span", key[0], 'class="only-mob"') + T("span", key[1], 'class="only-desk"') : T("span", key)}${icon("tg")}</a>`;
const ctaPair = (labelKey, theme, opts = {}) =>
  `<div class="cta-pair${opts.row ? " cta-pair--row" : ""}${opts.full ? " cta-pair--full" : ""}">${btnWa(labelKey, { theme, block: opts.block, service: opts.service, msg: opts.msg })}${linkTg(opts.tgKey || "cta.telegram", theme)}</div>`;
const head = (num, ebKey, titleKey, subKey, theme = "dark") =>
  `<div class="sec-head" data-reveal>
        <p class="eyebrow"><span class="eyebrow__num">${num}</span><span class="eyebrow__line" aria-hidden="true"></span>${T("span", ebKey)}</p>
        ${T("h2", titleKey, 'class="t-h2"')}
        ${subKey ? T("p", subKey, 'class="t-sub"') : ""}
      </div>`;
const tag = (labelKey, num = "") =>
  `<span class="tag">${num ? `<span class="tag__num">${num}</span>` : ""}${T("span", labelKey)}</span>`;

/* ---------- hero: Punkte + Linien zu den Tags (Koordinaten aus Figma, werden nacheinander eingezeichnet) ---------- */
const HERO_LINES = `<svg class="hero__lines hero__lines--m" viewBox="0 0 390 844" preserveAspectRatio="none" aria-hidden="true" focusable="false"><circle class="hl-dot" style="--g:0" cx="181.0" cy="326.5" r="2.5"/><line class="hl-line" style="--g:0;--len:81.6" x1="180.0" y1="326.0" x2="100.0" y2="310.0"/><circle class="hl-dot" style="--g:1" cx="101.0" cy="497.6" r="2.5"/><line class="hl-line" style="--g:1;--len:59.4" x1="100.2" y1="498.7" x2="69.5" y2="549.5"/><circle class="hl-dot" style="--g:2" cx="316.0" cy="585.3" r="2.5"/><line class="hl-line" style="--g:2;--len:31.3" x1="316.3" y1="587.5" x2="316.5" y2="618.8"/></svg><svg class="hero__lines hero__lines--d" viewBox="0 0 1440 844" preserveAspectRatio="none" aria-hidden="true" focusable="false"><circle class="hl-dot" style="--g:0" cx="741.5" cy="199.5" r="3.5"/><line class="hl-line" style="--g:0;--len:39.9" x1="743.0" y1="199.8" x2="782.8" y2="199.8"/><circle class="hl-dot" style="--g:1" cx="789.5" cy="320.5" r="3.5"/><line class="hl-line" style="--g:1;--len:62.6" x1="789.9" y1="321.7" x2="832.0" y2="368.0"/><circle class="hl-dot" style="--g:2" cx="823.2" cy="664.1" r="3.5"/><line class="hl-line" style="--g:2;--len:39.8" x1="823.3" y1="665.6" x2="825.5" y2="705.3"/></svg>`;

/* ---------- sections ---------- */
const services = [
  ["s1", "svc-pmu-brauen.jpg", 700, 712],            // „Перманент Бровей Маша“
  ["s2", "svc-pmu-lippen.jpg", 700, 712],            // „Перманент Губ“
  ["s4", "svc-wimpern-laminierung.jpg", 700, 712],   // „Ламинирование ресниц“
  ["s5", "svc-brauen-styling.jpg", 700, 712],        // „Оформление бровей“
  ["s3", "svc-make-up-styling.jpg", 700, 712],       // „Макияж и укладка“
];
const serviceCard = ([k, img, w, h], i) => `
          <li class="scard">
            <div class="scard__media"><img class="scard__img" src="assets/img/${img}?v=${VERSION}" width="${w}" height="${h}" loading="lazy" decoding="async" ${A("alt", k + ".alt")}></div>
            <div class="scard__body">
              ${T("h3", k + ".title", 'class="scard__title"')}
              ${T("p", k + ".text", 'class="scard__text"')}
              <p class="scard__meta">${T("strong", k + ".price")}${T("span", k + ".time")}</p>
              <button class="acc-head scard__toggle" type="button" aria-expanded="false" aria-controls="${k}-details">
                ${T("span", "services.details", "data-when-closed")}${T("span", "services.less", "data-when-open")}<span class="pm" aria-hidden="true"></span>
              </button>
              <div class="collapse" id="${k}-details"><div class="collapse__in">
                <dl class="scard__details">
                  <div>${T("dt", "services.l1")}${T("dd", k + ".d1")}</div>
                  <div>${T("dt", "services.l2")}${T("dd", k + ".d2")}</div>
                  <div>${T("dt", "services.l3")}${T("dd", k + ".d3")}</div>
                </dl>
              </div></div>
              ${btnWa("cta.book", { theme: "dark", block: true, service: k + ".title" })}
            </div>
          </li>`;

const priceRow = (k) => `
            <li class="price-row">
              <div class="price-row__text">${T("p", k + "n", 'class="price-row__name"')}${DE[k + "m"] ? T("p", k + "m", 'class="price-row__meta"') : ""}</div>
              ${T("p", k + "p", 'class="price-row__price"')}
            </li>`;
const mainPrices = ["p1.", "p2.", "p3.", "p4.", "p5."].map(priceRow).join("");
const groups = [
  ["g1", 3], ["g2", 2], ["g3", 2], ["g4", 2], ["g5", 3], ["g6", 1],
].map(([g, n]) => `
              <div class="price-group">
                ${T("h3", g, 'class="t-eyebrow price-group__label"')}
                <ul class="price-list">${Array.from({ length: n }, (_, i) => priceRow(`${g}.${i + 1}`)).join("")}</ul>
              </div>`).join("");

const reviews = [
  ["r1", "rev-pmu-brauen.jpg", "?"], ["r2", "rev-pmu-lippen.jpg", "?"], ["r3", "rev-wimpern.jpg", "?"], ["r4", "rev-brauen-lippen.jpg", "?"],
].map(([k, img, ini], i) => `
          <li class="rcard">
            <div class="rcard__media"><img src="assets/img/${img}" alt="" loading="lazy" decoding="async">${tag(k + ".tag")}</div>
            <div class="rcard__body">
              <p class="stars" ${A("aria-label", "a11y.stars")}>${icon("star", "ic star")}${icon("star", "ic star")}${icon("star", "ic star")}${icon("star", "ic star")}${icon("star", "ic star")}</p>
              ${T("blockquote", k + ".q", 'class="rcard__quote"')}
              <div class="rcard__author"><span class="avatar" aria-hidden="true">${ini}</span><div>${T("p", k + ".n", 'class="rcard__name"')}${T("p", k + ".m", 'class="rcard__meta"')}</div></div>
            </div>
          </li>`).join("");

const tiles = [["i1", "ig-pmu-brauen.jpg"], ["i2", "ig-pmu-lippen.jpg"], ["i3", "ig-ergebnis.jpg"], ["i4", "ig-pmu-brauen-mascha.jpg"]].map(([k, img], i) => `
          <li class="tile" data-reveal style="--i:${i}">
            <img src="assets/img/${img}" alt="" loading="lazy" decoding="async">
            <div class="tile__text">${T("p", k + ".q", 'class="tile__q"')}${T("p", k + ".a", 'class="tile__a"')}</div>
          </li>`).join("");

const faqs = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `
          <li class="acc">
            <h3 class="acc__h"><button class="acc-head" type="button" aria-expanded="false" aria-controls="f${n}-a" id="f${n}-q">${T("span", `f${n}.q`)}<span class="pm" aria-hidden="true"></span></button></h3>
            <div class="collapse" id="f${n}-a" role="region" aria-labelledby="f${n}-q"><div class="collapse__in">${T("p", `f${n}.a`, 'class="acc__a"')}</div></div>
          </li>`).join("");

/* Bewertungen erst zeigen, wenn echte Bewertungen da sind (config.js → showReviews: true) */
const SHOW_REVIEWS = !!CFG.showReviews;
const NUM = SHOW_REVIEWS ? { reviews: "07", instagram: "08", faq: "09" } : { instagram: "07", faq: "08" };
const navItems = [
  ["about", "03", "nav.about"], ["process", "04", "nav.process"], ["services", "05", "nav.services"],
  ["prices", "06", "nav.prices"], ...(SHOW_REVIEWS ? [["reviews", "07", "nav.reviews"]] : []), ["instagram", NUM.instagram, "nav.instagram"], ["faq", NUM.faq, "nav.faq"],
];
const langSwitch = (cls = "") =>
  `<div class="lang ${cls}" role="group" ${A("aria-label", "a11y.lang")}><button type="button" data-lang="de" aria-pressed="true">DE</button><button type="button" data-lang="ru" aria-pressed="false" lang="ru">RU</button></div>`;

/* ---------- icons ---------- */
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-wa" viewBox="0 0 24 24"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88a9.86 9.86 0 0 1 9.88 9.89c0 5.45-4.43 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41"/></symbol>
  <symbol id="i-tg" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm4.91 7.22c.1 0 .32.03.46.14.12.1.15.23.17.33.02.09.04.3.02.47-.18 1.9-.96 6.5-1.36 8.63-.17.9-.5 1.2-.82 1.23-.7.06-1.22-.46-1.9-.9-1.06-.7-1.65-1.13-2.68-1.8-1.18-.78-.42-1.21.26-1.91.18-.18 3.25-2.98 3.3-3.23.01-.03.02-.15-.05-.21-.07-.06-.17-.04-.25-.02-.1.02-1.8 1.14-5.06 3.35-.48.33-.91.49-1.3.48-.43-.01-1.25-.24-1.87-.44-.75-.25-1.35-.38-1.3-.79.03-.22.33-.44.9-.66 3.5-1.53 5.83-2.53 7-3.02 3.33-1.38 4.02-1.62 4.48-1.63z"/></symbol>
  <symbol id="i-ig" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.2c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 20 20"><path d="M4 10h12M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-arrow-l" viewBox="0 0 20 20"><path d="M16 10H4M9 5l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-ext" viewBox="0 0 20 20"><path d="M6 14l8-8M8 6h6v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 6.75h18M3 12h18M3 17.25h18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
  <symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.5l7.1-.6z"/></symbol>
  <symbol id="i-handle" viewBox="0 0 24 24"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</svg>`;

/* ---------- shared header / menu / footer ---------- */
const header = (home = true) => {
  const h = (id) => (home ? `#${id}` : `index.html#${id}`);
  return `<header class="header${home ? "" : " header--solid"}" data-header>
    <div class="container header__in">
      <a class="logo" href="${home ? "#top" : "index.html"}">HANNA · PMU</a>
      <nav class="nav" aria-label="Hauptnavigation">
        ${navItems.filter(([id]) => id !== "instagram").map(([id, , k]) => `<a href="${h(id)}" data-spy="${id}">${T("span", k)}</a>`).join("")}
      </nav>
      <div class="header__right">
        ${langSwitch("lang--header")}
        ${btnWa("nav.cta", { variant: "secondary", extra: "header__cta" })}
        <button class="icon-btn burger" type="button" data-menu-open aria-controls="menu" aria-expanded="false" ${A("aria-label", "a11y.menuOpen")}>${icon("menu")}</button>
      </div>
    </div>
  </header>

  <div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menü" hidden data-menu>
    <div class="container menu__top">
      <span class="logo">HANNA · PMU</span>
      <div class="menu__top-right">${langSwitch()}<button class="icon-btn" type="button" data-menu-close ${A("aria-label", "a11y.menuClose")}>${icon("close")}</button></div>
    </div>
    <nav class="container menu__nav" aria-label="Menü">
      ${navItems.map(([id, num, k], i) => `<a class="menu__item" href="${h(id)}" data-spy="${id}" style="--i:${i}"><span class="menu__num">${num}</span>${T("span", k, 'class="menu__label"')}${icon("arrow", "ic menu__arrow")}</a>`).join("")}
    </nav>
    <div class="container menu__bottom">
      ${btnWa("footer.cta", { block: true })}
      <div class="menu__links">
        <a class="tlink tlink--on-dark" href="${tgHref}" target="_blank" rel="noopener" data-tg><span>Telegram</span>${icon("tg")}</a>
        <a class="tlink tlink--on-dark" href="${igHref}" target="_blank" rel="noopener" data-ig><span>Instagram</span>${icon("ig")}</a>
      </div>
      <p class="menu__addr">${T("span", "menu.name", 'class="menu__name"')}${T("span", "menu.city")}</p>
    </div>
  </div>`;
};

const footer = (home = true) => {
  const h = (id) => (home ? `#${id}` : `index.html#${id}`);
  return `<footer class="footer">
    <div class="container footer__grid">
      <div class="footer__col1">
        <div class="footer__brand">
          <p class="logo">HANNA · PMU</p>
          ${T("p", "footer.tagline", 'class="footer__tagline"')}
        </div>
        ${ctaPair("footer.cta", "dark")}
      </div>
      <div class="footer__contact">
        ${T("h2", "footer.contact", 'class="t-eyebrow footer__label"')}
        <dl class="footer__dl">
          <div>${T("dt", "footer.wa")}<dd><a href="${waHref}" target="_blank" rel="noopener" data-wa data-phone>${esc(CFG.phoneDisplay)}</a></dd></div>
          <div>${T("dt", "footer.tg")}<dd><a href="${tgHref}" target="_blank" rel="noopener" data-tg data-handle="telegram">@${esc(CFG.telegram)}</a></dd></div>
          <div>${T("dt", "footer.ig")}<dd><a href="${igHref}" target="_blank" rel="noopener" data-ig data-handle="instagram">@${esc(CFG.instagram)}</a></dd></div>
          <div>${T("dt", "footer.place")}${T("dd", "footer.placeText")}</div>
          <div>${T("dt", "footer.hours")}${T("dd", "footer.hoursText")}</div>
        </dl>
      </div>
      <nav class="footer__nav" aria-label="Footer">
        ${T("h2", "footer.nav", 'class="t-eyebrow footer__label"')}
        <ul>${navItems.map(([id, , k]) => `<li><a href="${h(id)}">${T("span", k)}</a></li>`).join("")}</ul>
      </nav>
    </div>
    <div class="container footer__legal">
      <ul>
        <li><a href="impressum.html">${T("span", "footer.impressum")}</a></li>
        <li><a href="datenschutz.html">${T("span", "footer.privacy")}</a></li>
        <li><button type="button" data-modal-open="cookies">${T("span", "footer.cookies")}</button></li>
      </ul>
      ${T("p", "footer.copy")}
    </div>
  </footer>

  <div class="modal" id="cookies" hidden data-modal>
    <div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="cookies-title">
      <div class="modal__top">
        ${T("h2", "cookie.title", 'class="modal__title" id="cookies-title"')}
        <button class="icon-btn modal__close" type="button" data-modal-close ${A("aria-label", "a11y.close")}><span>${icon("close")}</span></button>
      </div>
      <div class="modal__content">
        ${T("p", "cookie.text")}
        <div class="modal__actions">
          <button class="btn btn--primary btn--on-dark btn--block" type="button" data-consent="all">${T("span", "cookie.all")}</button>
          <button class="btn btn--secondary btn--on-dark btn--block" type="button" data-consent="necessary">${T("span", "cookie.necessary")}</button>
        </div>
      </div>
    </div>
  </div>`;
};

const docHead = (titleKey, descKey, extra = "") => `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title data-i18n="${titleKey}">${tx(titleKey)}</title>
  <meta name="description" ${A("content", descKey)}>
  <meta name="theme-color" content="#1D1F1E">
  <meta property="og:type" content="website">
  <meta property="og:title" ${A("content", titleKey)}>
  <meta property="og:description" ${A("content", descKey)}>
  <meta property="og:image" content="assets/img/hero-desktop.jpg">
  <meta property="og:locale" content="de_DE">
  <script>document.documentElement.classList.add("js")</script>
  <link rel="preload" href="assets/fonts/outfit-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/manrope-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="assets/css/styles.css?v=${VERSION}">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%231D1F1E'/%3E%3Ctext x='16' y='22' font-family='Arial' font-weight='700' font-size='16' fill='%23ED6B72' text-anchor='middle'%3EH%3C/text%3E%3C/svg%3E">
  ${extra}
</head>`;
const scripts = `
  <script src="assets/js/config.js?v=${VERSION}"></script>
  <script src="assets/js/i18n.js?v=${VERSION}"></script>
  <script src="assets/js/main.js?v=${VERSION}"></script>`;

/* ---------- index.html ---------- */
const index = `${docHead("meta.title", "meta.description", `<link rel="preload" href="assets/img/hero-mobile.jpg?v=${VERSION}c" as="image" media="(max-width: 767px)">
  <link rel="preload" href="assets/img/hero-desktop.jpg?v=${VERSION}c" as="image" media="(min-width: 768px)">`)}
<body id="top">
  ${sprite}
  <a class="skip" href="#main" data-i18n="a11y.skip">${tx("a11y.skip")}</a>
  ${header(true)}

  <main id="main">
    <!-- 01 HERO -->
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__art" aria-hidden="true">
        <picture>
          <source media="(min-width: 768px)" srcset="assets/img/hero-desktop.jpg?v=${VERSION}c">
          <img src="assets/img/hero-mobile.jpg?v=${VERSION}c" alt="" fetchpriority="high">
        </picture>
        ${HERO_LINES}
        <span class="hero__tag hero__tag--1" style="--g:0">${tag("hero.tag1", "01")}</span>
        <span class="hero__tag hero__tag--2" style="--g:2">${tag("hero.tag2", "02")}</span>
        <span class="hero__tag hero__tag--3" style="--g:1">${tag("hero.tag3", "03")}</span>
      </div>
      <div class="container hero__in">
        <div class="hero__top">
          <p class="eyebrow hero__eyebrow" data-hero="1"><span class="eyebrow__line" aria-hidden="true"></span>${T("span", "hero.eyebrow")}</p>
          ${T("h1", "hero.title", 'class="t-display hero__title" id="hero-title" data-hero="2"')}
        </div>
        <div class="hero__bottom">
          <p class="hero__text" data-hero="3">${T("span", "hero.text", 'class="only-mob"')}${T("span", "hero.textDesk", 'class="only-desk"')}</p>
          <div class="hero__cta" data-hero="4">${ctaPair("hero.cta", "dark", { row: true, msg: "wa.message", tgKey: ["cta.telegram", "cta.telegramShort"] })}</div>
        </div>
      </div>
    </section>

    <!-- 02 VORHER / NACHHER -->
    <section class="sec sec--dark" id="vorher-nachher" aria-labelledby="ba-title">
      <div class="container ba-sec">
        <div class="sec-head" data-reveal>
          <p class="eyebrow"><span class="eyebrow__num">02</span><span class="eyebrow__line" aria-hidden="true"></span>${T("span", "ba.eyebrow")}</p>
          ${T("h2", "ba.title", 'class="t-h2" id="ba-title"')}
          ${T("p", "ba.text", 'class="t-lead"')}
        </div>
        ${T("p", "ba.hint", 'class="t-hint ba__hint" data-reveal')}
        <div class="ba" data-ba data-reveal style="--pos:50%">
          <img class="ba__img" draggable="false" src="assets/img/after.jpg?v=${VERSION}b" width="1400" height="1000" loading="lazy" decoding="async" ${A("alt", "ba.altAfter")}>
          <div class="ba__before"><img class="ba__img" draggable="false" src="assets/img/before.jpg?v=${VERSION}" width="1400" height="1000" loading="lazy" decoding="async" ${A("alt", "ba.altBefore")}></div>
          <span class="ba__tag ba__tag--l">${tag("ba.before")}</span>
          <span class="ba__tag ba__tag--r">${tag("ba.after")}</span>
          <span class="ba__handle" aria-hidden="true"><span class="ba__knob">${icon("handle")}</span></span>
          <input class="ba__range" type="range" min="0" max="100" value="50" step="1" ${A("aria-label", "a11y.slider")}>
        </div>
      </div>
    </section>

    <!-- 03 ÜBER MICH -->
    <section class="sec sec--dark sec--about" id="about" aria-labelledby="about-title">
      <div class="container about">
        <div class="about__photo" data-reveal><img src="assets/img/hanna.jpg" width="899" height="1200" loading="lazy" decoding="async" ${A("alt", "about.alt")}></div>
        <div class="about__text">
          <div class="about__top">
            <div class="sec-head" data-reveal>
              <p class="eyebrow"><span class="eyebrow__num">03</span><span class="eyebrow__line" aria-hidden="true"></span>${T("span", "about.eyebrow")}</p>
              ${T("h2", "about.title", 'class="t-h2" id="about-title"')}
            </div>
            ${T("blockquote", "about.quote", 'class="quote" data-reveal')}
            <p class="about__bio" data-reveal>${T("strong", "about.hello")}<br>${T("span", "about.bio")}</p>
          </div>
          <div class="about__bottom">
            <ul class="stats">
              ${[1, 2, 3, 4].map((n, i) => `<li class="stat" data-reveal style="--i:${i}">${T("span", `about.stat${n}n`, 'class="stat__n"')}${T("span", `about.stat${n}`, 'class="stat__l"')}</li>`).join("")}
            </ul>
            <div class="about__cta" data-reveal>${ctaPair("cta.book", "dark", { row: true, tgKey: "cta.telegramShort", msg: "wa.message" })}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 04 ABLAUF -->
    <section class="sec sec--light" id="process" aria-labelledby="process-title">
      <div class="container">
        <div class="sec-head" data-reveal>
          <p class="eyebrow"><span class="eyebrow__num">04</span><span class="eyebrow__line" aria-hidden="true"></span>${T("span", "process.eyebrow")}</p>
          ${T("h2", "process.title", 'class="t-h2" id="process-title"')}
        </div>
        <ol class="steps">
          ${[1, 2, 3].map((n, i) => `<li class="step" data-reveal style="--i:${i}"><span class="step__n" aria-hidden="true">0${n}</span>${T("h3", `process.s${n}t`, 'class="step__t"')}${T("p", `process.s${n}`, 'class="step__p"')}</li>`).join("")}
        </ol>
      </div>
    </section>

    <!-- 05 LEISTUNGEN -->
    <section class="sec sec--dark" id="services" aria-labelledby="services-title">
      <div class="container">
        <div class="sec-top">
          <div class="sec-head" data-reveal>
            <p class="eyebrow"><span class="eyebrow__num">05</span><span class="eyebrow__line" aria-hidden="true"></span>${T("span", "services.eyebrow")}</p>
            ${T("h2", "services.title", 'class="t-h2" id="services-title"')}
            <p class="t-sub">${T("span", "services.text", 'class="only-mob"')}${T("span", "services.textDesk", 'class="only-desk"')}</p>
          </div>
          <div class="arrows" data-arrows="services">
            <button class="icon-btn icon-btn--ring" type="button" data-dir="-1" ${A("aria-label", "a11y.prev")}>${icon("arrow-l")}</button>
            <button class="icon-btn icon-btn--ring" type="button" data-dir="1" ${A("aria-label", "a11y.next")}>${icon("arrow")}</button>
          </div>
        </div>
      </div>
      <div class="carousel" data-carousel="services" data-reveal>
        <ul class="carousel__track scards">${services.map(serviceCard).join("")}
        </ul>
      </div>
      <div class="dots" data-dots="services" aria-hidden="true"></div>
    </section>

    <!-- 06 PREISE -->
    <section class="sec sec--light" id="prices" aria-labelledby="prices-title">
      <div class="container prices">
        <div class="prices__head sec-head" data-reveal>
          <p class="eyebrow"><span class="eyebrow__num">06</span><span class="eyebrow__line" aria-hidden="true"></span>${T("span", "prices.eyebrow")}</p>
          ${T("h2", "prices.title", 'class="t-h2" id="prices-title"')}
        </div>
        <div class="prices__list" data-reveal>
          <ul class="price-list">${mainPrices}
          </ul>
          <div class="all-prices">
            <button class="acc-head all-prices__toggle" type="button" aria-expanded="false" aria-controls="all-prices">${T("span", "prices.more", "data-when-closed")}${T("span", "prices.less", "data-when-open")}<span class="pm" aria-hidden="true"></span></button>
            <div class="collapse" id="all-prices"><div class="collapse__in"><div class="price-groups">${groups}
            </div></div></div>
          </div>
        </div>
        <div class="prices__know" data-reveal>
          ${T("h3", "prices.know", 'class="t-eyebrow know__label"')}
          <ul class="know">
            ${[1, 2, 3, 4].map((n) => `<li>${T("p", `prices.k${n}t`, 'class="know__t"')}${T("p", `prices.k${n}`, 'class="know__p"')}</li>`).join("")}
          </ul>
        </div>
        <div class="prices__cta" data-reveal>${ctaPair("cta.book", "light", { msg: "wa.message", full: true })}</div>
      </div>
    </section>

    ${SHOW_REVIEWS ? `    <!-- 07 BEWERTUNGEN -->
    <section class="sec sec--surface" id="reviews" aria-labelledby="reviews-title">
      <div class="container">
        <div class="sec-top">
          <div class="sec-head" data-reveal>
            <p class="eyebrow"><span class="eyebrow__num">07</span><span class="eyebrow__line" aria-hidden="true"></span>${T("span", "reviews.eyebrow")}</p>
            ${T("h2", "reviews.title", 'class="t-h2" id="reviews-title"')}
            ${T("p", "reviews.text", 'class="t-sub"')}
          </div>
          <p class="rating" data-reveal>${T("strong", "reviews.score", 'class="rating__score"')}${icon("star", "ic star")}${T("span", "reviews.count", 'class="rating__count"')}</p>
        </div>
      </div>
      <div class="carousel carousel--reviews" data-carousel="reviews" data-reveal>
        <ul class="carousel__track rcards">${reviews}
        </ul>
      </div>
      <div class="container reviews__nav">
        <div class="dots" data-dots="reviews" aria-hidden="true"></div>
        <div class="arrows arrows--light" data-arrows="reviews">
          <button class="icon-btn icon-btn--ring" type="button" data-dir="-1" ${A("aria-label", "a11y.prev")}>${icon("arrow-l")}</button>
          <button class="icon-btn icon-btn--ring" type="button" data-dir="1" ${A("aria-label", "a11y.next")}>${icon("arrow")}</button>
        </div>
      </div>
      <div class="container"><a class="tlink tlink--on-light" href="${esc(CFG.googleReviewsUrl)}" target="_blank" rel="noopener" data-google>${T("span", "reviews.google")}${icon("ext")}</a></div>
    </section>
` : ""}

    <!-- 08 INSTAGRAM -->
    <section class="sec sec--dark" id="instagram" aria-labelledby="insta-title">
      <div class="container">
        <div class="sec-top">
          <div class="sec-head" data-reveal>
            <p class="eyebrow"><span class="eyebrow__num">${NUM.instagram}</span><span class="eyebrow__line" aria-hidden="true"></span>${T("span", "insta.eyebrow")}</p>
            ${T("h2", "insta.title", 'class="t-h2" id="insta-title"')}
            ${T("p", "insta.text", 'class="t-sub"')}
          </div>
          <a class="btn btn--secondary btn--on-dark insta__cta insta__cta--top" href="${igHref}" target="_blank" rel="noopener" data-ig>${icon("ig")}${T("span", "insta.cta")}</a>
        </div>
        <ul class="tiles">${tiles}
        </ul>
        <a class="btn btn--secondary btn--on-dark btn--block insta__cta insta__cta--bottom" href="${igHref}" target="_blank" rel="noopener" data-ig>${icon("ig")}${T("span", "insta.cta")}</a>
      </div>
    </section>

    <!-- 09 FAQ -->
    <section class="sec sec--light" id="faq" aria-labelledby="faq-title">
      <div class="container faq">
        <div class="faq__info">
        <div class="faq__head sec-head" data-reveal>
          <p class="eyebrow"><span class="eyebrow__num">${NUM.faq}</span><span class="eyebrow__line" aria-hidden="true"></span>${T("span", "faq.eyebrow")}</p>
          ${T("h2", "faq.title", 'class="t-h2" id="faq-title"')}
        </div>
        <div class="faq__more" data-reveal>
          ${T("h3", "faq.moreTitle", 'class="t-h3"')}
          ${T("p", "faq.moreText", 'class="faq__more-text"')}
          <div class="cta-pair">
            ${btnWa("faq.moreCta", { variant: "secondary", theme: "light", msg: "wa.question" })}
            ${linkTg("cta.telegram", "light")}
          </div>
        </div>
        </div>
        <ul class="faq__list" data-reveal>${faqs}
        </ul>
      </div>
    </section>
  </main>

  ${footer(true)}

  <!-- Schwebender WhatsApp-Button (nur Smartphone/Tablet) -->
  <a class="fab-wa" href="${waHref}" target="_blank" rel="noopener" data-wa data-wa-msg="wa.message" data-fab ${A("aria-label", "fab.label")}>${icon("wa")}</a>
  ${scripts}
</body>
</html>
`;

/* ---------- legal pages ---------- */
const legal = (file, titleKey, leadKey, todoKey) => `${docHead(titleKey, "meta.description", '<meta name="robots" content="noindex">')}
<body id="top" class="page-legal">
  ${sprite}
  ${header(false)}
  <main id="main" class="sec sec--light legal">
    <div class="container legal__in">
      <a class="tlink tlink--on-light legal__back" href="index.html">${icon("arrow-l")}${T("span", "legal.back")}</a>
      ${T("h1", titleKey, 'class="t-h2"')}
      ${T("p", leadKey, 'class="t-lead"')}
      ${file === "impressum.html" ? `<address class="legal__addr">${T("span", "imp.name")}<br>${T("span", "imp.street")}<br>${T("span", "imp.city")}</address>
      ${T("p", "imp.contact")}` : ""}
      ${T("p", todoKey, 'class="legal__todo"')}
    </div>
  </main>
  ${footer(false)}
  ${scripts}
</body>
</html>
`;

fs.writeFileSync(__dirname + "/index.html", index);
fs.writeFileSync(__dirname + "/impressum.html", legal("impressum.html", "imp.title", "imp.lead", "imp.todo"));
fs.writeFileSync(__dirname + "/datenschutz.html", legal("datenschutz.html", "priv.title", "priv.lead", "priv.todo"));
console.log("Built index.html, impressum.html, datenschutz.html");
