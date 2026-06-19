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




/* =========================================================
   REALIZACJE · hybrydowa galeria
   Przelacznik widoku (pigulka) · coverflow 3D (drag/klik) ·
   masonry reveal · pelnoekranowy lightbox z magnetycznymi strzalkami.
   GSAP gdy dostepny, pelny fallback vanilla. Tresc nie zalezy od JS.
   ========================================================= */
(function () {
  "use strict";
  var gallery = document.querySelector("[data-gallery]");
  if (!gallery) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = !!window.gsap;
  var q = function (s, c) { return (c || document).querySelector(s); };
  var qa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- dane (z DOM coverflow, zeby tresc istniala bez JS) ---------- */
  var cards = qa(".cf__card", gallery);
  var data = cards.map(function (card) {
    var img = card.querySelector("img");
    return { src: img.getAttribute("src"), title: card.getAttribute("data-title") || (img ? img.alt : ""), alt: img ? img.alt : "" };
  });
  var N = data.length;

  /* =========================================================
     1. PRZELACZNIK WIDOKU
     ========================================================= */
  var toggle = q(".gal__toggle", gallery);
  var knob = q(".gal__knob", gallery);
  var tgBtns = qa(".gal__tg-btn", toggle);
  var views = { slider: q(".gal__view--slider", gallery), grid: q(".gal__view--grid", gallery) };
  var currentView = "slider";
  var gridRevealed = false;

  function syncKnob(btn) {
    if (!knob || !btn) return;
    knob.style.width = btn.offsetWidth + "px";
    knob.style.transform = "translateX(" + (btn.offsetLeft - 6) + "px)";
  }

  function showView(name) {
    if (name === currentView) return;
    var outEl = views[currentView];
    var inEl = views[name];
    currentView = name;
    tgBtns.forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-view") === name); });
    syncKnob(toggle.querySelector(".gal__tg-btn.is-on"));

    var reveal = function () {
      inEl.hidden = false;
      if (name === "slider") { coverflow.layout(); coverflow.refreshTitle(); }
      if (name === "grid") { revealGrid(true); }
      if (hasGSAP && !reduce) {
        gsap.fromTo(inEl, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", clearProps: "transform" });
      }
    };

    if (hasGSAP && !reduce && outEl) {
      gsap.to(outEl, { opacity: 0, y: 14, duration: 0.32, ease: "power2.in", onComplete: function () { outEl.hidden = true; gsap.set(outEl, { clearProps: "all" }); reveal(); } });
    } else {
      if (outEl) outEl.hidden = true;
      reveal();
    }
  }

  tgBtns.forEach(function (b) {
    b.addEventListener("click", function () { showView(b.getAttribute("data-view")); });
  });
  // ustaw knob na starcie
  requestAnimationFrame(function () { syncKnob(toggle.querySelector(".gal__tg-btn.is-on") || tgBtns[0]); });
  window.addEventListener("resize", function () { syncKnob(toggle.querySelector(".gal__tg-btn.is-on") || tgBtns[0]); });

  /* =========================================================
     2. COVERFLOW 3D
     ========================================================= */
  var coverflow = (function () {
    var track = q(".cf__track", gallery);
    var titleEl = q(".cf__title", gallery);
    var countEl = q(".cf__count", gallery);
    var pos = 0;          // float pozycja (0..N-1)
    var active = 0;
    var gap = 0;

    function calcGap() {
      var cw = cards[0] ? cards[0].offsetWidth : 320;
      gap = Math.min(cw * 0.62, 260);
    }

    function render(p) {
      cards.forEach(function (card, i) {
        var o = i - p;
        var ao = Math.abs(o);
        var clamped = Math.max(-2.4, Math.min(2.4, o));
        var x = clamped * gap;
        var rotY = -clamped * 22;
        var sc = Math.max(0.62, 1 - ao * 0.16);
        var tz = -ao * 90;
        card.style.transform = "translate(-50%,-50%) translateX(" + x + "px) translateZ(" + tz + "px) rotateY(" + rotY + "deg) scale(" + sc + ")";
        card.style.zIndex = String(200 - Math.round(ao * 10));
        card.style.opacity = ao > 2.6 ? "0" : "1";
        var near = Math.round(p);
        card.classList.toggle("is-active", i === near);
      });
    }

    function refreshTitle() {
      var idx = Math.max(0, Math.min(N - 1, Math.round(pos)));
      if (titleEl) {
        titleEl.classList.remove("is-in");
        // reflow -> ponowne wyostrzenie
        void titleEl.offsetWidth;
        titleEl.textContent = data[idx] ? data[idx].title : "";
        requestAnimationFrame(function () { titleEl.classList.add("is-in"); });
      }
      if (countEl) { var p2 = function (n) { return (n < 10 ? "0" : "") + n; }; countEl.textContent = p2(idx + 1) + " / " + p2(N); }
    }

    function animateTo(target) {
      target = Math.max(0, Math.min(N - 1, target));
      active = target;
      if (hasGSAP && !reduce) {
        gsap.to(proxy, { p: target, duration: 0.75, ease: "power3.out", overwrite: true, onUpdate: function () { pos = proxy.p; render(pos); } });
      } else {
        proxy.p = target; pos = target; render(pos);
      }
      refreshTitle();
    }
    var proxy = { p: 0 };

    function layout() { calcGap(); render(pos); }

    /* klik w karte: aktywna -> lightbox, boczna -> na srodek */
    cards.forEach(function (card, i) {
      card.addEventListener("click", function () {
        if (Math.round(pos) === i) lightbox.open(i);
        else animateTo(i);
      });
    });

    /* DRAG · pointer-only, axis-lock, pointer capture (zero kolizji z pionowym scrollem) */
    var dragging = false, decided = false, horiz = false, startX = 0, startY = 0, startPos = 0, moved = false, pid = null;
    function down(e) {
      if (e.button != null && e.button !== 0) return;
      dragging = true; decided = false; horiz = false; moved = false; pid = e.pointerId;
      startX = e.clientX; startY = e.clientY; startPos = pos;
      if (hasGSAP) gsap.killTweensOf(proxy);
    }
    function move(e) {
      if (!dragging || (pid !== null && e.pointerId !== pid)) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (!decided) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;   // czekaj na wyrazny gest
        decided = true;
        horiz = Math.abs(dx) > Math.abs(dy);
        if (!horiz) { dragging = false; return; }            // gest pionowy -> oddaj scroll stronie
        track.classList.add("is-drag");
        try { track.setPointerCapture(pid); } catch (err) {}
      }
      moved = true;
      var p = startPos - dx / (gap || 220);
      pos = Math.max(-0.45, Math.min(N - 0.55, p));
      render(pos);
    }
    function up() {
      if (pid !== null) { try { track.releasePointerCapture(pid); } catch (err) {} }
      var wasHoriz = horiz;
      dragging = false; decided = false; horiz = false; pid = null;
      track.classList.remove("is-drag");
      if (wasHoriz) animateTo(Math.round(pos));
    }
    track.addEventListener("pointerdown", down);
    track.addEventListener("pointermove", move);
    track.addEventListener("pointerup", up);
    track.addEventListener("pointercancel", up);
    // blokuj klik tuz po przeciagnieciu
    cards.forEach(function (card) {
      card.addEventListener("click", function (e) { if (moved) { e.stopImmediatePropagation(); e.preventDefault(); moved = false; } }, true);
    });

    /* strzalki */
    var prev = q(".cf__arrow--prev", gallery);
    var next = q(".cf__arrow--next", gallery);
    if (prev) prev.addEventListener("click", function () { animateTo(active - 1); });
    if (next) next.addEventListener("click", function () { animateTo(active + 1); });

    /* klawiatura w widoku slider */
    document.addEventListener("keydown", function (e) {
      if (currentView !== "slider" || document.body.classList.contains("lb-open")) return;
      if (e.key === "ArrowLeft") animateTo(active - 1);
      else if (e.key === "ArrowRight") animateTo(active + 1);
    });

    calcGap();
    render(0);
    requestAnimationFrame(function () { refreshTitle(); });
    window.addEventListener("resize", layout);

    return { layout: layout, refreshTitle: refreshTitle, animateTo: animateTo };
  })();

  /* =========================================================
     3. MASONRY reveal
     ========================================================= */
  var masonTiles = qa(".mason__tile", gallery);
  function revealGrid(force) {
    if (gridRevealed && !force) return;
    gridRevealed = true;
    if (hasGSAP && !reduce) {
      gsap.killTweensOf(masonTiles);
      gsap.fromTo(masonTiles, { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.06, onComplete: function () { masonTiles.forEach(function (t) { t.classList.add("is-in"); t.style.transform = ""; t.style.opacity = ""; }); } });
    } else {
      masonTiles.forEach(function (t) { t.classList.add("is-in"); });
    }
  }
  masonTiles.forEach(function (t) {
    t.addEventListener("click", function () {
      var idx = parseInt(t.getAttribute("data-index"), 10) || 0;
      lightbox.open(idx);
    });
  });

  /* =========================================================
     4. LIGHTBOX
     ========================================================= */
  var lightbox = (function () {
    var lb = q("[data-lightbox]");
    if (!lb) return { open: function () {} };
    var imgEl = q(".lb__img", lb);
    var capEl = q(".lb__cap", lb);
    var btnClose = q(".lb__close", lb);
    var btnPrev = q(".lb__nav--prev", lb);
    var btnNext = q(".lb__nav--next", lb);
    var idx = 0;

    function set(i) {
      idx = (i + N) % N;
      var d = data[idx];
      if (hasGSAP && !reduce) {
        gsap.to(imgEl, { opacity: 0, duration: 0.16, onComplete: function () {
          imgEl.src = d.src; imgEl.alt = d.alt;
          gsap.fromTo(imgEl, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" });
        } });
      } else { imgEl.src = d.src; imgEl.alt = d.alt; }
      if (capEl) capEl.textContent = d.title;
    }

    function open(i) {
      set(i);
      lb.classList.add("is-open");
      document.body.classList.add("lb-open");
      lb.setAttribute("aria-hidden", "false");
      btnClose && btnClose.focus();
    }
    function close() {
      lb.classList.remove("is-open");
      document.body.classList.remove("lb-open");
      lb.setAttribute("aria-hidden", "true");
    }

    btnClose && btnClose.addEventListener("click", close);
    btnPrev && btnPrev.addEventListener("click", function () { set(idx - 1); });
    btnNext && btnNext.addEventListener("click", function () { set(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || (e.target.classList && e.target.classList.contains("lb__stage"))) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") set(idx - 1);
      else if (e.key === "ArrowRight") set(idx + 1);
    });

    return { open: open, close: close };
  })();
})();




/* =========================================================
   TEASER PRZED/PO (home) + FORMULARZ KONTAKTOWY
   Suwak z fizyka GSAP (waga/wyhamowanie) · mailto compose.
   ========================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = !!window.gsap;
  var qa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- BEFORE / AFTER ---------- */
  qa("[data-ba]").forEach(function (stage) {
    var handle = stage.querySelector(".ba__handle");
    var proxy = { v: 50 };
    var dragging = false;
    function render() {
      stage.style.setProperty("--pos", proxy.v + "%");
      if (handle) handle.setAttribute("aria-valuenow", Math.round(proxy.v));
    }
    function toTarget(v) {
      v = Math.max(0, Math.min(100, v));
      if (hasGSAP && !reduce) gsap.to(proxy, { v: v, duration: 0.6, ease: "power3.out", overwrite: true, onUpdate: render });
      else { proxy.v = v; render(); }
    }
    function posFromEvent(e) {
      var r = stage.getBoundingClientRect();
      var cx = (e.touches ? e.touches[0].clientX : e.clientX);
      return ((cx - r.left) / r.width) * 100;
    }
    var down = function (e) { dragging = true; stage.classList.add("is-drag"); toTarget(posFromEvent(e)); };
    var move = function (e) { if (!dragging) return; toTarget(posFromEvent(e)); if (e.cancelable && e.type === "touchmove") e.preventDefault(); };
    var up = function () { dragging = false; stage.classList.remove("is-drag"); };
    stage.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    stage.addEventListener("touchstart", down, { passive: true });
    stage.addEventListener("touchmove", move, { passive: false });
    stage.addEventListener("touchend", up);
    if (handle) {
      handle.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { toTarget(proxy.v - 4); e.preventDefault(); }
        else if (e.key === "ArrowRight") { toTarget(proxy.v + 4); e.preventDefault(); }
      });
      handle.addEventListener("click", function (e) { e.stopPropagation(); });
    }
    render();
  });

  /* ---------- FORMULARZ KONTAKTOWY (mailto compose, bez backendu) ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var statusEl = form.querySelector(".cform__status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (typeof form.reportValidity === "function" && !form.reportValidity()) return;
      var get = function (n) { var el = form.elements[n]; return el ? String(el.value).trim() : ""; };
      var name = get("name"), email = get("email"), phone = get("phone"), msg = get("message");
      var subject = "Zapytanie ze strony - " + (name || "Studio Porzadku");
      var body = [
        "Imie i nazwisko: " + name,
        "E-mail: " + email,
        "Telefon: " + phone,
        "",
        "Wiadomosc:",
        msg
      ].join("\n");
      window.location.href = "mailto:biuro@studioporzadku.pl?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      if (statusEl) { statusEl.textContent = "Otwieramy Twoj program pocztowy z gotowa wiadomoscia. Dziekujemy!"; statusEl.classList.add("is-ok"); }
    });
  }
})();




/* =========================================================
   MOBILNY TELEFON -> WHATSAPP · maskowany reveal (back.out)
   Hover (desktop) lub dlugie przytrzymanie (dotyk) odslania WhatsApp.
   ========================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = !!window.gsap;
  var el = document.querySelector(".hdr__call");
  if (!el) return;
  var phone = el.querySelector(".ic--phone");
  var wa = el.querySelector(".ic--wa");
  var armed = false, holdT = null;

  function arm() {
    if (armed) return; armed = true;
    if (hasGSAP && !reduce) {
      gsap.to(phone, { yPercent: -130, duration: 0.4, ease: "power3.in", overwrite: true });
      gsap.fromTo(wa, { yPercent: 130 }, { yPercent: 0, duration: 0.6, ease: "back.out(2.4)", overwrite: true });
    } else { el.classList.add("is-armed"); }
  }
  function disarm() {
    if (!armed) return; armed = false;
    if (hasGSAP && !reduce) {
      gsap.to(wa, { yPercent: 130, duration: 0.35, ease: "power3.in", overwrite: true });
      gsap.fromTo(phone, { yPercent: -130 }, { yPercent: 0, duration: 0.55, ease: "back.out(2)", overwrite: true });
    } else { el.classList.remove("is-armed"); }
  }

  el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") arm(); });
  el.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") disarm(); });
  // dotyk: dlugie przytrzymanie odslania WhatsApp (potem klik nawiguje do wa.me)
  el.addEventListener("touchstart", function () { holdT = setTimeout(arm, 280); }, { passive: true });
  el.addEventListener("touchend", function () { clearTimeout(holdT); });
  el.addEventListener("touchcancel", function () { clearTimeout(holdT); });
})();
