import { defineConfig } from 'astro/config';
import { SITE_URL } from './site.config.mjs';

export default defineConfig({
  site: SITE_URL,
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
});
