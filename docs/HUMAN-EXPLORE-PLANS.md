# HUMAN — Explore Plans (`/explore-plans`)

A dedicated page that introduces the membership architecture HUMAN is developing: nine categories, 41 plan names.
It is not a pricing page. Nothing on it can be bought, booked or joined except the existing waitlist.

## Where things live

| What | File |
|---|---|
| Page | `src/pages/explore-plans.astro` |
| Categories, plan names, image focus, status note (single source) | `src/data/plans.ts` |
| Heading block | `src/components/plans/PlansIntro.astro` |
| Horizontal explorer (row, no-JS list) | `src/components/plans/MembershipExplorer.astro` |
| Card | `src/components/plans/MembershipCard.astro` |
| Progress line and arrows | `src/components/plans/CarouselControls.astro` |
| Overlay (one dialog for all categories) | `src/components/plans/MembershipOverlay.astro`, `MembershipPlanList.astro` |
| Closing invitation | `src/components/plans/PlansCta.astro` |
| Behaviour | `src/scripts/plans-explorer.ts`, `src/scripts/plans-overlay.ts` |
| Navigation entry | `src/data/site.ts` (`NAV`) |
| Tests | `tests/e2e.mjs`, ids `XP-01` to `XP-12` |

## Photographs (supplied by the founders, 2026-11-19)

Originals are kept unmodified in `src/assets/memberships/` (1086 × 1448 WebP). Responsive WebP renditions
(420, 640, 860 and 1086 px wide, quality 82) are generated at build time. No image was generated, replaced or retouched.

| Upload | Category | File |
|---|---|---|
| 01 | HUMAN for Him | `human-for-him.webp` (replaced 2026-11-20 with the founders' candid living-room photograph; the earlier posed portrait is in git history at f1ca818) |
| 02 | HUMAN for Her | `human-for-her.webp` |
| 03 | HUMAN for Athletes | `human-for-athletes.webp` |
| 04 | HUMAN for Professionals | `human-for-professionals.webp` |
| 05 | HUMAN for Young Adults | `human-for-young-adults.webp` |
| 06 | HUMAN for Seniors | `human-for-seniors.webp` |
| 07 | HUMAN for Couples | `human-for-couples.webp` |
| 08 | HUMAN for Kids | `human-for-kids.webp` |
| 09 | HUMAN for Families | `human-for-families.webp` |

Display order on the page: Him, Her, Athletes, Seniors, Families, Professionals, Young Adults, Kids, Couples.

## Before publication (open clearance items)

These are founder, legal or clinical decisions. The preview keeps the supplied names and assets as briefed.

1. **HYROX.** The Athletes photograph shows the HYROX name, an event backdrop and a finisher's lanyard, and one plan
   is named "HYROX & Hybrid Athletes". HYROX is a registered trademark. Without written permission this can read as
   a partnership or endorsement. Options: obtain permission, crop or replace the photograph, rename the plan
   (for example "Hybrid Athletes").
2. **People in the photographs.** They are illustrative campaign images, not HUMAN members. The page does not say
   otherwise, but it also carries no disclosure line (the homepage does: "Images, where shown, are of models").
   Decide whether to add the same line here.
3. **Plan names with clinical or regulatory weight**, to be reviewed by a qualified clinician and counsel before any
   public launch: Sexual & Fertility Health, Preparing for Parenthood, Periods & Hormones, Menopause & Healthy
   Ageing, every HUMAN for Kids plan (testing of minors, parental consent), Assisted Health Monitoring,
   Comprehensive Senior Health, Build Your Family Plan, Corporate Membership, Workplace Health.
4. **Scope.** HUMAN's current development scope is bloodwork-based preventive health. The names must not be read as
   a promise of treatment, fertility services, screening beyond bloodwork, or specialist care.
5. **Status.** Only Overall Health for Him and for Her are current development priorities. Every overlay says
   "Memberships currently in development."; nothing is presented as available.
