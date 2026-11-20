# HUMAN — hosting the investor prototype

**Status (2026-11-20): not deployed. Nothing below has been done; it is the procedure for when the founders decide to.**

## What is being hosted

A static website: Astro 5 builds plain HTML, CSS, JavaScript and images into `dist/`. Any static host can serve
it. One optional server function, `/api/waitlist`, exists for private testing of real registrations; it runs only
on Cloudflare Pages, is off by default, and the investor-facing site never calls it.

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22 (`.nvmrc`) |
| Install command | `npm ci` |

## Environment variables

**The investor-facing website needs exactly one: `SITE_PASSWORD`.** Without it the site stays closed. Set no
waitlist variable and the waitlist is a demonstration.

| Variable | Investor-facing site | Private test site |
|---|---|---|
| `PUBLIC_WAITLIST_MODE` | **not set** | `live` |
| `PUBLIC_WAITLIST_ENDPOINT` | **not set** | `/api/waitlist` |
| `WAITLIST_ENABLED` | **not set** | `true` |
| `SUPABASE_URL` | **not set** | the project's address |
| `SUPABASE_SECRET_KEY` | **not set** | the secret key, as an encrypted Secret |
| `SITE_PASSWORD` | **required**, encrypted Secret, 12+ characters | **required**, encrypted Secret |
| `NODE_VERSION` | `22` (only if the host ignores `.nvmrc`) | `22` |

- Sending needs the two `PUBLIC_` variables **and** `WAITLIST_ENABLED=true`. Any one missing: nothing is stored.
- Variables that begin with `PUBLIC_` are written into the pages visitors download. **Never** put a key in one.
- The backend, its variables and the private test set-up: `docs/HUMAN-WAITLIST-BACKEND.md`.

## Indexing

Three layers keep the prototype out of search engines. Keep all three until launch.

1. `<meta name="robots" content="noindex, nofollow">` on every page (`src/layouts/Base.astro`).
2. `public/robots.txt` disallows everything.
3. `public/_headers` sends `X-Robots-Tag: noindex, nofollow` (Cloudflare Pages reads this file).
4. The password gate answers every signed-out request with `X-Robots-Tag: noindex, nofollow` and no content.

## Recommended host: Cloudflare Pages, behind the site password

Cloudflare Pages on the free plan. Private access is provided by the site's own password gate
(`docs/HUMAN-SITE-PASSWORD.md`): no paid service and no Cloudflare Zero Trust is needed.

### Deploy (when authorised)

1. In Cloudflare: Workers & Pages → Create → Pages → **Connect to Git** → choose the repository.
   Do not use "Upload assets": a hand upload leaves out the password gate and would be public.
2. Framework preset: Astro. Build command `npm run build`. Output directory `dist`. Production branch: the
   repository's default branch.
3. Add the secret `SITE_PASSWORD` (at least 12 characters, type **Secret**) to Production **and** Preview.
   Until it is set the site shows "This site is not available" to everyone.
4. Redeploy so the secret takes effect.
5. Settings → Runtime → **Fail closed**.
6. Check in a private browser window that the `pages.dev` address and a deep link such as `/about` both ask for
   the password.

Leave the waitlist variables unset on Production. `NODE_VERSION=22` is only needed if the build log shows an older
Node.

### Connect humanforlife.in

The password gate is part of the site, so it protects any address the site is served from. The domain can therefore
be connected **without moving its DNS and without touching email**.

**Recommended: a subdomain, for example `preview.humanforlife.in`.**
1. Pages project → Custom domains → Set up a custom domain → `preview.humanforlife.in`.
2. At the current DNS provider add the one record Cloudflare shows: `CNAME  preview  →  <project>.pages.dev`.
   Change nothing else there. The `MX`, SPF, DKIM and DMARC records that hello@ and privacy@ rely on stay as they are.
3. Wait for Cloudflare to show the domain as Active (the certificate is issued automatically).
4. Open it in a private browser window: it must ask for the password.

**The main address `humanforlife.in` itself** can only be connected by moving the domain's nameservers to
Cloudflare. That is not needed for investor presentations. If it is done later: list every existing record first,
confirm after Cloudflare's import that every mail record is present (all `MX`, the SPF `TXT` starting `v=spf1`,
every `_domainkey` record, `_dmarc`, and any verification `TXT`), keep mail-related `CNAME` records as "DNS only",
and send a test email to and from hello@humanforlife.in before going further.

### If Vercel is preferred

Import the repository, framework preset Astro, same build settings, no waitlist variables. `public/_headers` is not
read by Vercel, so add the `X-Robots-Tag` header in a `vercel.json`. Password protection for a custom domain is a
paid feature there.

## GitHub

The repository is `hanaanshi13-beep/humanwebsitedev1`; the working branch `claude/sharp-knuth-tnlel1` is its only
branch and its default. Cloudflare Pages should be connected to this repository.
