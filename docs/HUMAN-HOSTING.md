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
5. Immediately afterwards: Zero Trust → Access → Applications → Add → Self-hosted. Add the `<project>.pages.dev`
   address with a policy that allows only the listed email addresses (login by one-time code). Until this is done
   the address is open to anyone who has it.
6. Pages project → Settings → General → enable the **Access policy** for preview deployments, so branch previews
   (including the private waitlist test site) also ask for a login.
7. Check both in a private browser window: each must ask for an email before showing the site.

### Connect humanforlife.in

**Simplest and safest for investor presentations: do not connect the domain yet.** Share the Access-protected
`<project>.pages.dev` address. Nothing about the domain or its email changes.

Connecting the domain *with* private access needs care, because **hello@ and privacy@ depend on the domain's mail
records**, and because Cloudflare Access protects a custom address only when the domain's DNS is managed by
Cloudflare. (If `humanforlife.in` does not appear in the Access domain list, this is why.) A plain CNAME from another
DNS provider would serve the site on the domain **without** the Access login in front of it. Do not do that for a
private prototype.

**To put the site on humanforlife.in behind Access (moves the domain's DNS to Cloudflare):**
1. At the current DNS provider, list or export every existing record. Keep this list.
2. Cloudflare → Add a site → `humanforlife.in` (Free plan). Cloudflare imports the records it can find.
3. **Before changing nameservers**, compare Cloudflare's list with yours and add anything missing. Mail needs all of:
   every `MX` record, the SPF record (`TXT` starting `v=spf1`), every DKIM record (names containing `_domainkey`),
   the DMARC record (`_dmarc`), and any verification `TXT` record from the email provider.
   Set mail-related `CNAME` records to "DNS only" (grey cloud). A missing record stops email.
4. At the registrar, replace the nameservers with the two Cloudflare gives. The change can take up to a day; the old
   provider keeps answering in the meantime.
5. When Cloudflare shows the zone as Active: send a test email to and from hello@humanforlife.in **before** going on.
6. Pages project → Custom domains → add the address to use (for example `preview.humanforlife.in`, or
   `humanforlife.in` and `www.humanforlife.in`). Cloudflare creates the record and the certificate.
7. Add that address to the Access application, and confirm in a private browser window that it asks for a login.

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
