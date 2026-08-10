# yesmcp.com

Expertise showcase for Yes MCP (Serhii Kravchenko, MCP engineer). Static, no build step,
no framework, no external domains.

English only. The uk/ru versions were retired on the `showcase` branch when the site became
a contractor showcase rather than a landing page (decision D-004); they remain in `main`'s
history and can come back if demand shows.

## Layout

```
index.html              front page: services, writing index, contact
about/                  who runs this, track record, what is not claimed
privacy/                no cookies, no analytics, no third-party requests
writing/<slug>/         one directory per piece
404.html                served with a real 404 by Pages
assets/site.css         the whole stylesheet
assets/fonts/           self-hosted woff2 subsets (~128 KB)
assets/og/              1200x630 share cards, one per page
robots.txt              ours, allows everything including AI training crawlers
sitemap.xml, llms.txt   hand-maintained, update when a page is added
_headers                HSTS, CSP, X-Frame-Options, Permissions-Policy
```

## Deploy

```sh
npx wrangler pages deploy . --project-name yesmcp --branch showcase
```

`CLOUDFLARE_PAGES_TOKEN` lives in `mcp-app/.env`. Production is the `main` branch; the
showcase has not been promoted there yet.

> After any deploy, verify on the UNIQUE deployment URL that wrangler prints, not on the
> branch alias. The edge cache serves stale responses on the alias and produced three false
> negatives in one day: a missing 404 page, an unapplied stylesheet, two absent images.

## Gotcha: Cloudflare managed robots.txt

The zone had **AI Crawl Control > Signals > Managed robots.txt** switched on, which served
`Content-Signal: ai-train=no` plus `Disallow: /` for ClaudeBot, GPTBot, CCBot, Google-Extended
and others. That is the inverse of what this site needs. It was switched off on 2026-08-10.
If robots.txt ever stops matching the file in this repo, check that toggle first.
