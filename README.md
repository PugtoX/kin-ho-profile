# Kin Ho's Profile

Personal portfolio site for **Yuan Kin Ho**, a front-end developer based in Hong Kong.

Live: https://pugtox.github.io/kin-ho-profile/

## Stack

React 19 · Vite · Tailwind CSS v4

## What's in it

- Single-page layout: hero, skills, projects, contact
- Dark / light theme toggle, remembered in `localStorage` and applied before first paint
- Scroll-reveal sections and a top-bar link that follows the active section
- Animated backdrop built from a drifting canvas particle field plus a blurred
  fog layer; both idle when the user prefers reduced motion

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output in dist/
npm run lint
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`, which builds the
site and publishes `dist/` to GitHub Pages.

`vite.config.js` sets `base: '/kin-ho-profile/'` because Pages serves this project
from a subpath. Anything added under `public/` must build its URL from
`import.meta.env.BASE_URL`, since Vite does not rewrite those paths — see `AVATAR`
in `src/App.jsx`.

## Contact

- Email: hugoyuan2004@gmail.com
- WhatsApp: +852 9618 5082
