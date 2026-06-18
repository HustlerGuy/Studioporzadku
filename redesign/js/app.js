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

  /* ---------- 2. Wskaznik aktywnego elementu nawigacji ---------- */
  var nav = $(".nav");
  if (nav) {
    var indicator = $(".nav__indicator", nav);
    var links = $$(".nav__link", nav);
    var active = nav.querySelector(".nav__link.is-active") || links[0];

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
    $$(".menu__link, .menu__foot a", menu).forEach(function (a) {
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
