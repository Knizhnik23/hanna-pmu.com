/* Hanna · PMU — интерактив и анимации. Без библиотек. */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  var I18N = window.I18N || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Language ---------- */
  var lang = store.get("lang") === "ru" ? "ru" : "de";
  function t(key) { var d = I18N[lang] || {}; return key in d ? d[key] : (I18N.de || {})[key] || ""; }

  function applyLang(next) {
    lang = next === "ru" ? "ru" : "de";
    var dict = I18N[lang];
    if (!dict) return;
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (k in dict) el.textContent = dict[k];
    });
    ["aria-label", "alt", "content", "title"].forEach(function (attr) {
      $$("[data-i18n-" + attr + "]").forEach(function (el) {
        var k = el.getAttribute("data-i18n-" + attr);
        if (k in dict) el.setAttribute(attr, dict[k]);
      });
    });
    $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
    updateLinks();
    store.set("lang", lang);
    document.dispatchEvent(new Event("langchange"));
  }
  $$(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });

  /* ---------- Contact links (WhatsApp with prefilled text) ---------- */
  function updateLinks() {
    $$("[data-wa]").forEach(function (a) {
      var msg;
      var service = a.getAttribute("data-wa-service");
      if (service) msg = t("wa.service").replace("{service}", t(service));
      else msg = t(a.getAttribute("data-wa-msg") || "wa.message");
      a.href = "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(msg);
    });
    $$("[data-tg]").forEach(function (a) { a.href = "https://t.me/" + CFG.telegram; });
    $$("[data-ig]").forEach(function (a) { a.href = "https://instagram.com/" + CFG.instagram; });
    $$("[data-google]").forEach(function (a) { a.href = CFG.googleReviewsUrl || "#"; });
    $$("[data-phone]").forEach(function (a) { a.textContent = CFG.phoneDisplay; });
    $$("[data-handle]").forEach(function (a) { a.textContent = "@" + CFG[a.getAttribute("data-handle")]; });
  }

  /* ---------- Header: solid after scroll ---------- */
  var header = $("[data-header]");
  function onScroll() {
    if (!header || header.classList.contains("header--solid")) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menu = $("[data-menu]");
  var burger = $("[data-menu-open]");
  var lastFocus = null;
  function openMenu() {
    if (!menu) return;
    lastFocus = document.activeElement;
    menu.hidden = false;
    document.body.classList.add("menu-open");
    burger && burger.setAttribute("aria-expanded", "true");
    requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add("is-open"); }); });
    var close = $("[data-menu-close]", menu); close && close.focus();
  }
  function closeMenu(restoreFocus) {
    if (!menu || menu.hidden) return;
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    burger && burger.setAttribute("aria-expanded", "false");
    setTimeout(function () { menu.hidden = true; }, reduceMotion ? 0 : 250);
    if (restoreFocus !== false && lastFocus) lastFocus.focus();
  }
  burger && burger.addEventListener("click", openMenu);
  $$("[data-menu-close]").forEach(function (b) { b.addEventListener("click", function () { closeMenu(); }); });
  $$(".menu__item", menu).forEach(function (a) { a.addEventListener("click", function () { closeMenu(false); }); });
  document.addEventListener("keydown", function (e) {
    if (!menu || menu.hidden) return;
    if (e.key === "Escape") closeMenu();
    if (e.key === "Tab") { /* focus trap */
      var f = $$("a[href],button:not([disabled])", menu).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  window.matchMedia("(min-width:1200px)").addEventListener("change", function (m) { if (m.matches) closeMenu(false); });

  /* ---------- Modal (Cookie-Einstellungen) ---------- */
  var modalLast = null;
  function openModal(m) {
    modalLast = document.activeElement;
    m.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { m.classList.add("is-open"); }); });
    var c = $("[data-modal-close]", m); c && c.focus();
  }
  function closeModal(m) {
    if (!m || m.hidden) return;
    m.classList.remove("is-open");
    setTimeout(function () { m.hidden = true; }, reduceMotion ? 0 : 250);
    modalLast && modalLast.focus();
  }
  $$("[data-modal-open]").forEach(function (b) {
    b.addEventListener("click", function () { var m = document.getElementById(b.getAttribute("data-modal-open")); m && openModal(m); });
  });
  $$("[data-modal]").forEach(function (m) {
    m.addEventListener("click", function (e) { if (e.target === m || e.target.closest("[data-modal-close]")) closeModal(m); });
    $$("[data-consent]", m).forEach(function (b) {
      b.addEventListener("click", function () { try { localStorage.setItem("consent", b.getAttribute("data-consent")); } catch (err) {} closeModal(m); });
    });
    m.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal(m);
      if (e.key === "Tab") {
        var f = $$("button:not([disabled]),a[href]", m);
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
  });

  /* ---------- Scroll spy (active section in nav and menu) ----------
     Active = last section whose top has passed the line just below the header.
     Works for any viewport height (the old 45 % band picked the next section on tall screens). */
  (function () {
    var spyLinks = $$("[data-spy]");
    var ids = spyLinks.map(function (a) { return a.getAttribute("data-spy"); }).filter(function (v, i, arr) { return arr.indexOf(v) === i; });
    var secs = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean).sort(function (x, y) { return x.compareDocumentPosition(y) & 4 ? -1 : 1; });
    if (!secs.length) return;
    var ticking = false;
    function update() {
      ticking = false;
      var line = (header ? header.offsetHeight : 80) + 40;
      var cur = null;
      secs.forEach(function (sec) { if (sec.getBoundingClientRect().top <= line) cur = sec.id; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) cur = secs[secs.length - 1].id;
      spyLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("data-spy") === cur); });
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  })();

  /* ---------- Accordions (FAQ, Details, Alle Preise) ---------- */
  $$(".acc-head").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("is-open", open);
    });
  });

  /* ---------- Service cards: all expanded cards get the same height ----------
     The tallest "Details" block sets a min-height for every card's details. */
  function equalDetails() {
    var dls = $$(".scard__details");
    if (!dls.length) return;
    dls.forEach(function (d) { d.style.minHeight = ""; });
    var max = 0;
    dls.forEach(function (d) { max = Math.max(max, d.scrollHeight); });
    var texts = $$(".scard__text"), tmax = 0;
    texts.forEach(function (t) { t.style.minHeight = ""; });
    texts.forEach(function (t) { tmax = Math.max(tmax, t.offsetHeight); });
    texts.forEach(function (t) { t.style.minHeight = tmax + "px"; });
    dls.forEach(function (d) { d.style.minHeight = max + "px"; });
  }
  equalDetails();
  window.addEventListener("resize", equalDetails);
  window.addEventListener("load", equalDetails);
  document.addEventListener("langchange", equalDetails);

  /* ---------- Carousels ---------- */
  $$("[data-carousel]").forEach(function (car) {
    var name = car.getAttribute("data-carousel");
    var items = $$(".carousel__track > li", car);
    var dotsBox = $('[data-dots="' + name + '"]');
    var arrows = $$('[data-arrows="' + name + '"] [data-dir]');
    var dots = [];
    if (dotsBox) {
      items.forEach(function () { var d = document.createElement("span"); dotsBox.appendChild(d); dots.push(d); });
    }
    function step() { return items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : car.clientWidth; }
    function update() {
      var i = Math.round(car.scrollLeft / step());
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === i); });
      var max = car.scrollWidth - car.clientWidth - 2;
      arrows.forEach(function (b) {
        var dir = +b.getAttribute("data-dir");
        b.disabled = dir < 0 ? car.scrollLeft <= 2 : car.scrollLeft >= max;
      });
    }
    arrows.forEach(function (b) {
      b.addEventListener("click", function () {
        car.scrollBy({ left: step() * +b.getAttribute("data-dir"), behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
    var raf;
    car.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* ---------- Before / After slider ---------- */
  $$("[data-ba]").forEach(function (ba) {
    var range = $(".ba__range", ba);
    var touched = false;
    function set(v) { ba.style.setProperty("--pos", v + "%"); }
    range.addEventListener("input", function () { touched = true; set(range.value); });
    /* Drag anywhere on the photo (not only on the tiny native thumb):
       horizontal swipe moves the handle, vertical swipe still scrolls the page. */
    var drag = null;
    function fromX(x) { var r = ba.getBoundingClientRect(); var v = Math.max(0, Math.min(100, (x - r.left) / r.width * 100)); range.value = Math.round(v); set(v.toFixed(2)); }
    ba.addEventListener("pointerdown", function (e) {
      if (e.button > 0) return;
      touched = true;
      drag = { x: e.clientX, y: e.clientY, active: e.pointerType === "mouse", id: e.pointerId };
      if (drag.active) { e.preventDefault(); ba.setPointerCapture(e.pointerId); fromX(e.clientX); ba.classList.add("is-dragging"); }
    });
    ba.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.active) {
        var dx = Math.abs(e.clientX - drag.x), dy = Math.abs(e.clientY - drag.y);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { drag = null; return; }          /* vertical → let the page scroll */
        drag.active = true; ba.setPointerCapture(e.pointerId); ba.classList.add("is-dragging");
      }
      fromX(e.clientX);
    });
    function end(e) {
      if (!drag) return;
      if (!drag.active && e.type === "pointerup") fromX(e.clientX);   /* tap = jump there */
      drag = null; ba.classList.remove("is-dragging");
    }
    ba.addEventListener("pointerup", end);
    ba.addEventListener("dragstart", function (e) { e.preventDefault(); });   /* no ghost image of the photo */
    ba.addEventListener("pointercancel", function () { drag = null; ba.classList.remove("is-dragging"); });
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    /* one-time hint: handle swings left-right and returns to center */
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      var start = null, dur = 1400;
      function frame(ts) {
        if (touched) return;
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var v = 50 + Math.sin(p * Math.PI * 2) * 16 * (1 - p * 0.35);
        set(v.toFixed(2));
        if (p < 1) requestAnimationFrame(frame); else { set(50); range.value = 50; }
      }
      setTimeout(function () { requestAnimationFrame(frame); }, 500);
    }, { threshold: 0.6 });
    io.observe(ba);
  });

  /* ---------- Reveal on scroll ---------- */
  var reveal = $$("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveal.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); ro.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveal.forEach(function (el) { ro.observe(el); });
  }

  /* ---------- Start ---------- */
  if (lang !== "de") applyLang(lang); else updateLinks();
  requestAnimationFrame(function () { document.body.classList.add("is-loaded"); });
})();
