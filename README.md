# Shanglin Jiang — personal site

Astro source for Shanglin Jiang's personal site. The GitHub repository is public; search indexing remains disabled in the current site layout.

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

## Privacy and publishing

- `noindex, nofollow` in the layout; `public/robots.txt` disallows crawlers.
- No secrets, phone numbers, private source files, or unsanitized institutional material.
- Review public email, CV, and project links in `src/data/site.ts` and the content collections before publishing a deployment.
- Confirm every number against its underlying evidence.
- Keep Cuedata demo on a separate host.

## Deployment

No hosting configuration is stored in this repository. The site can be built with `npm run build`; hosting and any custom domain are configured separately.
