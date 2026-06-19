/* =========================================================
   enhance.js · chirurgiczne mikro-interakcje (progresywne)
   Custom cursor + magnetyzm · 3D tilt · kinetyczny toggle cennika.
   GSAP uzywany gdy dostepny; pelny fallback vanilla. Tresc nie zalezy od JS.
   ========================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var hasGSAP = !!window.gsap;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- CUSTOM CURSOR + magnetyzm ---------- */
  if (fine && !reduce) {
    var cur = document.createElement("div");
    cur.className = "cur";
    cur.innerHTML = '<span class="cur__ring"></span><span class="cur__dot"></span>';
    document.body.appendChild(cur);
    document.body.classList.add("cursor-on");
    var ring = cur.querySelector(".cur__ring");
    var dot = cur.querySelector(".cur__dot");

    var rx, ry;
    if (hasGSAP) {
      var qRX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
      var qRY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
      var qDX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2" });
      var qDY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2" });
      gsap.set([ring, dot], { xPercent: -50, yPercent: -50 });
      window.addEventListener("pointermove", function (e) {
        qRX(e.clientX); qRY(e.clientY); qDX(e.clientX); qDY(e.clientY);
      });
    } else {
      var mx = innerWidth / 2, my = innerHeight / 2, rxv = mx, ryv = my, raf;
      window.addEventListener("pointermove", function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = "translate3d(" + mx + "px," + my + "px,0) translate(-50%,-50%)";
        if (!raf) raf = requestAnimationFrame(loop);
      });
      function loop() {
        rxv += (mx - rxv) * 0.18; ryv += (my - ryv) * 0.18;
        ring.style.transform = "translate3d(" + rxv + "px," + ryv + "px,0) translate(-50%,-50%)";
        if (Math.abs(mx - rxv) > 0.5 || Math.abs(my - ryv) > 0.5) { raf = requestAnimationFrame(loop); }
        else raf = null;
      }
    }

    var hot = "a, button, [data-magnetic], [data-tilt], .plan__cta, .cert, summary, input, label";
    document.addEventListener("pointerover", function (e) {
      if (e.target.closest && e.target.closest(hot)) cur.classList.add("is-hot");
    });
    document.addEventListener("pointerout", function (e) {
      if (e.target.closest && e.target.closest(hot)) cur.classList.remove("is-hot");
    });
    document.addEventListener("pointerdown", function () { cur.classList.add("is-down"); });
    document.addEventListener("pointerup", function () { cur.classList.remove("is-down"); });
  }

  /* ---------- 3D TILT na kartach ---------- */
  if (fine && !reduce) {
    $$("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.getAttribute("data-tilt")) || 8;
      var qX, qY;
      if (hasGSAP) {
        qX = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
        qY = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
        gsap.set(el, { transformPerspective: 900, transformOrigin: "center" });
      }
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        if (hasGSAP) { qX(nx * max); qY(-ny * max); }
        else el.style.transform = "perspective(900px) rotateY(" + (nx * max) + "deg) rotateX(" + (-ny * max) + "deg)";
      });
      el.addEventListener("pointerleave", function () {
        if (hasGSAP) { gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.7, ease: "elastic.out(1,0.5)" }); }
        else el.style.transform = "";
      });
    });
  }

  /* ---------- HAPTIC: sprezysty pop przy klikniaciu (GSAP) ---------- */
  if (hasGSAP && !reduce) {
    var tap = $$(".plan__cta, .cta-glow, .btn");
    tap.forEach(function (el) {
      el.addEventListener("pointerdown", function () { gsap.to(el, { scale: 0.95, duration: 0.12, ease: "power2.out", overwrite: true }); });
      var up = function () { gsap.to(el, { scale: 1, duration: 0.6, ease: "back.out(3)", overwrite: true }); };
      el.addEventListener("pointerup", up);
      el.addEventListener("pointerleave", up);
    });
  }

  /* ---------- KINETYCZNY TOGGLE CENNIKA ---------- */
  var sw = document.querySelector("[data-switch]");
  if (sw) {
    var btns = $$("button", sw);
    var amounts = $$("[data-month]");
    function animNum(el, to) {
      var from = parseInt(el.textContent.replace(/\D/g, ""), 10) || 0;
      if (reduce || !hasGSAP) { el.textContent = to; return; }
      var obj = { v: from };
      gsap.to(obj, { v: to, duration: 0.6, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(obj.v); } });
    }
    function setPeriod(year) {
      sw.classList.toggle("is-year", year);
      btns.forEach(function (b) { b.classList.toggle("is-on", (b.getAttribute("data-period") === "year") === year); });
      amounts.forEach(function (el) { animNum(el, parseInt(el.getAttribute(year ? "data-year" : "data-month"), 10)); });
      var save = document.querySelector(".pricing__save");
      if (save) save.classList.toggle("show", year);
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { setPeriod(b.getAttribute("data-period") === "year"); }); });
  }

  /* ---------- CENNIK: selektor 9 kategorii + plynne przejscia ---------- */
  var cp = document.querySelector("[data-cprice]");
  if (cp) {
    var tabs = $$(".cp-tab", cp);
    var panels = $$(".cp-panel", cp);
    var curCat = null;

    var showCat = function (id) {
      if (id === curCat) return;
      curCat = id;
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-cat") === id;
        t.classList.toggle("is-on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach(function (p) {
        var on = p.getAttribute("data-cat") === id;
        if (!on) { p.classList.remove("is-active"); return; }
        p.classList.add("is-active");
        // zamknij otwarte akordeony przy zmianie kategorii
        $$(".acc.is-open", p).forEach(function (a) {
          a.classList.remove("is-open");
          var b = a.querySelector(".acc__btn");
          if (b) b.setAttribute("aria-expanded", "false");
        });
        if (hasGSAP && !reduce) {
          gsap.killTweensOf(p);
          gsap.fromTo(p, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", clearProps: "transform" });
          var kids = $$(".cp-title, .cp-intro, .cp-row, .acc, .cp-cta, .cp-note", p);
          gsap.fromTo(kids, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.035, delay: 0.06, clearProps: "transform" });
        }
      });
    };

    tabs.forEach(function (t) {
      t.addEventListener("click", function () { showCat(t.getAttribute("data-cat")); });
    });
    if (tabs[0]) showCat(tabs[0].getAttribute("data-cat"));
  }

  /* ---------- generyczny akordeon (dodatki / detale) ---------- */
  $$(".acc__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var acc = btn.closest(".acc");
      if (!acc) return;
      var open = acc.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- rysowanie ptaszkow + reveal kart cennika (IO) ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    $$(".plan").forEach(function (p) { io.observe(p); });
  } else {
    $$(".plan").forEach(function (p) { p.classList.add("is-in"); });
  }
})();
