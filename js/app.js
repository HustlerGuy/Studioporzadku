/* =========================================================
   Studio Porzadku · Foundation interactions
   Magnetyzm · wskaznik nawigacji · pelnoekranowe menu ·
   staggered reveal · litery stopki. Vanilla, GPU-friendly.
   ========================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Magnetyzm (przyciaganie do kursora + spring powrot) ---------- */
  if (finePointer && !reduce) {
    $$("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.getAttribute("data-magnetic")) || 0.35;
      var label = el.querySelector(".btn__label");
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + (mx * strength) + "px," + (my * strength) + "px)";
        if (label) label.style.transform = "translate(" + (mx * strength * 0.4) + "px," + (my * strength * 0.4) + "px)";
      });
      var reset = function () {
        el.style.transform = "translate(0,0)";
        if (label) label.style.transform = "translate(0,0)";
      };
      el.addEventListener("pointerleave", reset);
      el.addEventListener("pointercancel", reset);
    });
  }

  /* ---------- 2a. Automatyczny active-state wg adresu URL ---------- */
  (function () {
    var path = location.pathname.replace(/index\.html$/, "");
    var isRoot = /\/Studioporzadku\/?$/.test(path) || path === "/";
    var svc = /(pralnia-dywanow|wypozyczalnia-karcher|ozonowanie|pranie-tapicerki-meblowej|pranie-wykladzin-dywanow|czyszczenie-mebli-skorzanych|pranie-tapicerki-samochodowej|mycie-okien-witryn|sprzatanie-biur)\//.test(path);
    $$(".nav__link[href], .drop__link[href], .menu__link[href], .menu__sub a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      var lp;
      try { lp = new URL(href, location.href).pathname.replace(/index\.html$/, ""); } catch (e) { return; }
      if (lp === path) a.classList.add("active");
    });
    if (svc) $$(".nav__drop-toggle, .menu__acc").forEach(function (t) { t.classList.add("active"); });
    if (isRoot) {
      var s = document.querySelector('.nav__link[href="#"]') || document.querySelector(".nav__list li:first-child .nav__link");
      if (s) s.classList.add("active");
    }
  })();

  /* ---------- 2b. Wskaznik aktywnego elementu nawigacji ---------- */
  var nav = $(".nav");
  if (nav) {
    var indicator = $(".nav__indicator", nav);
    var links = $$(".nav__link", nav);
    var active = nav.querySelector(".nav__link.active") || links[0];

    var moveTo = function (link) {
      if (!link || !indicator) return;
      var padL = parseFloat(getComputedStyle(link).paddingLeft) || 0;
      var padR = parseFloat(getComputedStyle(link).paddingRight) || 0;
      var w = link.offsetWidth - padL - padR;
      indicator.style.width = w + "px";
      indicator.style.transform = "translateX(" + (link.offsetLeft + padL) + "px)";
    };

    requestAnimationFrame(function () { moveTo(active); nav.classList.add("is-ready"); });
    links.forEach(function (link) {
      link.addEventListener("pointerenter", function () { moveTo(link); });
      link.addEventListener("focus", function () { moveTo(link); });
    });
    nav.addEventListener("pointerleave", function () { moveTo(active); });
    window.addEventListener("resize", function () { moveTo(active); });
  }

  /* ---------- 3. Header: szklo przy scrollu + chowanie w dol ---------- */
  var hdr = $(".hdr");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (hdr) {
      hdr.classList.toggle("is-scrolled", y > 10);
      var goingDown = y > lastY && y > 200;
      if (!document.body.classList.contains("menu-open")) {
        hdr.classList.toggle("is-hidden", goingDown);
      }
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 4. Menu mobilne (pelnoekranowe, blokada scrolla) ---------- */
  var burger = $(".burger");
  var menu = $(".menu");
  var lockY = 0;
  function lockScroll() {
    lockY = window.scrollY;
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.position = "fixed";
    document.body.style.top = (-lockY) + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    if (sbw > 0) document.body.style.paddingRight = sbw + "px";
  }
  function unlockScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.paddingRight = "";
    window.scrollTo(0, lockY);
  }
  function setMenu(open) {
    if (!menu || !burger) return;
    document.body.classList.toggle("menu-open", open);
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { lockScroll(); if (hdr) hdr.classList.remove("is-hidden"); }
    else { unlockScroll(); }
  }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"));
    });
    // akordeon "Uslugi" w menu mobilnym
    $$(".menu__acc", menu).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".has-acc");
        if (!item) return;
        var open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
    // klik w realny link (nie w toggle akordeonu) zamyka menu
    $$(".menu__link, .menu__foot a, .menu__sub a", menu).forEach(function (a) {
      if (a.classList.contains("menu__acc")) return;
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920 && menu.classList.contains("is-open")) setMenu(false);
    });

    /* stagger linkow menu: dol -> gora (ostatni wjezdza pierwszy) */
    var mItems = $$(".menu__item", menu);
    var n = mItems.length;
    mItems.forEach(function (it, i) {
      var link = it.querySelector(".menu__link");
      if (link) link.style.transitionDelay = (0.18 + (n - 1 - i) * 0.07) + "s";
    });
  }

  /* ---------- 5. Litery w olbrzymim hasle stopki ---------- */
  $$(".js-split").forEach(function (word) {
    var text = word.textContent;
    word.textContent = "";
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement("span");
      span.className = "ch";
      span.textContent = text[i];
      span.style.transitionDelay = (i * 0.035) + "s";
      frag.appendChild(span);
    }
    word.appendChild(frag);
  });

  /* ---------- 6. Reveal: kaskadowe wejscia + trigger stopki ---------- */
  if ("IntersectionObserver" in window) {
    /* stagger w grupach */
    $$("[data-reveal-group]").forEach(function (group) {
      var step = parseFloat(group.getAttribute("data-reveal-group")) || 0.09;
      $$("[data-reveal]", group).forEach(function (el, i) {
        el.style.transitionDelay = (i * step) + "s";
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    $$("[data-reveal]").forEach(function (el) { io.observe(el); });

    var ftr = $(".ftr");
    if (ftr) {
      var fio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { ftr.classList.add("is-in"); fio.disconnect(); } });
      }, { threshold: 0.25 });
      fio.observe(ftr);
    }
  } else {
    $$("[data-reveal]").forEach(function (el) { el.classList.add("is-in"); });
    var f = $(".ftr"); if (f) f.classList.add("is-in");
  }

  /* rok w stopce */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();



