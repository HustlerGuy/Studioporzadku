/* Studio Porządku — interakcje (v6) */
(function () {
  "use strict";

  /* ---------- Mobilne menu (drawer) ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  var backdrop = null;

  if (toggle && links) {
    backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    document.body.appendChild(backdrop);

    var openMenu = function () {
      links.classList.add("open");
      backdrop.classList.add("show");
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
      // blokada przewijania: html + body (sam body nie wystarcza, dokument scrolluje przez <html>)
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    };
    var closeMenu = function () {
      links.classList.remove("open");
      backdrop.classList.remove("show");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
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
  var header = document.querySelector(".site-header");

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
})();
