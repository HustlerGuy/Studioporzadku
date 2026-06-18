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
