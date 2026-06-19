Sub-Hero / Hero, zdjecia tla
============================

Obecnie sekcje Hero (Strona Glowna) oraz Sub-Hero (9 uslug + cennik)
korzystaja z wysokiej jakosci placeholderow z Unsplash, wpietych
bezposrednio w atrybut src tagow <img class="hero__img"> / <img class="subhero__img">.

Aby uzyc wlasnych zdjec:
  1. Wrzuc plik tutaj, np. img/hero/pralnia-dywanow.jpg
  2. W danej podstronie podmien src obrazka na sciezke lokalna, np.:
     src="../img/hero/pralnia-dywanow.jpg"   (na stronie glownej: "img/hero/...")

Rekomendacje dla wlasnych zdjec:
  - format poziomy, min. 1920 x 1280 px,
  - kompresja JPG ~80%, najlepiej ponizej 400 KB,
  - wazny detal po PRAWEJ stronie kadru (na mobile ucinamy lewa krawedz:
    object-position: right center), z lewej zostaje miejsce na bialy naglowek,
  - na zdjeciu lezy ciemny gradient overlay, wiec jasne foto nie zaszkodzi czytelnosci.

Gdy zdjecie sie nie zaladuje, sekcja pokazuje elegancke ciemne tlo (fallback).
