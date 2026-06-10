/* Studio Porządku — interakcje */
(function () {
  "use strict";

  // Mobilne menu
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

  // Aktualny rok w stopce
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Obsługa formularza kontaktowego (demo, bez backendu)
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

  // Cień nagłówka po przewinięciu
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    if (toTop) toTop.classList.toggle("show", window.scrollY > 400);
  }

  // Przycisk "do góry"
  var toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Przewiń do góry");
  toTop.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.body.appendChild(toTop);

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Animacje pojawiania się przy przewijaniu
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
      // nie animuj elementów w nagłówku/stopce
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
