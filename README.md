# HUMAN — prelaunch website (staging build)

Static site built with Astro. No backend, no analytics, no third-party requests.
**Not deployed. Not collecting data.** See `docs/HUMAN-RELEASE-GATES.md` before any launch.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:4321.

## Build and test

```bash
npm run build
```

```bash
npm run preview
```

With the preview running (it prints its port, normally 4321):

```bash
npm run test:e2e
```

```bash
npm run screenshots
```

The tests and screenshots use the Playwright library. If it is not installed on your machine:

```bash
npm install --no-save playwright && npx playwright install chromium
```

## Where things are

| Path | What |
|---|---|
| `src/pages/` | Routes: `/`, `/women`, `/men`, `/about`, `/faq`, `/waitlist`, `/privacy`, `/terms`, `/medical-disclaimer`, 404 |
| `src/components/home/` | Hero and the eight story scenes |
| `src/scripts/motion.ts` | The whole motion engine (two primitives) |
| `src/scripts/waitlist.ts` | Waitlist state machine and validation |
| `src/data/site.ts` | Navigation, six stages, states/UTs, contact and endpoint switches |
| `docs/` | Status, decisions, assets, motion registry, release gates, test report, review screenshots |
| `HUMAN-Claude-Master-V3/` | The handoff kit this build follows |
