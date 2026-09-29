# Desplegament

## On viu

| Què           | On                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------- |
| Codi          | `github.com/maginer/narcis-entre-nosaltres`, branca `main`                                  |
| Lloc publicat | Cloudflare Pages, projecte `maginer-tr` (`maginer-tr.pages.dev`)                            |
| Domini        | `maginer.com` (registrat a Arsys, DNS a Cloudflare); `www.maginer.com` redirigeix a l'arrel |

## Com es publica

El workflow [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) s'executa a cada push a
`main`: instal·la, passa `astro check` i els tests, construeix `dist/` i el puja a Pages amb `wrangler`.
Al final comprova que `maginer-tr.pages.dev` serveix el mateix identificador de build (`data-build` a
l'HTML) que s'acaba de construir: «desplegat» no vol dir «servit» fins que això quadra.

Les branques que no són `main` i els pull requests passen només les comprovacions
([`ci.yml`](../.github/workflows/ci.yml)), sense publicar.

## Resultats (D1)

Els resultats anònims es desen a la base de dades D1 `maginer-tr-resultats` (regió WEUR), enllaçada al projecte de
Pages amb el nom `DB` des de la configuració del projecte a Cloudflare (no hi ha `wrangler.toml` al repositori).
L'esquema és a [`migrations/0001_resultats.sql`](../migrations/0001_resultats.sql) i s'aplica amb
`pnpm db:migrate` (cal un token amb permís de D1). La funció [`functions/api/results.ts`](../functions/api/results.ts)
accepta `POST` només des de l'origen del lloc, valida les 21 respostes i refà el càlcul; `GET` retorna JSON o, amb
`?format=csv`, un CSV. Una regla de límit de peticions de Cloudflare frena els enviaments massius.

## Secrets

Dos secrets del repositori, i cap al codi:

- `CLOUDFLARE_API_TOKEN`: token que només pot llegir i escriure projectes de Pages. No pot tocar DNS ni
  cap altra cosa del compte.
- `CLOUDFLARE_ACCOUNT_ID`: identificador del compte.

El CI passa `gitleaks` sobre tot l'historial a cada push (imatge oficial en Docker) per assegurar que no s'hi cola cap clau. Els commits porten l'adreça no-reply de GitHub, no cap correu personal.

## Publicar a mà

Amb un token de Pages a l'entorn (`CLOUDFLARE_API_TOKEN` i `CLOUDFLARE_ACCOUNT_ID`):

```bash
pnpm deploy
```

## Capçaleres i seguretat

`public/_headers` fixa la política de seguretat de contingut (només scripts propis, estils propis i de
Google Fonts, cap connexió externa) i les capçaleres habituals (`nosniff`, `frame-ancestors 'none'`,
`Referrer-Policy`). Si s'afegeix algun recurs extern, cal ampliar-la.
