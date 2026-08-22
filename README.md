# yesmcp.com — MOVED

**This repository is frozen. Do not edit it, do not deploy from it.**

The source of yesmcp.com now lives in the **mcp-site** repository, under `site/`
(Astro + Tailwind v4). Every page that used to be served from here — the front
page, `/about/`, `/writing/<slug>/`, `/privacy/`, the 404, `robots.txt`,
`sitemap.xml`, `llms.txt`, `_headers` and the og images — was ported there on
2026-08-22, with the article URLs preserved exactly.

Deploys go out from that repo:

```sh
cd site
bun install
bun run deploy   # astro build && wrangler pages deploy dist --project-name=yesmcp
```

The Cloudflare Pages project is unchanged (`yesmcp`, branch `main`), so the live
domain keeps serving from the same place — only the source of the build moved.

What is left here is history: the hand-written static site, its stylesheet and its
self-hosted font subsets, kept for reference and for the decision record. Two
operational notes from that history still apply to the new repo and were carried
over to its `CLAUDE.md`:

- After any deploy, verify on the UNIQUE deployment URL wrangler prints, not on the
  branch alias — the edge cache serves stale responses on the alias.
- The zone's **AI Crawl Control > Signals > Managed robots.txt** was switched off on
  2026-08-10. If robots.txt ever stops matching the file in the repo, check that
  toggle first.
