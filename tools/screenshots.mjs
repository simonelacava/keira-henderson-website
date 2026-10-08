// Visual check: screenshots the original design and the built site at 390/768/1440px
// and pixel-diffs them. Output goes to tools/shots (gitignored). Run: npm run shots
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const shots = path.join(here, 'shots');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain' };

function serve(dir, port) {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      try {
        const body = await fs.readFile(path.join(dir, p));
        res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
        res.end(body);
      } catch { res.writeHead(404); res.end(); }
    });
    server.listen(port, () => resolve(server));
  });
}

await fs.mkdir(shots, { recursive: true });
const servers = [await serve(path.join(root, 'original'), 4101), await serve(path.join(root, 'public'), 4102)];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });

async function shoot(url, width, file, before) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll('img[loading=lazy]').forEach((img) => { img.loading = 'eager'; });
    await Promise.all([...document.images].map((img) => img.complete || new Promise((r) => { img.onload = img.onerror = r; })));
  });
  if (before) await before(page);
  await page.screenshot({ path: file, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.close();
  return overflow;
}

for (const width of [390, 768, 1440]) {
  const a = path.join(shots, `original-${width}.png`);
  const b = path.join(shots, `new-${width}.png`);
  await shoot('http://localhost:4101/', width, a);
  const overflow = await shoot('http://localhost:4102/', width, b);

  const imgA = PNG.sync.read(await fs.readFile(a));
  const imgB = PNG.sync.read(await fs.readFile(b));
  const w = Math.min(imgA.width, imgB.width);
  const h = Math.min(imgA.height, imgB.height);
  const crop = (img) => { const o = new PNG({ width: w, height: h }); PNG.bitblt(img, o, 0, 0, w, h, 0, 0); return o; };
  const diff = new PNG({ width: w, height: h });
  const n = pixelmatch(crop(imgA).data, crop(imgB).data, diff.data, w, h, { threshold: 0.1 });
  await fs.writeFile(path.join(shots, `diff-${width}.png`), PNG.sync.write(diff));

  // Which row bands differ, so the report names where the changes are.
  const bands = [];
  for (let y = 0; y < h; y++) {
    let rowDiff = false;
    for (let x = 0; x < w && !rowDiff; x++) {
      const i = (y * w + x) * 4;
      if (diff.data[i] === 255 && diff.data[i + 1] === 0 && diff.data[i + 2] === 0) rowDiff = true;
    }
    if (rowDiff) {
      const last = bands[bands.length - 1];
      if (last && y - last[1] <= 4) last[1] = y; else bands.push([y, y]);
    }
  }
  console.log(`${width}px: original ${imgA.width}x${imgA.height}, new ${imgB.width}x${imgB.height}, ` +
    `diff pixels ${n}, horizontal overflow ${overflow}px, differing rows: ${bands.map(([s, e]) => `${s}-${e}`).join(', ') || 'none'}`);
}

// Mobile menu, open.
await shoot('http://localhost:4102/', 390, path.join(shots, 'new-390-menu.png'), async (page) => {
  await page.click('.nav-toggle');
  await new Promise((r) => setTimeout(r, 400));
});
await shoot('http://localhost:4102/', 600, path.join(shots, 'new-600.png'));

await browser.close();
servers.forEach((s) => s.close());
