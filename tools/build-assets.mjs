// Generates the site's image assets into ../public from ../original.
// Run once (or after replacing a source image): npm run assets
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import opentype from 'opentype.js';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const src = path.join(root, 'original', 'assets');
const out = path.join(root, 'public');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const ACCENT = '#F26B1D';
const INK = '#1C1917';

await fs.mkdir(path.join(out, 'assets', 'logos'), { recursive: true });

// Logos: copy as-is, except Nubian Life, whose built-in whitespace is trimmed.
for (const file of await fs.readdir(path.join(src, 'logos'))) {
  const from = path.join(src, 'logos', file);
  const to = path.join(out, 'assets', 'logos', file);
  if (file === 'nubian.png') {
    await sharp(from).trim({ threshold: 10 }).png({ compressionLevel: 9 }).toFile(to);
  } else {
    await fs.copyFile(from, to);
  }
}

// Photo: square source, centre-cropped to the design's 4:5 frame.
const photo = path.join(src, 'profile pic.jpg');
const meta = await sharp(photo).metadata();
const cropW = Math.round(meta.height * 4 / 5);
const crop = { left: Math.round((meta.width - cropW) / 2), top: 0, width: cropW, height: meta.height };
for (const w of [480, 640]) {
  const h = w * 5 / 4;
  const base = sharp(photo).rotate().extract(crop).resize(w, h);
  await base.clone().webp({ quality: 82 }).toFile(path.join(out, 'assets', `keira-henderson-${w}.webp`));
  await base.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(out, 'assets', `keira-henderson-${w}.jpg`));
}

// Favicon: the orange "KH" circle, glyphs outlined from Bricolage Grotesque 800 so no font is needed.
const font = opentype.parse((await fs.readFile(path.join(here, 'fonts', 'bricolage-17-800-KH.woff'))).buffer);
function markSvg({ size, square = false, textScale = 0.5 }) {
  const p = font.getPath('KH', 0, 0, size * textScale);
  const bb = p.getBoundingBox();
  const dx = (size - (bb.x2 - bb.x1)) / 2 - bb.x1;
  const dy = (size - (bb.y2 - bb.y1)) / 2 - bb.y1;
  const glyphs = font.getPath('KH', dx, dy, size * textScale).toPathData(2);
  const bg = square
    ? `<rect width="${size}" height="${size}" fill="${ACCENT}"/>`
    : `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${ACCENT}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${bg}<path fill="${INK}" d="${glyphs}"/></svg>`;
}
await fs.writeFile(path.join(out, 'favicon.svg'), markSvg({ size: 32 }) + '\n');
await sharp(Buffer.from(markSvg({ size: 180, square: true, textScale: 0.42 }))).png().toFile(path.join(out, 'apple-touch-icon.png'));

// favicon.ico: one 32px PNG wrapped in an ICO container.
const png32 = await sharp(Buffer.from(markSvg({ size: 32 })), { density: 72 }).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
header.writeUInt32LE(png32.length, 14); header.writeUInt32LE(22, 18);
await fs.writeFile(path.join(out, 'favicon.ico'), Buffer.concat([header, png32]));

// Open Graph card: rendered in Chrome with the site's own fonts and colours.
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.goto('file://' + path.join(here, 'og-card.html').replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(out, 'og.png'), type: 'png' });
await browser.close();

console.log('Assets written to', out);
