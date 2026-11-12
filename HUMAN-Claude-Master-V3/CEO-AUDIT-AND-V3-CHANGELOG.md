# HUMAN — CEO-level review of V2 and corrective decisions in V3

**Review basis:** Actual 20,117-word V2 prompt, 202-row motion cue sheet, route checklist and selected HUMAN project direction. This is a design/product/implementation assessment, not a certification that the website is live or that the law has been reviewed.

## Overall verdict

**V2 is technically thoughtful but over-specified and under-prioritised.** It correctly protects against fake health claims, incorrect app screens, unsafe waitlist submissions and arbitrary generated footage. Its strongest assets are the eight-scene architecture, truthful prelaunch language and progressive screenshots/tests. However, asking an AI implementer to satisfy 202 cues could reward quantity over quality, and the experience lacked a concise CEO-level conversion/trust strategy and a decisive signature-movement hierarchy. **V3 fixes those defects rather than simply adding more effects.**

## High-priority findings and fixes

| Priority | V2 problem / ambiguity | V3 correction | Where |
|---|---|---|---|
| P0 | 202 animation/interaction cues appear equally authoritative; site may become busy, heavy and incoherent | `CORE / SIGNATURE / POLISH / CONDITIONAL` classes; only 3 signature effects; other cues are candidates and must earn their place | D00; motion registry |
| P0 | Long 8-scene story could delay understanding and waitlist participation | First-viewport status and CTA; discreet jump to how HUMAN works; three visitor paths; no forced scroll | B05 |
| P0 | Prelaunch membership could be mistaken for live healthcare | explicit `planned vs available now` editorial honesty module; status wording; claims and founder gating | A07, B05, K06 |
| P0 | Real app folder not yet supplied; prompt risks polished mock preview | strict actual folder audit, screenshot evidence, conditional `/app` route, no fabricated app modules | H04 |
| P0 | Form may look real while backend/legal aren't approved | five visual chapters, three data steps; preview cannot submit, strict success evidence, operational vs optional update consent | G08 |
| P1 | Generic black-and-amber design repeated throughout the page | stronger composition, mobile crops, one narrative HUMAN Thread motif, nonclinical symbolism | C07 |
| P1 | Missing precise distinctive *meaningful* animation architecture beyond general revealUp/masks | Reveal Lens, From Numbers to Clarity, Connected Thread with 21 numbered sub-behaviours | E03A/E05A/E06A |
| P1 | Generic app showcase motion could obscure UI or mislead about real features | 7 prototype-grounded UI interactions; readable real screen first; iframe security fallback | H04 |
| P1 | Too many Flow assets may be produced because the brief sounds cinematic | media hierarchy, 8-shot production list (most code/native), desktop/mobile posters first, credits gate | I08 |
| P1 | Existing motion cue sheet column headings do not reliably distinguish meaning and trigger per source table, and it reads as compulsory | new clearly labelled source fields and explicit classification/status/evidence columns (manual parsing by implementer still required) | checklists/MOTION-CUE-REGISTRY-V3.csv |
| P1 | No explicit leadership signoff test separate from motion checklist | founder-facing 3 design gates + later production gate, honest PASS/FAIL/BLOCKED | K06; CEO signoff sheet |
| P1 | Tech targets and safeguarding distributed across many sections | consolidated stability, Git-worktree safety, responsive/performance/a11y, privacy controls | J08 |

## What NOT to add

- More long-duration generated videos, autoplay sound, fake 3D scan dashboards, unreviewed clinical data, artificial health scores, continuous parallax on every photo, cursor effects that steal pointer control, horizontal scroll locking, extra pages merely to fill sitemap, unnecessary new integrations, or subscription spending before a beautiful static build exists.
- Do not invent diagnoses, lab panels, clinical partners, doctors, founding team details, prices, outcomes, appointment booking, membership availability or launch date certainty.

## Open inputs that no prompt can solve

- Actual **HUMAN app prototype folder** and approved public/demo scope.
- Approved real **waitlist backend** and India-appropriate privacy/consent wording, security, data retention and production permissions.
- Verified founder story, company contact/domain, exact legal entity details, product claims and clinical governance.
- Any production-licensed original photography or additional portrait crops, if generated assets prove inadequate in real layouts.
- Founder approval for credit spending, public deploy or legal data collection.

## How to judge the next Claude result

Request a **real browser preview and three screenshots** of hero (desktop, mobile, mid-scroll), a concise changed-files list, and honest status of blocked items. Ask for **one strongest improvement** (not five arbitrary effects) if it still looks generic. Then review full homepage before expanding to interior pages. No paid footage required for an excellent first checkpoint.
