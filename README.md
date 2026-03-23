# Astro Landing Page Starter for Cloudflare Workers

This repository is a reusable starter for shipping a focused marketing site or waitlist page on Astro and Cloudflare.

Included:

- Astro with the Cloudflare adapter
- one landing page plus one privacy page
- D1-backed email capture at `/api/waitlist`
- optional notification emails through Cloudflare Email Routing
- baseline SEO with canonical tags, Open Graph metadata, schema, and sitemap generation

## What gets published

Treat the repository in three layers:

- Source template: the files in this repo. This is what belongs on GitHub and what future projects should be generated from.
- Build artifact: `npm run build` produces `dist/`, including static assets and the Worker entrypoint at `dist/_worker.js/index.js`.
- Runtime infrastructure: Cloudflare bindings declared in `wrangler.jsonc` plus the D1 migration in `migrations/`.

Do not publish `dist/`, `node_modules/`, `.astro/`, or `.wrangler/` as part of the template repository.

## Publish as a GitHub template

1. Push this repository to GitHub.
2. In GitHub repository settings, enable `Template repository`.
3. Keep placeholder values in `src/site-config.ts`, `astro.config.mjs`, and `wrangler.jsonc` so new projects are forced to personalize them.
4. Keep generated and local-only directories out of the published repository.
5. Verify CI passes before tagging or sharing the template.

If you want to use the repository as a Cloudflare template with C3, keep the `cloudflare` metadata in `package.json`.

## Create a new project from the template

Option 1: GitHub template

1. Use GitHub's `Use this template` action.
2. Clone the generated repository.
3. Run `npm install`.

Option 2: C3

```bash
npm create cloudflare@latest -- --template=your-org/astro-cloudflare-landing-page-template
```

Replace `your-org/astro-cloudflare-landing-page-template` with your published repository path.

## Quick start

```bash
npm install
npm run dev
```

The site runs at `http://localhost:4321`.

## First files to edit

Start here when adapting the template:

- `src/site-config.ts` for branding, CTA labels, nav links, contact details, and placeholder content
- `src/pages/index.astro` for landing page structure and section order
- `src/pages/privacy-policy.astro` for legal copy
- `public/favicon.svg` and `public/og-placeholder.svg` for brand assets
- `astro.config.mjs` for the canonical site URL
- `wrangler.jsonc` for Worker name and Cloudflare bindings

## Environment examples

The template includes example files for the two common local override paths:

- `.env.example` for Astro build-time public variables
- `.dev.vars.example` for Wrangler local runtime overrides

Copy them to `.env` or `.dev.vars` only when you need local overrides.

## Configure site URL and indexing

The template ships with `https://example.com` as the default canonical site URL.

For real environments:

1. Update `site` in `astro.config.mjs`.
2. Optionally set `PUBLIC_SITE_URL` in `.env` if runtime metadata should use a different public URL.
3. Set `PUBLIC_NOINDEX=true` in `.env` for prelaunch or staging environments.

## Configure D1

The signup API requires the `WAITLIST_DB` binding.

1. Create a D1 database:

```bash
npx wrangler d1 create landing-page-waitlist
```

2. Replace the placeholder `database_id` and `preview_database_id` values in `wrangler.jsonc`.
3. Apply the migration:

```bash
npx wrangler d1 migrations apply landing-page-waitlist
```

4. Regenerate Worker types:

```bash
npm run cf-typegen
```

Run `npm run cf-typegen` every time you change bindings in `wrangler.jsonc`.

## Optional email notifications

The form works without email notifications. If you want an email each time someone signs up:

1. Configure Cloudflare Email Routing for your domain.
2. Replace the placeholder values in `wrangler.jsonc`, or override them in `.dev.vars` for local work:
   `WAITLIST_NOTIFICATION_TO`, `WAITLIST_NOTIFICATION_FROM`, and optionally `WAITLIST_NOTIFICATION_SENDER_NAME`.
3. Keep the `WAITLIST_NOTIFICATION_EMAIL` binding in place.
4. Run `npm run cf-typegen`.

If the email binding or vars are missing, the Worker skips notifications and still stores the signup in D1.

## Validation and deployment

Use this sequence before publishing or deriving a new project:

```bash
npm test
npm run build
npm run check
```

Deploy after replacing placeholders and configuring real bindings:

```bash
npm run deploy
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Astro in local development mode |
| `npm run build` | Build the Worker and static assets |
| `npm run preview` | Build first, then preview with Wrangler |
| `npm test` | Run the waitlist unit tests |
| `npm run cf-typegen` | Regenerate `worker-configuration.d.ts` |
| `npm run check` | Build, typecheck, and run `wrangler deploy --dry-run` |
| `npm run deploy` | Deploy to Cloudflare Workers |

## Template publishing checklist

- Replace any product-specific copy, assets, and email addresses with placeholders.
- Keep the template limited to the landing page, privacy page, and waitlist flow.
- Remove local-only directories and generated artifacts before publishing.
- Ensure placeholders remain in `wrangler.jsonc` rather than committing real resource IDs.
- Verify CI passes on Node 22.

## Notes

- The default form captures only `email` plus a hidden honeypot field.
- The template is intentionally narrow. Add pricing pages, docs, analytics, or a blog only after a derived project actually needs them.
- Replace all placeholder branding, privacy, and contact details before using a derived project publicly.
