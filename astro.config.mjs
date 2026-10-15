import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://kozel.red',
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  vite: {
    plugins: [tailwindcss()]
  }
});
