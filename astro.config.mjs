// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Lloc estàtic d'una sola pàgina, publicat a Cloudflare Pages (projecte `maginer-tr`)
// i servit a https://maginer.com. Res de servidor: tot el test es calcula al navegador.
export default defineConfig({
  site: 'https://maginer.com',
  trailingSlash: 'never',
  integrations: [sitemap()],
  build: {
    // El CSS petit va dins de la pàgina (una petició menys); la resta, en fitxer.
    inlineStylesheets: 'auto',
  },
});
