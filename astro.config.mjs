// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://pesttoclear.com',
  output: 'static',
  // Trailing slash on everything except root. Must stay 'always' and must match
  // the canonical URLs, or ranking signal splits across slash / no-slash variants.
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
