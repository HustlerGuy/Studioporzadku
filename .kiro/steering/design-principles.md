---
inclusion: always
---

# Zasady projektowe (Senior Creative Developer / FWA/Awwwards)

Rola: Senior Creative Developer i projektant z nagrodami FWA/Awwwards. Te zasady są
nienaruszalne i obowiązują przy każdej sekcji oraz podstronie tego projektu.

## 1. Zero AI-looku
- Żadnych symetrycznych, nudnych kart na szarym tle.
- Asymetria układu, potężna ilość negatywnej przestrzeni (white space).
- Odważna, kontrastowa typografia (duże skoki skali, mocne nagłówki).

## 2. Fabryka Dopaminy (mikro-interakcje)
- Strona ma żyć: mikro-interakcja przy każdym najmniejszym ruchu.
- Hovery płynne: spring physics / dopracowane cubic-bezier.
- Elementy klikalne dają satysfakcję: efekt magnetyczny, subtelne wgłębienia,
  haptic-like feedback.

## 3. Płynność / wejścia
- Elementy pojawiają się kaskadowo (staggered fade-up), nigdy nie "wyskakują" chamsko.
- Sekwencjonowane opóźnienia, miękkie krzywe, świadomy rytm pojawiania się.

## Zawsze
- Szanuj `prefers-reduced-motion` (wyłączaj/upraszczaj ruch).
- Wydajność: animacje na transform/opacity (GPU), `will-change` z umiarem.
- Dostępność: czytelny focus-visible, semantyka, kontrast.



## Generator Podstron (stały workflow)

Każdą kolejną podstronę (O nas, Kontakt, Oferta, Blog, ...) buduję wg tego samego schematu,
podmieniając tylko nazwę i treść:

1. Budujemy na fundamencie w katalogu glownym (ten sam header `.hdr`, menu `.menu`, stopka `.ftr`,
   tokeny i klasy z `css/app.css`, interakcje z `js/app.js`). UWAGA: nowy design uzywa `app.css`/`app.js`
   (stary, zastepowany, uzywa `style.css`/`main.js`).
2. Strona glowna to `index.html` (root). Kazda podstrona to katalog `<slug>/index.html` (np. `o-nas/`),
   linkujacy `../css/app.css` i `../js/app.js`.
3. Treść dzielimy na NIEOCZYWISTE sekcje: asymetryczny grid obraz/tekst, mocne skoki typografii,
   dużo negatywnej przestrzeni. Zero równych, nudnych kart na szarym tle.
4. Scroll-triggered fade-up: elementy `data-reveal` (i grupy `data-reveal-group`) ujawniają się
   kaskadowo podczas przewijania — strona ma "rozkwitać" przed oczami.
5. Mikro-interakcje wszędzie: magnetyczne elementy (`data-magnetic`), płynne hovery (spring/cubic-bezier),
   satysfakcjonujące klikalne elementy. Zawsze `prefers-reduced-motion`, ruch na transform/opacity.
6. Zero długich myślników (—) w treści i komentarzach.
