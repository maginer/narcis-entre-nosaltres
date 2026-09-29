# Disseny

## Punt de partida

El test és el material complementari d'un treball de recerca sobre el narcisisme. La pàgina ha de fer
tres coses, per aquest ordre: deixar clar que no és un diagnòstic, fer el test còmode de respondre i
donar un resultat que s'entengui sense saber psicologia.

## Identitat

- **El reflex.** Narcís es mira a l'aigua. El títol del hero es reflecteix cap avall, esvaït i amb una
  ondulació lenta (filtre SVG `feTurbulence` + `feDisplacementMap`). És l'única llicència visual; la resta
  de la pàgina és quieta.
- **Dos colors amb sentit.** El granat (`#7b1e2b`) és el del treball imprès i marca tot el que és acció:
  respondre, avançar. El daurat (`#d8b65a`), la corona de la flor del narcís, només apareix dins del
  resultat, sobre el fons fosc de l'estany (`#14202b`).
- **Tipografia.** Newsreader (serif, pes 300 al hero, cursiva per a les bandes) per al que és veu i
  resultat; IBM Plex Sans per a instruccions, botons i dades. Google Fonts amb reserva a Georgia i a la
  lletra del sistema: sense connexió la pàgina es veu igual de bé.
- **Sense decoració.** Ni targetes idèntiques, ni ombres, ni etiquetes en majúscules. Les línies i les
  vores només apareixen on separen informació.

## Estructura de la pàgina

1. Capçalera amb la marca del treball i tres àncores.
2. Hero: títol, reflex, una frase i el botó.
3. Tres paràgrafs abans de començar: què mesura, com respondre, què no és.
4. El test: una pregunta per pantalla, escala d'1 a 5, punts de navegació, teclat.
5. El resultat (fosc): percentatge amb comptador, banda amb marcador i la mitjana de la població, text
   d'interpretació, radar que creix des del centre, set dimensions amb barra i descripció, accions.
6. Tret o trastorn, com es calcula, el treball, peu.

## Moviment

Una sola seqüència en carregar (les paraules del títol, després el reflex, després el text) i el
moviment que respon a una acció: la frase que entra quan canvies de pregunta, el comptador i el radar
del resultat. `prefers-reduced-motion` i `?demo=1` ho aturen tot (classe `no-anim`).

## Decisions que es van descartar

- **Percentils o comparacions amb els cinc casos del treball.** Els casos es valoren amb els criteris del
  DSM-5-TR, no amb les dimensions del NPI; comparar-los amb el resultat seria enganyós.
- **Guardar dades personals.** Des del 29 de setembre de 2026 es desen els resultats per a l'estudi del treball, però
  només les respostes i el percentatge, amb una casella que qui respon pot desmarcar. Ni nom, ni correu, ni IP.
- **Mode fosc global.** El contrast clar/fosc és el del test i el resultat; un tema fosc sencer el perdria.
