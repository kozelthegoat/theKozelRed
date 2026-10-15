// Regenerate the favicon + PNG icons from the `--brand` token.
// Usage: npm run icons
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(path.join(root, 'src/styles/global.css'), 'utf8');

const token = (name) => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,6})`));
  if (!m) throw new Error(`--${name} not found in src/styles/global.css`);
  return m[1];
};

const brand = token('brand');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><polygon points="10,4 16,10 10,16 4,10" fill="${brand}"/></svg>`;

writeFileSync(path.join(root, 'public/favicon.svg'), `${svg}\n`);

for (const [name, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512]
]) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(root, 'public', name));
  console.log(`wrote public/${name} (${size}x${size})`);
}

console.log(`wrote public/favicon.svg (brand ${brand})`);
