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

## Secrets

Dos secrets del repositori, i cap al codi:

- `CLOUDFLARE_API_TOKEN`: token que només pot llegir i escriure projectes de Pages. No pot tocar DNS ni
  cap altra cosa del compte.
- `CLOUDFLARE_ACCOUNT_ID`: identificador del compte.

El CI passa `gitleaks` a cada push per assegurar que no s'hi cola cap clau.

## Publicar a mà

Amb un token de Pages a l'entorn (`CLOUDFLARE_API_TOKEN` i `CLOUDFLARE_ACCOUNT_ID`):

```bash
pnpm deploy
```

## Capçaleres i seguretat

`public/_headers` fixa la política de seguretat de contingut (només scripts propis, estils propis i de
Google Fonts, cap connexió externa) i les capçaleres habituals (`nosniff`, `frame-ancestors 'none'`,
`Referrer-Policy`). Si s'afegeix algun recurs extern, cal ampliar-la.
