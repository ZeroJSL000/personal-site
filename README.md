# Shanglin Jiang — personal site

Local Astro site for graduate applications. Editorial English copy. Not indexed. Not deployed.

## Run

```bash
npm install
npm run dev
```

`npm run build` then `npm run preview`. `npm run check` for types.

## Layout

```
src/
  pages/           routes
  layouts/         BaseLayout
  components/      UI (Header, cards, Container, …)
  content/         MDX collections
  data/site.ts     identity, nav, featured ids
  lib/             content helpers (not homepage motion)
  motion/          homepage animation versions
    v1.0/          rollback copy
    v1.1/          frozen hero (live)
    index.ts       CURRENT_MOTION pointer
```

## Home animation v1.1 (live)

Do not edit unless explicitly asked. Iterate by copying `src/motion/v1.1/` to `v1.2/` or `v2.0/`.

Live entry: `src/motion/v1.1/HomeStage.astro`.

## Content

Edit MDX in `src/content/projects` and `src/content/experience`. Featured home trio is listed in `src/data/site.ts`.

Do not copy CV files, transcripts, or the private workflow document into this folder. Keep `CONTENT-QUESTIONS.md` out of any public repository.

## Privacy (pre-launch)

- `noindex, nofollow` in the layout; `public/robots.txt` disallows crawlers.
- No secrets, phone numbers, private source files, or unsanitized institutional material.
- Confirm the public email and add reviewed GitHub / CV links in `src/data/site.ts` before going public.
- GitHub and CV links stay hidden until their public destinations are confirmed.
- Confirm every number against the CV and transcript.
- Keep Cuedata demo on a separate host.

## Deploy later

Private GitHub repository → Cloudflare Pages. Do not attach a custom domain until a privacy pass.
