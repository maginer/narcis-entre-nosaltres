# Narcís entre nosaltres · «Com de narcisista ets?»

Autotest de 21 ítems sobre el narcisisme com a **tret** de personalitat, material complementari del Treball de
Recerca _Narcís entre nosaltres. Estudi psicològic del narcisisme i del TNP_ (INS Corbera, 2n de batxillerat,
curs 2026-2027). Publicat a **[maginer.com](https://maginer.com)**.

No és un diagnòstic: mesura una cosa que tothom té en algun grau i no detecta el Trastorn Narcisista de la
Personalitat, que només pot valorar un professional.

## Què fa

- 21 frases, tres per a cada una de les set dimensions del NPI (Raskin i Terry, 1988): autoritat,
  autosuficiència, superioritat, exhibicionisme, explotació, vanitat i dret adquirit. Ítems propis, alguns
  inversos, presentats intercalats i sense dir quina dimensió mesuren.
- Una pregunta per pantalla, amb ratolí o teclat (`1` a `5`, fletxes, `Retorn`).
- Resultat amb percentatge global, banda (baix, moderat, marcat, alt), radar de les set dimensions i perfil
  amb barres; botons per compartir, copiar, imprimir i repetir.
- Si qui fa el test ho accepta (casella marcada per defecte), les 21 respostes i el resultat es desen de manera
  anònima a Cloudflare D1: sense nom, correu, IP, cookies ni analítica. El servidor refà el càlcul i no es refia
  del navegador. Es poden consultar a [maginer.com/resultats](https://maginer.com/resultats) i descarregar en CSV.
- `?demo=1` omple el test amb un patró d'exemple i treu les animacions (captures i defensa).

## Com funciona el càlcul

Cada resposta val d'1 a 5; en els ítems inversos el 5 passa a valer 1. Es sumen els 21 valors, es resta el
mínim (21) i es divideix pel recorregut (84):

```
percentatge = (suma − 21) ÷ 84 × 100
```

El mateix càlcul amb els tres ítems de cada dimensió dona el perfil. La lògica és a
[`src/scripts/scoring.ts`](src/scripts/scoring.ts) i els tests a
[`src/scripts/scoring.test.ts`](src/scripts/scoring.test.ts).

## Estructura

```
src/
  data/items.ts          els ítems, les dimensions i les bandes
  scripts/scoring.ts     el càlcul (pur, amb tests)
  scripts/stepper.ts     el qüestionari, una pregunta per pantalla
  scripts/result.ts      la pantalla de resultat
  scripts/radar.ts       el gràfic de radar (SVG)
  scripts/card.ts        la imatge del resultat (canvas)
  scripts/geometry.ts    geometria compartida del radar
  scripts/dom.ts         accés segur als elements
  scripts/app.ts         l'arrencada
  scripts/submission.ts  validació i format de les respostes desades (compartit amb el servidor)
  scripts/submit.ts      l'enviament del resultat
  scripts/resultats.ts   la pàgina de resultats
functions/api/results.ts Pages Function: desa (POST) i llista (GET, JSON o CSV) els resultats
migrations/              l'esquema de la taula de D1
  components/            capçalera, hero, instruccions, test, resultat, explicacions, peu
  layouts/Base.astro     l'esquelet HTML amb les metadades
  pages/                 index i 404
  styles/global.css      els estils (tokens, seccions, impressió, moviment reduït)
public/                  favicon, robots, capçaleres de seguretat, imatge per compartir
scripts/og/              com es genera la imatge per compartir
docs/                    disseny i desplegament
```

## Desenvolupament

Cal Node 24 i pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm test       # tests del càlcul
pnpm check      # tipus i plantilles Astro
pnpm build      # dist/
```

## Desplegament

Cada push a `main` construeix el lloc i el publica a Cloudflare Pages (`maginer-tr`), que serveix
`maginer.com`. Detalls a [`docs/DESPLEGAMENT.md`](docs/DESPLEGAMENT.md).

## Llicència

El codi (`src/`, `scripts/`, la configuració i els workflows) és sota llicència [MIT](LICENSE). Els textos
de la pàgina, els ítems del test i la imatge per compartir són d'Adrián Martínez Giner i es publiquen sota
[CC BY-NC-SA 4.0](LICENSE-CONTINGUT.md): es poden citar i reutilitzar amb atribució, sense finalitat
comercial i amb la mateixa llicència.
