/* Studio Porządku — interakcje (v6) */
(function () {
  "use strict";

  /* ---------- Nagłówek + jego wysokość (dla panelu menu) ---------- */
  var header = document.querySelector(".site-header");
  function setHeaderH() {
    if (header) {
      document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
    }
  }
  setHeaderH();
  window.addEventListener("resize", setHeaderH);
  window.addEventListener("load", setHeaderH);

  /* ---------- Mobilne menu (panel pod nagłówkiem) ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  var backdrop = null;

  if (toggle && links) {
    backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    document.body.appendChild(backdrop);

    var scrollY = 0;

    // blokada przewijania tla BEZ zmiany layoutu: blokujemy touchmove poza szuflada
    var preventBgScroll = function (e) {
      if (links.contains(e.target)) return; // wewnatrz szuflady przewijanie dozwolone
      e.preventDefault();
    };

    var openMenu = function () {
      setHeaderH();
      links.classList.add("open");
      backdrop.classList.add("show");
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
      document.addEventListener("touchmove", preventBgScroll, { passive: false });
    };
    var closeMenu = function () {
      links.classList.remove("open");
      backdrop.classList.remove("show");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      document.removeEventListener("touchmove", preventBgScroll, { passive: false });
    };

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      if (links.classList.contains("open")) closeMenu();
      else openMenu();
    });

    backdrop.addEventListener("click", closeMenu);

    // klik w link wewnątrz drawera -> zamknij na mobile
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.innerWidth <= 900) closeMenu();
      });
    });

    // ESC zamyka
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) closeMenu();
    });

    // resize z mobile -> desktop: czyste zamknięcie
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && links.classList.contains("open")) closeMenu();
    });

    // gest: przeciagniecie szuflady w lewo zamyka ja (z odczuciem kontroli pod palcem)
    var sx = 0, sy = 0, sdx = 0, sDecided = "", sDrag = false;
    links.addEventListener("touchstart", function (e) {
      if (!links.classList.contains("open")) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      sdx = 0; sDecided = ""; sDrag = false;
    }, { passive: true });
    links.addEventListener("touchmove", function (e) {
      if (!links.classList.contains("open")) return;
      var dx = e.touches[0].clientX - sx;
      var dy = e.touches[0].clientY - sy;
      if (!sDecided && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        sDecided = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (sDecided === "x") { sDrag = true; links.style.transition = "none"; }
      }
      if (sDrag) {
        sdx = Math.min(0, dx);            // tylko w lewo
        links.style.transform = "translateX(" + sdx + "px)";
      }
    }, { passive: true });
    var endDrag = function () {
      if (!sDrag) return;
      sDrag = false;
      links.style.transition = "";       // przywroc animacje CSS (snap / zamkniecie)
      links.style.transform = "";
      var w = links.offsetWidth || 300;
      if (sdx < -Math.min(90, w * 0.33)) closeMenu();
    };
    links.addEventListener("touchend", endDrag, { passive: true });
    links.addEventListener("touchcancel", endDrag, { passive: true });
  }

  /* ---------- Aktualny rok w stopce ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Formularz kontaktowy (demo) ---------- */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = form.querySelector(".form-success");
      if (ok) ok.style.display = "block";
      form.reset();
      if (ok) ok.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---------- Cień nagłówka po przewinięciu ---------- */

  /* ---------- Przycisk "do góry" ---------- */
  var toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Przewiń do góry");
  toTop.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.body.appendChild(toTop);

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    toTop.classList.toggle("show", window.scrollY > 400);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Animacje pojawiania się ---------- */
  var revealSelectors = [
    ".section-head",
    ".grid > *",
    ".split > div",
    ".steps",
    ".price-table",
    ".faq details",
    ".cta-band",
    ".info-list",
    "#contact-form",
    "h2",
  ];
  var items = document.querySelectorAll(revealSelectors.join(","));
  if ("IntersectionObserver" in window && items.length) {
    items.forEach(function (el) {
      if (el.closest(".site-header") || el.closest(".site-footer")) return;
      el.classList.add("reveal");
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Poświata kart podążająca za kursorem (desktop) ---------- */
  if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Animowane liczniki statystyk ---------- */
  function animateCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    var original = el.innerHTML;
    var raw = (el.textContent || "").trim();
    var m = raw.match(/(\d+(?:[.,]\d+)?)/);
    if (!m) return;
    if (reduce) return; // przy reduced-motion zostawiamy wartosc docelowa
    var numStr = m[1];
    var decimals = /[.,]/.test(numStr) ? 1 : 0;
    var target = parseFloat(numStr.replace(",", "."));
    var prefix = raw.slice(0, m.index);
    var suffix = raw.slice(m.index + numStr.length);
    var dur = 1500;
    var startTs = null;
    el.classList.add("counting");
    function fmt(v) {
      return decimals ? v.toFixed(1).replace(".", ",") : Math.round(v).toString();
    }
    function tick(ts) {
      if (!startTs) startTs = ts;
      var p = Math.min((ts - startTs) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else { el.innerHTML = original; el.classList.remove("counting"); }
    }
    requestAnimationFrame(tick);
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Suwak "przed / po" ---------- */
  document.querySelectorAll("[data-compare]").forEach(function (c) {
    var range = c.querySelector(".compare-range");
    if (!range) return;
    var sync = function () { c.style.setProperty("--pos", range.value + "%"); };
    range.addEventListener("input", sync);
    sync();
  });

  var statsSection = document.querySelector(".section--stats");
  if (statsSection && "IntersectionObserver" in window) {
    var statsIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            statsSection.querySelectorAll(".stat-card .num").forEach(animateCounter);
            statsIo.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    statsIo.observe(statsSection);
  }
})();



/* =========================================================
   Lightbox — podglad zdjec (realizacje, certyfikaty, galeria)
   ========================================================= */
(function () {
  "use strict";

  /* Auto-tagowanie znanych galerii (bez recznych atrybutow w HTML) */
  document.querySelectorAll(".realizacje .slide-media img").forEach(function (img) {
    if (img.hasAttribute("data-lightbox")) return;
    img.setAttribute("data-lightbox", "realizacje");
    var cap = img.closest(".slide") && img.closest(".slide").querySelector(".slide-cap");
    if (cap && !img.getAttribute("data-caption")) {
      img.setAttribute("data-caption", cap.textContent.replace(/\s+/g, " ").trim());
    }
  });
  document.querySelectorAll(".cert-card .cert-thumb img").forEach(function (img) {
    if (img.hasAttribute("data-lightbox")) return;
    img.setAttribute("data-lightbox", "certyfikaty");
    var h = img.closest(".cert-card") && img.closest(".cert-card").querySelector("h3");
    if (h && !img.getAttribute("data-caption")) img.setAttribute("data-caption", h.textContent.trim());
  });
  document.querySelectorAll(".galeria-grid img").forEach(function (img) {
    if (!img.hasAttribute("data-lightbox")) img.setAttribute("data-lightbox", "galeria");
  });

  var triggers = document.querySelectorAll("[data-lightbox]");
  if (!triggers.length) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Budowa nakladki */
  var ov = document.createElement("div");
  ov.className = "lightbox";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-modal", "true");
  ov.setAttribute("aria-hidden", "true");
  ov.innerHTML =
    '<button class="lightbox-close" type="button" aria-label="Zamknij podglad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
    '<button class="lightbox-nav lightbox-prev" type="button" aria-label="Poprzednie zdjecie"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>' +
    '<figure class="lightbox-figure"><img alt=""><figcaption></figcaption></figure>' +
    '<button class="lightbox-nav lightbox-next" type="button" aria-label="Nastepne zdjecie"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>';
  document.body.appendChild(ov);

  var imgEl = ov.querySelector("img");
  var capEl = ov.querySelector("figcaption");
  var btnClose = ov.querySelector(".lightbox-close");
  var btnPrev = ov.querySelector(".lightbox-prev");
  var btnNext = ov.querySelector(".lightbox-next");

  var items = [], current = -1, lastFocus = null;

  function group(name) {
    return Array.prototype.slice.call(document.querySelectorAll('[data-lightbox="' + name + '"]'));
  }
  function srcOf(el) {
    return el.getAttribute("data-full") || (el.tagName === "IMG" ? el.currentSrc || el.src : "");
  }
  function capOf(el) {
    return el.getAttribute("data-caption") || (el.tagName === "IMG" ? el.alt : "") || "";
  }
  function render() {
    var el = items[current];
    if (!el) return;
    imgEl.src = srcOf(el);
    imgEl.alt = capOf(el);
    capEl.textContent = capOf(el);
    var multi = items.length > 1;
    btnPrev.style.display = multi ? "" : "none";
    btnNext.style.display = multi ? "" : "none";
  }
  function openAt(name, index) {
    items = group(name);
    if (!items.length) return;
    current = index < 0 ? 0 : index;
    lastFocus = document.activeElement;
    render();
    ov.classList.add("open");
    ov.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    btnClose.focus();
  }
  function close() {
    ov.classList.remove("open");
    ov.setAttribute("aria-hidden", "true");
    imgEl.removeAttribute("src");
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function step(d) {
    if (items.length < 2) return;
    current = (current + d + items.length) % items.length;
    render();
  }

  /* Rozroznienie kliku od przeciagniecia (slider realizacji) */
  var downX = 0, downY = 0;
  document.addEventListener("pointerdown", function (e) { downX = e.clientX; downY = e.clientY; }, true);

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-lightbox]");
    if (!t) return;
    if (Math.abs(e.clientX - downX) > 8 || Math.abs(e.clientY - downY) > 8) return; // to byl drag
    e.preventDefault();
    var name = t.getAttribute("data-lightbox");
    openAt(name, group(name).indexOf(t));
  });

  ov.addEventListener("click", function (e) { if (e.target === ov || e.target === ov.querySelector(".lightbox-figure")) close(); });
  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", function () { step(-1); });
  btnNext.addEventListener("click", function () { step(1); });
  document.addEventListener("keydown", function (e) {
    if (!ov.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  /* Gest swipe na mobile w obrebie nakladki */
  var tsX = 0;
  ov.addEventListener("touchstart", function (e) { tsX = e.changedTouches[0].clientX; }, { passive: true });
  ov.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - tsX;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  }, { passive: true });
})();



/* =========================================================
   Logo w banerze CTA (prawy gorny rog) + kontakt social w stopce
   ========================================================= */
(function () {
  "use strict";

  // sciezka do bialego logo bierzemy ze stopki (poprawna na kazdej podstronie)
  var footerLogo = document.querySelector(".footer-brand img");
  var logoSrc = footerLogo ? footerLogo.getAttribute("src") : null;

  if (logoSrc) {
    document.querySelectorAll(".cta-band").forEach(function (b) {
      if (b.querySelector(".cta-logo")) return;
      var img = document.createElement("img");
      img.className = "cta-logo";
      img.src = logoSrc;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      b.appendChild(img);
    });
  }

  var fb = document.querySelector(".footer-brand");
  if (fb && !fb.querySelector(".footer-social")) {
    var s = document.createElement("div");
    s.className = "footer-social";
    s.innerHTML =
      '<a href="https://www.facebook.com/StudioPorzadku" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7h2.3l.4-2.9h-2.7V9.3c0-.84.26-1.4 1.46-1.4H16.3V5.3A20 20 0 0 0 14.2 5.2c-2.1 0-3.5 1.27-3.5 3.6v2.3H8.3V14h2.4v7z"/></svg></a>' +
      '<a href="https://www.instagram.com/studio_porzadku/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>' +
      '<a href="https://wa.me/48506507171" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 1.76.46 3.45 1.34 4.95L2 22l5.3-1.39a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.45 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2zm0 1.8c2.16 0 4.18.84 5.71 2.37a8.03 8.03 0 0 1 2.37 5.72c0 4.46-3.63 8.09-8.1 8.09a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.04 8.04 0 0 1-1.25-4.32c0-4.46 3.63-8.09 8.1-8.09zm-3.06 4.3c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.14 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46z"/></svg></a>';
    fb.appendChild(s);
  }
})();
