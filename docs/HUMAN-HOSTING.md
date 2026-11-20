# HUMAN — hosting the prototype website

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

**The investor-facing website needs none.** Set nothing and the waitlist is a demonstration.

| Variable | Investor-facing site | Private test site |
|---|---|---|
| `PUBLIC_WAITLIST_MODE` | **not set** | `live` |
| `PUBLIC_WAITLIST_ENDPOINT` | **not set** | `/api/waitlist` |
| `WAITLIST_ENABLED` | **not set** | `true` |
| `SUPABASE_URL` | **not set** | the project's address |
| `SUPABASE_SECRET_KEY` | **not set** | the secret key, as an encrypted Secret |
| `NODE_VERSION` | `22` (only if the host ignores `.nvmrc`) | `22` |

- Sending needs the two `PUBLIC_` variables **and** `WAITLIST_ENABLED=true`. Any one missing: nothing is stored.
- Variables that begin with `PUBLIC_` are written into the pages visitors download. **Never** put a key in one.
- The backend, its variables and the private test set-up: `docs/HUMAN-WAITLIST-BACKEND.md`.

## Indexing

Three layers keep the prototype out of search engines. Keep all three until launch.

1. `<meta name="robots" content="noindex, nofollow">` on every page (`src/layouts/Base.astro`).
2. `public/robots.txt` disallows everything.
3. `public/_headers` sends `X-Robots-Tag: noindex, nofollow` (Cloudflare Pages reads this file).

## Host: Cloudflare Pages, openly accessible

The website is open to anyone who has the link. There is no login, no password and no Cloudflare Zero Trust.
It still asks search engines not to index it (see Indexing above).

### Deploy (when authorised)

1. In Cloudflare: Workers & Pages → the Pages project → connected to the Git repository.
2. Framework preset: Astro. Build command `npm run build`. Output directory `dist`.
3. Environment variables on Production: none. Add `NODE_VERSION=22` only if the build log shows an older Node.
4. Each push to the production branch rebuilds the site.

### Connect humanforlife.in

**hello@ and privacy@ depend on the domain's mail records. Do not change or delete them.**

**`www.humanforlife.in` (or any other subdomain): no DNS move needed.**
1. Pages project → Custom domains → Set up a custom domain → `www.humanforlife.in`.
2. At the current DNS provider add the one record Cloudflare shows: `CNAME  www  →  <project>.pages.dev`.
   Change nothing else there.
3. Wait for Cloudflare to show the domain as Active (the certificate is issued automatically).

**`humanforlife.in` itself (the main address): Cloudflare Pages requires the domain's DNS to be managed by
Cloudflare.**
1. At the current DNS provider, list or export every existing record. Keep this list.
2. Cloudflare → Add a site → `humanforlife.in` (Free plan). Cloudflare imports the records it can find.
3. **Before changing nameservers**, compare Cloudflare's list with yours and add anything missing. Mail needs all of:
   every `MX` record, the SPF record (`TXT` starting `v=spf1`), every DKIM record (names containing `_domainkey`),
   the DMARC record (`_dmarc`), and any verification `TXT` record from the email provider.
   Set mail-related `CNAME` records to "DNS only" (grey cloud). A missing record stops email.
4. At the registrar, replace the nameservers with the two Cloudflare gives. The change can take up to a day; the old
   provider keeps answering in the meantime.
5. When Cloudflare shows the zone as Active: send a test email to and from hello@humanforlife.in **before** going on.
6. Pages project → Custom domains → add `humanforlife.in` and `www.humanforlife.in`.

### If Vercel is preferred

Import the repository, framework preset Astro, same build settings, no waitlist variables. `public/_headers` is not
read by Vercel, so add the `X-Robots-Tag` header in a `vercel.json`. Password protection for a custom domain is a
paid feature there.

## GitHub

The repository is `hanaanshi13-beep/humanwebsitedev1`. Its only branch, and its default, is
`claude/sharp-knuth-tnlel1`. Cloudflare Pages builds from this repository.
