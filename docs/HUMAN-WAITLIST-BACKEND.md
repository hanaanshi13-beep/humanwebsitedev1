# HUMAN — waitlist backend (`/api/waitlist`)

**Status (2026-11-20): built and tested against a mocked database. Not deployed. Never run against the real
Supabase project.** The investor-facing website does not use it: its waitlist stays a demonstration.

## What it is

One Cloudflare Pages Function that receives a waitlist submission from HUMAN's own pages, validates it again on the
server and inserts one row into the Supabase table `waitlist_registrations`.

| File | Role |
|---|---|
| `functions/api/waitlist.ts` | The Pages Function. Two lines: passes the request and environment to the core |
| `server/waitlist-core.ts` | All behaviour: gating, origin check, limits, validation, the single INSERT |
| `supabase/waitlist_registrations.sql` | Reference schema the function writes to |
| `tests/waitlist-api.mjs` | 19 unit checks (database mocked) |
| `tests/waitlist-live.mjs` | 12 end-to-end checks in Cloudflare's local Pages runtime (database mocked) |

No library was added to the website. The function uses only standard Web APIs.

## Two switches, both off by default

A real registration happens only when **both** are on. Either one alone does nothing.

| Switch | Where | Effect when off (the default) |
|---|---|---|
| Page side: `PUBLIC_WAITLIST_MODE=live` **and** `PUBLIC_WAITLIST_ENDPOINT=/api/waitlist` at build time | built into the pages | The waitlist is a demonstration and makes no request at all |
| Server side: `WAITLIST_ENABLED=true` at run time | Cloudflare variable | The function answers 503 before reading the request and contacts nothing |

Tested: with the page switch off, the pages send nothing even if every server variable is set by mistake.

## What the function does, in order

Before any of this, the site password gate (`docs/HUMAN-SITE-PASSWORD.md`) has already refused anyone who is not
signed in: an unauthenticated request never reaches the function.

1. `WAITLIST_ENABLED` is not exactly `true` → 503. Nothing is read.
2. Not `POST` → 405. A browser preflight is answered with no permissions, so other websites cannot call it.
3. The request did not come from this site's own pages (`Origin` must equal the site's own address) → 403.
4. `SUPABASE_URL` is not an `https://…supabase.co` address, or the key is missing → 503.
5. More than 8 requests from one address in 10 minutes → 429 (best effort, per running instance).
6. Not JSON → 415. Larger than 8 KB → 413. Unparseable → 400.
7. Every field is validated (below). Any failure → 400, nothing stored.
8. One `INSERT` through Supabase's REST API with `Prefer: return=minimal`. Nothing is read back.
9. Stored → `{"status":"accepted"}`. Email already registered, or the same submission sent twice → the **same**
   answer, and nothing is added or changed. The endpoint cannot be used to find out who has registered.
10. Any database failure → 502 with a neutral message. Database text never reaches the visitor.

### Validation (server side; the form's own checks are not trusted)

