import { defineConfig } from 'astro/config';
import { SITE_URL, BASE_PATH } from './site.config.mjs';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH || '/',
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
});
