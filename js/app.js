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

  /* ---------- inject: mobilny telefon->WhatsApp (prawa strefa) + duzy przycisk X w menu ---------- */
  (function () {
    var inner = document.querySelector(".hdr__inner");
    if (inner && !inner.querySelector(".hdr__call")) {
      var phoneSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
      var waSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 1.76.46 3.45 1.34 4.95L2 22l5.3-1.39a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.45 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2zm5.76 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.5-1.2-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5c-.1.2-.3.3-.1.6.1.3.7 1.1 1.4 1.8.9.8 1.7 1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.4.1.2.1.7-.1 1.3z"/></svg>';
      var a = document.createElement("a");
      a.className = "hdr__call";
      a.href = "https://wa.me/48506507171";
      a.setAttribute("aria-label", "Zadzwon lub napisz na WhatsApp: 506 507 171");
      a.setAttribute("data-magnetic", "0.25");
      a.innerHTML = '<span class="hdr__call-mask"><span class="ic ic--phone">' + phoneSvg + '</span><span class="ic ic--wa">' + waSvg + '</span></span>';
      inner.appendChild(a);
    }
    var menuEl = document.querySelector(".menu");
    if (menuEl && !menuEl.querySelector(".menu__close")) {
      var btn = document.createElement("button");
      btn.className = "menu__close";
      btn.type = "button";
      btn.setAttribute("aria-label", "Zamknij menu");
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
      menuEl.insertBefore(btn, menuEl.firstChild);
    }
  })();

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

  /* ---------- 3. Header: dynamiczny (bialy na hero) + szklo po scrollu + chowanie ---------- */
  var hdr = $(".hdr");
  var lastY = window.scrollY;
  var heroEl = document.querySelector(".subhero");   /* ciemny hero -> bialy header u gory */
  var heroH = heroEl ? heroEl.offsetHeight : 0;
  function recalcHero() { heroH = heroEl ? heroEl.offsetHeight : 0; }
  function onScroll() {
    var y = window.scrollY;
    if (hdr) {
      if (heroEl) {
        var th = Math.max(40, heroH - hdr.offsetHeight - 8);
        var overHero = y < th;
        hdr.classList.toggle("hdr--invert", overHero);   /* przezroczysty + bialy */
        hdr.classList.toggle("is-scrolled", !overHero);  /* szklo + ciemny dopiero pod hero */
      } else {
        hdr.classList.toggle("is-scrolled", y > 10);
      }
      var goingDown = y > lastY && y > 200;
      if (!document.body.classList.contains("menu-open")) {
        hdr.classList.toggle("is-hidden", goingDown);
      }
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { recalcHero(); onScroll(); });
  window.addEventListener("load", function () { recalcHero(); onScroll(); });
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
    var closeBtn = $(".menu__close", menu);
    if (closeBtn) closeBtn.addEventListener("click", function () { setMenu(false); });
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
