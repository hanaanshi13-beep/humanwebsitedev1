# HUMAN — hosting the investor prototype

**Status (2026-11-20): not deployed. Nothing below has been done; it is the procedure for when the founders decide to.**

## What is being hosted

A fully static website: Astro 5 builds plain HTML, CSS, JavaScript and images into `dist/`. There is no server,
no database connection and no API route. Any static host can serve it.

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22 (`.nvmrc`) |
| Install command | `npm ci` |

## Environment variables

| Variable | Investor-facing build | Private development build |
|---|---|---|
| `PUBLIC_WAITLIST_MODE` | **not set** | `live` |
| `PUBLIC_WAITLIST_ENDPOINT` | **not set** | URL of the development endpoint |
| `NODE_VERSION` | `22` (only if the host ignores `.nvmrc`) | `22` |

- With neither waitlist variable set, the waitlist is a **demonstration**: no request is made and nothing is stored.
- Sending needs **both** variables. An endpoint alone does nothing.
- Variables that begin with `PUBLIC_` are written into the pages visitors download. **Never** put a private key in
  one (for example a Supabase `service_role` or secret key). The website itself needs no secret of any kind.
- No Supabase code, URL or key exists in this repository. The founders' Supabase project is separate and untouched.

## Indexing

Three layers keep the prototype out of search engines. Keep all three until launch.

1. `<meta name="robots" content="noindex, nofollow">` on every page (`src/layouts/Base.astro`).
2. `public/robots.txt` disallows everything.
3. `public/_headers` sends `X-Robots-Tag: noindex, nofollow` (Cloudflare Pages reads this file).

## Recommended host: Cloudflare Pages, behind Cloudflare Access

Both Cloudflare Pages and Vercel can serve this site as it is. Cloudflare is recommended because private access for
named people is included on its free plan (Cloudflare Access, up to 50 users), while Vercel charges for password
protection on custom domains.

**Private access for investors:** Cloudflare Access with an email allow-list. An investor opens the link, enters
their email address, receives a one-time code and is let in. No shared password; access can be removed per person.

### Deploy (when authorised)

1. In Cloudflare: Workers & Pages → Create → Pages → Connect to Git → choose the repository.
2. Framework preset: Astro. Build command `npm run build`. Output directory `dist`.
3. Environment variables: leave the two waitlist variables **unset**. Add `NODE_VERSION=22` if the build log shows
   an older Node.
4. Deploy. The site appears at `<project>.pages.dev`.
5. Zero Trust → Access → Applications → Add → Self-hosted. Add **both** the custom domain and the `pages.dev`
   address, with a policy that allows only the listed email addresses. Until this step is done the `pages.dev`
   address is open to anyone who has it.

### Connect humanforlife.in

Check first where the domain's DNS is managed, because **hello@ and privacy@ depend on its mail records**.

**Option A (recommended): a subdomain, for example `preview.humanforlife.in`.** Email is not touched.
1. Pages project → Custom domains → Set up a custom domain → `preview.humanforlife.in`.
2. At the current DNS provider add the record Cloudflare shows: `CNAME preview → <project>.pages.dev`.
3. Wait for Cloudflare to show the domain as Active (the certificate is issued automatically).
4. Add `preview.humanforlife.in` to the Access application.

**Option B: the main domain `humanforlife.in`.** This requires the domain's nameservers to move to Cloudflare.
1. Cloudflare → Add a site → `humanforlife.in` (Free plan). Cloudflare imports the existing DNS records.
2. **Before changing nameservers**, compare the imported records with the current provider's list and confirm every
   mail record is present: all `MX` records, the SPF `TXT` record, DKIM `TXT`/`CNAME` records and any DMARC record.
   A missing record stops email.
3. At the registrar, replace the nameservers with the two Cloudflare gives.
4. When the zone is Active: Pages project → Custom domains → add `humanforlife.in` and `www.humanforlife.in`.
5. Add both to the Access application.
6. Send a test email to and from hello@humanforlife.in.

### If Vercel is preferred

Import the repository, framework preset Astro, same build settings, no waitlist variables. `public/_headers` is not
read by Vercel, so add the `X-Robots-Tag` header in a `vercel.json`. Password protection for a custom domain is a
paid feature there.

## GitHub

Pushing from the Claude session fails with HTTP 403: "Claude doesn't have GitHub access to
hanaanshi13-beep/humanwebsitedev1". The repository itself is fine. To fix: install the Claude GitHub App on the
repository (https://github.com/apps/claude/installations/select_target) or reconnect GitHub in Claude's settings,
then start a new session. Alternatively push from a computer that has the repository and normal GitHub access.
All work is committed locally on `claude/sharp-knuth-tnlel1`.
