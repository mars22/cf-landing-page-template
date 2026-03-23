## Project purpose

This repository is a reusable template for building focused landing pages on Astro and Cloudflare Workers.

The default template should stay narrow and easy to adapt:

- one landing page
- one privacy page
- one waitlist / signup endpoint
- baseline SEO and social metadata
- Cloudflare-ready deployment with optional D1 and email bindings

When this template is reused for a specific product, replace the placeholder branding, copy, assets, and infrastructure identifiers. Do not treat the default placeholder content as product truth.

## Working principles

- Keep the starter intentionally small. Do not add blogs, docs, auth flows, dashboards, or extra product areas unless explicitly requested.
- Prefer changing existing template files over introducing new layers of abstraction.
- Keep the signup flow simple by default: `email` plus honeypot protection.
- Keep notification emails optional. D1-backed storage is the baseline behavior.
- Do not commit real customer data, real Cloudflare resource IDs, or production secrets.
- Do not commit generated or local-only directories such as `dist/`, `.astro/`, `.wrangler/`, `node_modules/`, editor settings, or agent-specific folders.

## First files to edit in derived projects

- `src/site-config.ts` for branding, content, CTA labels, and contact details
- `src/pages/index.astro` for landing page structure and section order
- `src/pages/privacy-policy.astro` for legal copy
- `public/favicon.svg` and `public/og-placeholder.svg` for brand assets
- `astro.config.mjs` for the canonical site URL
- `wrangler.jsonc` for Worker name and Cloudflare bindings
- `migrations/` for D1 schema changes

## Cloudflare guidance

Cloudflare platform details change frequently. Before making Workers, D1, KV, R2, Durable Objects, Queues, Vectorize, Workers AI, or Email Routing changes, retrieve current Cloudflare documentation.

Docs:

- https://developers.cloudflare.com/workers/
- https://developers.cloudflare.com/d1/
- https://developers.cloudflare.com/email-routing/email-workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

For limits and quotas, use the relevant product `/platform/limits/` page.

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start Astro local development |
| `npm test` | Run unit tests |
| `npm run build` | Build the Worker and static assets into `dist/` |
| `npm run preview` | Preview the built Worker locally with Wrangler |
| `npm run check` | Build, typecheck, and package with Wrangler dry-run |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run cf-typegen` | Regenerate `worker-configuration.d.ts` after binding changes |

## Template invariants

- `wrangler.jsonc` should keep placeholder resource identifiers until a derived project provisions real resources.
- `worker-configuration.d.ts` is generated and may be committed for a clean out-of-the-box typecheck.
- `README.md` should explain setup, infrastructure, deployment, and template publishing without assuming one specific product.
