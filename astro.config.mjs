// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Lloc estàtic d'una sola pàgina, publicat a Cloudflare Pages (projecte `maginer-tr`)
// i servit a https://maginer.com. El test es calcula al navegador; functions/api/results.ts desa els resultats
// anònims (D1) i /resultats els mostra.
export default defineConfig({
  site: 'https://maginer.com',
  trailingSlash: 'never',
  // /resultats és noindex: fora del sitemap.
  integrations: [sitemap({ filter: (page) => !page.includes('/resultats') })],
  build: {
    // /resultats es publica com a resultats.html: sense barra final ni redirecció 308.
    format: 'file',
    // El CSS petit va dins de la pàgina (una petició menys); la resta, en fitxer.
    inlineStylesheets: 'auto',
  },
});
