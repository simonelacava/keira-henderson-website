# keirahhenderson.com

One-page site for Keira Henderson's customer and user research consultancy. Plain HTML/CSS with a small script for the mobile menu; no build step.

- `public/`: the site, served as-is by Cloudflare. `styles.css` holds the design tokens as CSS variables.
- `original/`: the approved design (`index.html`), brief and source images, kept as the visual reference.
- `tools/`: one-off scripts (not needed to serve the site):
  - `npm run assets` regenerates logos, photo crops, favicons and the Open Graph card in `public/` from `original/assets/`.
  - `npm run shots` screenshots the original and the build at 390/768/1440px and pixel-diffs them into `tools/shots/`.

## Deploy

Cloudflare Workers (static assets), connected to this GitHub repo: every push to `main` deploys. Config in `wrangler.jsonc`.
`www.keirahhenderson.com` redirects to the bare domain via a Cloudflare redirect rule. Analytics: Cloudflare Web Analytics (no cookies).

Preview locally: `npx wrangler dev`, then open http://localhost:8787.
