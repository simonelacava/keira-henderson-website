# Keira Henderson website: build brief for Claude Code

`index.html` is the approved design. It is a working one-page static site, so treat it as the source of truth for layout, copy, colours and type. Do not rewrite the copy unless asked.

## What it is
A one-page website for Keira Henderson's independent customer and user research consultancy (UK). It is not a CV. Sections in order:

1. Nav: Services, Work, Approach, About, plus a "Start a project" button that links to #contact
2. Hero: headline, intro, two buttons, and an orange card titled "Questions I have helped answer"
3. Client logos (in `assets/logos/`, shown in full colour)
4. Services: three cards
5. Selected work: four short case studies on a dark background
6. How I work: four steps
7. About: needs a photo where `[YOUR PHOTO]` is shown
8. Contact: orange band with email and LinkedIn
9. Footer

## Design tokens
- Accent (primary orange): `#F26B1D`, set as `--accent`
- Small orange text (for contrast): `#A63C06`
- Background `#FBF7F2`, alt background `#F4ECE2`, borders `#E7DED3`
- Ink `#1C1917`, body grey `#44403C`, muted `#57534E`
- Fonts (Google Fonts): **Bricolage Grotesque** (headings, 600/800) and **Instrument Sans** (body, 400–600)
- Pill buttons (radius 999px), cards with 24–28px radius, max content width 1240px

## Suggested build
- Keep it simple: static HTML/CSS (or Astro if a framework is wanted). No JS framework needed.
- Move the inline styles into a stylesheet with CSS variables for the tokens above. Keep the visual result identical.
- Responsive: grids already collapse with `auto-fit`. Check at 390px, 768px and 1440px. Make the nav a simple menu on mobile.
- Accessibility: keep the semantic headings, alt text on logos and colour contrast.
- Add favicon (the orange "KH" circle), Open Graph tags and a sitemap.
- Deploy to Netlify, Vercel or GitHub Pages and connect a custom domain.

## Still to do (content)
- Add Keira's photo in the About section
- Confirm the "reply within two working days" promise in Contact
- Nubian Life logo is low resolution: replace it if a larger file is available
- Optional: a contact form (e.g. Netlify Forms or Formspree) in addition to the email link

## Contact details used
- Email: keirahhenderson2@gmail.com
- LinkedIn: https://linkedin.com/in/keira-henderson