| Field | Rule |
|---|---|
| `waitlistConsent` | Must be the boolean `true`. Checked first |
| `firstName` | Required, 1–80 characters after trimming, no control characters |
| `email` | Required, at most 254 characters, valid shape. Stored in lower case |
| `ageGroup` | Empty, or exactly one of the form's six options (with the en dash) |
| `gender` | Empty, or exactly one of the form's four options |
| `genderSelfDescribed` | At most 60 characters. Kept only when gender is "Other / self-describe" |
| `interests` | A list of up to ten of the form's keys, no repeats |
| `mobile` | Empty, or international format `+` and 7–15 digits |
| `city` | Empty, or at most 80 characters |
| `privacyNoticeVersion` | Required label, letters, digits, `.`, `_`, `-`, at most 64 |
| `consentAt` | Stored only if it is a believable time (within 48 hours of the server's clock) |
| `Idempotency-Key` header | If present, must be a UUID |
| Anything else | An unknown field rejects the whole request |

### Secrets and logs

- The secret key is read from the server environment and sent only to Supabase, in request headers.
- It is never in a response, a log line, the built pages or this repository. Tests check each of these.
- Log lines contain an outcome, an HTTP status and at most a database error code, for example
  `{"event":"waitlist","outcome":"invalid","status":400,"field":"email"}`. No name, email, phone, city, interest or
  IP address is logged. The database's error *detail* text is never read, because it can contain submitted values.

## Deployment configuration (not done; for when the founders authorise it)

The function only deploys through **Cloudflare Pages connected to the Git repository** (or Wrangler). Uploading a
built folder by hand does not include it, which is fine for the investor site.

**Build settings (both environments):** build command `npm run build`, output directory `dist`, Node 22.

**Production environment = the investor-facing website. Set nothing.**

| Variable | Value |
|---|---|
| `PUBLIC_WAITLIST_MODE` | not set |
| `PUBLIC_WAITLIST_ENDPOINT` | not set |
| `WAITLIST_ENABLED` | not set |
| `SUPABASE_URL` | not set |
| `SUPABASE_SECRET_KEY` | not set |
| `SITE_PASSWORD` | Secret, 12+ characters (required: without it the site is closed) |

**Preview environment = the private, founder-only test site.** In Pages → Settings → Variables and Secrets,
choose the *Preview* environment only:

| Variable | Type | Value |
|---|---|---|
| `PUBLIC_WAITLIST_MODE` | Plaintext | `live` |
| `PUBLIC_WAITLIST_ENDPOINT` | Plaintext | `/api/waitlist` |
| `WAITLIST_ENABLED` | Plaintext | `true` |
| `SUPABASE_URL` | Plaintext | `https://<project-ref>.supabase.co` |
| `SUPABASE_SECRET_KEY` | **Secret** (encrypted) | the project's secret key, typed into Cloudflare only |
| `SITE_PASSWORD` | **Secret** (encrypted) | the site password |

Then:
1. Make sure `SITE_PASSWORD` is also set as a Secret in the Preview environment (`docs/HUMAN-SITE-PASSWORD.md`).
   Without it the preview stays closed. With it, the preview and its `/api/waitlist` are behind the password.
2. Push a branch (for example `waitlist-test`). Cloudflare builds a preview at `waitlist-test.<project>.pages.dev`.
3. Sign in. The waitlist header on that site reads "Private test — what you enter is saved".

Never give `SUPABASE_SECRET_KEY` a name starting with `PUBLIC_`, never set it as plaintext, and never put it in
`.env`, `.dev.vars` or any file in this repository.

## First real test (founders, on the private preview only)

No test has ever touched the real database. Before relying on it:

1. In the Supabase SQL editor run the three checks at the bottom of `supabase/waitlist_registrations.sql`:
   the column list must match that file, row-level security must be on, and there must be no policies.
2. Submit the waitlist once on the private preview with test details. Expect the closing chapter.
3. In Supabase → Table editor, confirm one row with the expected values and a `consent_at` time.
4. Submit the same email again. Expect the closing chapter and still one row.
5. If a submission shows "We couldn't complete your registration": Pages → the deployment → Functions → logs.
   `db-error` with `db: 401` means the key was refused; `code: "PGRST204"` or a `42…` code means a column or the
   table name differs from the schema file (the log names the column).
6. Delete the test rows afterwards.

## Known limits

- **Rate limiting is best effort.** It is held in the memory of one running instance. For a public launch add a
  Cloudflare rate-limiting rule on `/api/waitlist`, and consider a challenge such as Turnstile.
- **A script can forge the `Origin` header.** The origin check stops other websites' pages, not a determined
  script; validation, the size limit and rate limiting bound what such a script can do, and it can never read data.
- **Supabase free plan:** as far as known, projects pause after about a week without activity and have no
  automatic backups. A paused project makes every submission fail (the page says so and keeps the details).
- **The public notices describe the demonstration.** The Privacy Policy on the site says nothing is stored. That is
  true of the investor build and false of a live build, which is why live builds are private and labelled.
  Real registrations from the public need the full, professionally prepared documents first
  (`docs/HUMAN-LEGAL-REVIEW-REGISTER.md`).
