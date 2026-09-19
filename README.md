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
- Contact form with per-field validation, a honeypot field for bots, and a
  60-second resubmit cooldown

## Contact form

The form posts JSON to the endpoint in `VITE_FORM_ENDPOINT`. **Until that
variable is set, the form stays visible but tells the visitor to use email or
WhatsApp instead** — it never pretends a message was sent.

To wire it up (pick one):

| Option | What to set |
|---|---|
| Formspree / similar | `VITE_FORM_ENDPOINT=https://formspree.io/f/<id>` |
| Your own function | `VITE_FORM_ENDPOINT=<your function URL>` |

Set it wherever the build runs (e.g. a repository variable for the Pages
workflow), then rebuild. After enabling it, **submit once and confirm the
message actually arrives** — client-side validation is not proof of delivery.

Validation rules live in `src/lib/contact.js` so they can be tested directly.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output in dist/
npm run lint
npm test         # validation rules (node --test, no framework)
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
