/* Studio Porządku — interakcje (v2) */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobilne menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.innerWidth <= 900) links.classList.remove("open");
      });
    });
  }

  /* ---------- Nagłówek: cień / zmniejszenie przy scrollu ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

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

  /* ---------- Scroll reveal ---------- */
  // Elementy znajdujące się głównie poniżej pierwszego ekranu — bez ryzyka migotania.
  var revealSelectors = [
    ".section-head",
    ".card",
    ".split > div",
    ".steps",
    ".cta-band",
    ".faq details",
    ".price-table",
    ".info-list",
    ".feature-list",
    "form"
  ];
  var revealEls = [];
  revealSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.closest(".hero")) return; // hero ma własną animację
      revealEls.push(el);
    });
  });

  // Stagger dla elementów w tej samej siatce
  revealEls.forEach(function (el) {
    el.classList.add("reveal");
    var parent = el.parentElement;
    if (parent && parent.classList.contains("grid")) {
      var idx = Array.prototype.indexOf.call(parent.children, el);
      var d = (idx % 6) + 1;
      el.classList.add("reveal-delay-" + d);
    }
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Animowane liczniki ---------- */
  function animateCount(el) {
    var raw = (el.textContent || "").trim();
    var m = raw.match(/^(\D*)([\d][\d\s.,]*)(\D*)$/);
    if (!m) return;
    var prefix = m[1];
    var target = parseInt(m[2].replace(/[\s.,]/g, ""), 10);
    var suffix = m[3];
    if (isNaN(target) || target === 0) return;
    var dur = 1400, start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased).toLocaleString("pl-PL") + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toLocaleString("pl-PL") + suffix;
    }
    requestAnimationFrame(tick);
  }

  var counters = [];
  document.querySelectorAll(".hero-badges .badge strong").forEach(function (el) { counters.push(el); });
  document.querySelectorAll(".card.text-center > div:first-child").forEach(function (el) { counters.push(el); });

  if (!reduceMotion && counters.length && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Przycisk „do góry" ---------- */
  var toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Wróć na górę");
  toTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(toTop);
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
  function onScrollTop() {
    toTop.classList.toggle("is-visible", window.scrollY > 600);
  }
  onScrollTop();
  window.addEventListener("scroll", onScrollTop, { passive: true });
})();
