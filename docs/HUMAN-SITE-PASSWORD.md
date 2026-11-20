# HUMAN — site password

**Status (2026-11-20): built and tested in Cloudflare's local runtime. Not deployed.**

The whole website sits behind one shared password. It is enforced on the server by a Cloudflare Pages Function
(`functions/_middleware.ts`, logic in `server/site-gate.ts`), so it needs no paid service and no Cloudflare Zero
Trust. A visitor sees a small sign-in page, enters the password once, and stays signed in on that browser for 7 days.

## What is protected

Everything the site serves: every page, every image, font, script and style file, `robots.txt`, and the
`/api/waitlist` function. There is no public address. Because the check is part of the site's own code, it applies
equally to the `pages.dev` address, every preview and branch address, and any custom domain.

`public/_routes.json` sends every request through the gate (`"include": ["/*"]`, nothing excluded).
**Do not add exclusions to that file**: an excluded path is served without a password.

## Fail closed

| Situation | What a visitor gets |
|---|---|
| `SITE_PASSWORD` not set, empty, or shorter than 12 characters | "This site is not available." (503) for every address |
| The gate code throws for any reason | An error (500). Never the site |
| Not signed in, asking for a page | The sign-in page (401) |
| Not signed in, asking for a file or the API | A bare refusal (401) |
| Wrong password | The sign-in page with "That password is not correct." |
| Ten wrong passwords from one address in 15 minutes | Refused for 15 minutes, even with the right password |

Nothing sent to someone who is not signed in may be stored (`Cache-Control: no-store`). Pages sent to a signed-in
visitor are marked private, so only that person's own browser keeps a copy.

## Set-up in Cloudflare (when the founders deploy)

The site must be deployed by **connecting Cloudflare Pages to the Git repository**. Never upload the built `dist`
folder or the hosting zip by hand: a hand upload does not include the gate and **would be public**.

1. **Choose a password.** At least 12 characters. A phrase of four or five unrelated words works well.
   Shorter than 12 and the site stays closed.
2. **Add it as a secret.** Pages project → Settings → Variables and Secrets → Add.
   - Variable name: `SITE_PASSWORD`
   - Type: **Secret** (encrypted), not Plaintext
   - Value: the password
   - Add it to **Production**, and add it again to **Preview**. A preview without it stays closed, which is safe.
3. **Redeploy.** Variables apply to new deployments only: Deployments → the latest one → Retry deployment.
4. **Set the runtime to Fail closed.** Pages project → Settings → Runtime (on some accounts: Settings → Functions) →
   "Fail open / Fail closed" → choose **Fail closed** → Save.
   Why: the free plan allows 100,000 function requests a day. With "Fail open", once that number is passed Cloudflare
   serves the files directly, skipping the password. With "Fail closed" it shows an error instead.
5. **Check it.** In a private browser window open the `pages.dev` address: it must ask for the password. Open a
   deep link such as `/about`: it must ask too. Enter a wrong password: it must refuse. Enter the right one: the
   site opens on the page you asked for.

Before step 2 is done the site is closed, not open, so there is no moment at which it is public.

## Using it

- **Sharing with an investor:** send the link and the password in separate messages.
- **Signing out:** open `/__human/logout`.
- **Changing the password:** edit the `SITE_PASSWORD` secret and redeploy. Everyone is signed out at once and needs
  the new password. This is also how to withdraw access.
- **Sessions** last 7 days per browser.

## What it does not do

- **One shared password.** Access cannot be withdrawn from one person without changing it for everyone, and the
  site does not know who signed in.
- **Guess limiting is best effort.** It is counted in the memory of one running instance. The real defence is a
  long password.
- **Files already downloaded are not protected.** The zip packages and `HUMAN-website.html` open without a password
  for anyone who has them.
- **It is not an audit log or an identity system.** If named, revocable access is needed later, Cloudflare Access or
  a similar service is the right tool.

## How it works (for an engineer)

- Sign-in posts the password to `/__human/login`. It is compared in constant time with the secret.
- On success the server sets `__Host-human_session`: `HttpOnly`, `Secure`, `SameSite=Lax`, whole site, 7 days.
  The value is `v1.<expiry>.<HMAC-SHA256>`; the signing key is derived from the password, so a new password
  invalidates every session. The cookie contains no password and cannot be read by page scripts.
- Every request verifies that signature before `next()` is called.
- Logs carry outcomes only (`login-ok`, `login-wrong`, `closed`): never the password, what was typed, or an address.

## Tests

| Command | What runs | Result |
|---|---|---|
| `npm run test:gate` | 15 unit checks of `server/site-gate.ts` | 15 passed |
| `node tests/site-gate-live.mjs` | 9 end-to-end checks in Cloudflare's local Pages runtime with a real browser | 9 passed |
| `node tests/waitlist-live.mjs` | The 12 waitlist-backend checks, now run through the gate | 12 passed |

The real-browser run found and fixed one fault the unit checks could not see: a privacy header on the sign-in page
made browsers blank the form's origin, and the gate then refused every sign-in.
All passwords in the tests are made-up values. No test has run on Cloudflare itself.