/* =========================================================
   HERO · text reveal (maska, rozne predkosci) · blask CTA · aurora
   ========================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* --- maskowane litery naglowka --- */
  function splitLine(line) {
    var nodes = Array.prototype.slice.call(line.childNodes);
    line.textContent = "";
    var add = function (ch, parent) {
      var s = document.createElement("span");
      s.className = "ch";
      s.textContent = ch === " " ? "\u00A0" : ch;
      parent.appendChild(s);
    };
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split("").forEach(function (ch) { add(ch, line); });
      } else if (node.nodeType === 1) {
        var wrap = node.cloneNode(false);   // zachowaj np. <em> + klase
        line.appendChild(wrap);
        (node.textContent || "").split("").forEach(function (ch) { add(ch, wrap); });
      }
    });
  }

  var title = $("[data-splitlines]");
  if (title) {
    $$(".line", title).forEach(splitLine);
    var chs = $$(".ch", title);
    chs.forEach(function (c, i) {
      var dur = (0.7 + Math.random() * 0.5).toFixed(2);   // rozna predkosc
      var del = (0.15 + i * 0.035 + Math.random() * 0.05).toFixed(2);
      c.style.setProperty("--du", dur + "s");
      c.style.setProperty("--dl", del + "s");
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { title.classList.add("is-ready"); });
    });
  }

  /* --- blask CTA podazajacy za kursorem --- */
  $$(".cta-glow").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty("--mx", (e.clientX - r.left) + "px");
      b.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* --- aurora reagujaca na kursor (parallax) --- */
  var hero = $(".hero");
  if (hero && fine && !reduce) {
    var px = 0, py = 0, raf = null;
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(function () {
        hero.style.setProperty("--px", px.toFixed(3));
        hero.style.setProperty("--py", py.toFixed(3));
        raf = null;
      });
    });
  }
})();
