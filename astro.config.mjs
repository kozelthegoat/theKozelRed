import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://kozel.red',
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()]
  },
  fonts: [
    { provider: fontProviders.google(), name: 'Geist', cssVariable: '--font-sans', subsets: ['latin'] },
    { provider: fontProviders.google(), name: 'Geist Mono', cssVariable: '--font-mono', subsets: ['latin'] },
    { provider: fontProviders.google(), name: 'Spectral', cssVariable: '--font-heading', subsets: ['latin'] }
  ]
});
