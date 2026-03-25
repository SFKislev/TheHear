# Web Vitals Analysis

Date run: 2026-03-13

## Tested URLs

### Live page

URL: `https://www.thehear.org/en/us`

Mobile Lighthouse:
- Performance: `46`
- FCP: `1.8s`
- LCP: `18.2s`
- TBT: `930ms`
- CLS: `0.013`
- Speed Index: `7.5s`

Desktop Lighthouse:
- Performance: `75`
- FCP: `0.5s`
- LCP: `4.6s`
- TBT: `60ms`
- CLS: `0.08`
- Speed Index: `1.1s`

Top opportunities from Lighthouse:
- Reduce unused JavaScript
- Preconnect to required origins
- Eliminate render-blocking resources
- Reduce unused CSS
- Avoid serving legacy JavaScript to modern browsers

Additional mobile trace findings:
- Root document response time was fast at about `70ms`
- Main-thread time was dominated by script evaluation
- `gtag.js` showed measurable scripting cost
- The heaviest boot-up work came from the main Next/app chunk rather than from slow server delivery

### Feed page

URL: `https://www.thehear.org/en/us/15-06-2025/feed`

Mobile Lighthouse:
- Performance: `67`
- FCP: `1.7s`
- LCP: `7.0s`
- TBT: `340ms`
- CLS: `0.007`
- Speed Index: `3.5s`

Desktop Lighthouse:
- Performance: `89`
- FCP: `0.5s`
- LCP: `2.1s`
- TBT: `10ms`
- CLS: `0.002`
- Speed Index: `1.5s`

Top opportunities from Lighthouse:
- Reduce unused JavaScript
- Avoid serving legacy JavaScript to modern browsers

### Historical date page

URL: `https://www.thehear.org/en/us/01-04-2025`

This page showed a visible load-time layout shift during local testing before the later fixes below.

## Main conclusions

- The live page is significantly more expensive than the feed page on mobile.
- The bottleneck is primarily client-side execution and hydration, not backend response time.
- Raw first-load JS size alone does not explain the gap. The feed page can ship more JS on paper and still perform better because it does less work immediately after load.

## Code-level bottlenecks identified

1. Large live client shell on the country page.
   - `app/(localized)/[locale]/[country]/CountryPage_content.js`
   - Immediately mounts interactive layout, panels, sliders, modal logic, viewport logic, and store wiring.

2. Live Firebase work starts on initial page load.
   - `utils/database/useSourcesManager.js`
   - `utils/database/useSummariesManager.js`
   - `utils/database/useFirebase.js`
   - On `/en/us`, the live page eagerly initializes Firestore and subscriptions for headlines and summaries.

3. Too many source cards were being mounted.
   - `app/(localized)/[locale]/[country]/MainSection.js`
   - The page rendered all source cards, even though most were immediately discarded after hydration because they were not active.

4. Per-card hydration cost is high.
   - `app/(localized)/[locale]/[country]/Source/SourceCard.js`
   - Each card carries state, effects, typography logic, RTL checks, context menu state, and optional translation fetch logic.

5. MUI controls are on the critical path.
   - `app/(localized)/[locale]/[country]/SideSlider.js`
   - `app/(localized)/[locale]/[country]/RightPanel.js`
   - `app/(localized)/[locale]/[country]/TopBar/TopBar.js`
   - These add client-side execution cost and event listeners early in page life.

6. Avoidable client-side sorting/recomputation exists.
   - `utils/database/useCurrentSummary.js`
   - `app/(localized)/[locale]/[country]/TopBar/TopBar.js`

7. Analytics adds some cost, but it is not the primary issue.
   - `components/LazyAnalytics.js`
   - `components/GoogleAnalytics.js`

## Changes made on 2026-03-13

1. Deferred noncritical live-page UI with dynamic imports.
   - `CountryPage_content.js`
   - Side slider, right panel, about menu, first-visit modal, and date navigator now load later instead of being part of the first critical pass.

2. Delayed live subscriptions until idle time.
   - `useSourcesManager.js`
   - `useSummariesManager.js`
   - Initial server-rendered content still appears immediately, while live Firestore refresh work starts after the browser is less busy.

3. Stopped rendering inactive source cards.
   - `MainSection.js`
   - Only visible/active sources are now mapped into `SourceCard`.

4. Reduced avoidable client work.
   - `useCurrentSummary.js`
   - `TopBar.js`
   - Removed mutation-based sorting and memoized summary/headline selection.

5. Stabilized the historical date-page layout.
   - `RightPanel.js`
   - `CountryPage_content.js`
   - `DateNavigator.js`
   - Fixed late top-bar state changes, removed a mount-time panel pop-in, and constrained the date navigator so async summary loading does not resize the footer.

## Local validation after changes

These measurements were run against the local production build at `http://localhost:3000/en/us` after the code changes above. They do not reflect the public site until a deployment is made.

Initial local Lighthouse after first patch:
- Mobile: performance `50`, FCP `2.5s`, LCP `18.2s`, TBT `810ms`, CLS `0.036`, Speed Index `4.8s`
- Desktop: performance `76`, FCP `0.6s`, LCP `4.4s`, TBT `90ms`, CLS `0.077`, Speed Index `1.0s`

Follow-up local Lighthouse after second patch:
- Mobile pass 2: performance `78`, FCP `2.0s`, LCP `5.7s`, TBT `0ms`, CLS `0`, Speed Index `2.0s`
- Mobile pass 3: performance `79`, FCP `2.0s`, LCP `5.1s`, TBT `0ms`, CLS `0`, Speed Index `2.0s`
- Desktop pass 2: performance `95`, FCP `0.5s`, LCP `1.6s`, TBT `0ms`, CLS `0`, Speed Index `0.5s`
- Desktop pass 3: performance `94`, FCP `0.5s`, LCP `1.7s`, TBT `0ms`, CLS `0`, Speed Index `0.5s`

Latest local live-page sanity check after the date-page stability fix:
- Mobile: performance `49`, FCP `2.4s`, LCP `15.5s`, TBT `810ms`, CLS `0.039`, Speed Index `4.7s`
- Desktop: performance `74`, FCP `0.5s`, LCP `4.4s`, TBT `140ms`, CLS `0.069`, Speed Index `1.1s`

Historical date page after the stability fix:
- Mobile: performance `47`, FCP `2.0s`, LCP `7.5s`, TBT `1240ms`, CLS `0.065`, Speed Index `4.1s`
- Desktop: performance `92`, FCP `0.5s`, LCP `1.7s`, TBT `20ms`, CLS `0.002`, Speed Index `1.3s`

Observed impact:
- Live route first-load JS dropped from about `312 kB` to `290 kB` in `next build`
- The built local app now tests much better than the earlier baseline, especially on TBT and LCP
- Remaining Lighthouse opportunities are now mostly render-blocking CSS and unused CSS
- These results still need deployment-time verification on the public site, because CDN behavior and third-party timing can differ
- The historical date page CLS issue was substantially improved locally, especially on desktop (`1.058`/`0.5` class regressions during investigation down to `0.002` after the final fix)

## Remaining issues after first optimization pass

1. Mobile LCP is still the biggest problem.
   - The local build improved substantially, but Lighthouse still points at CSS on the critical path.
   - Further work should focus on critical CSS, font delivery, and above-the-fold styling cost.

2. CSS is now more visible in the local report.
   - Lighthouse flagged render-blocking CSS and unused CSS more strongly on the local build.
   - The critical path still includes multiple global CSS files.

3. Shared app/runtime chunks remain expensive.
   - The main shared chunks still dominate script evaluation.
   - More aggressive component splitting would likely be needed for larger gains.

4. Analytics and third-party work are still measurable.
   - `gtag.js` remains nontrivial on mobile, even though it is not the primary bottleneck.

## LCP diagnosis update

Further investigation showed that the live page LCP is a real above-the-fold source-card headline, not a server-spin artifact.

Public Lighthouse selected:
- `/en/us`: a source-card headline `<h3>` inside the first visible card
- `/en/us/01-04-2025`: the same kind of source-card headline `<h3>`

The strongest root cause found in the app code was that live pages were showing loading skeletons in source cards during the first client refresh even when SSR headline data already existed.

Relevant path:
- `utils/database/useSourcesManager.js`
- `app/(localized)/[locale]/[country]/MainSection.js`
- `app/(localized)/[locale]/[country]/Source/Headine.js`
- `app/(localized)/[locale]/[country]/Source/SourceName.js`

Fix applied:
- preserve SSR headline content instead of swapping to skeletons during the initial live refresh
- keep live headline updates, but delay the visible swap briefly
- restore a small sync spinner so freshness is still communicated to the user

Latest local validation after this fix:
- Live page mobile: performance `77`, FCP `2.5s`, LCP `5.4s`, TBT `0ms`, CLS `0`
- Live page desktop: performance `93`, FCP `0.7s`, LCP `1.7s`, TBT `0ms`, CLS `0.001`

## Expected impact

- Lower mobile TBT on the live page.
- Lower hydration and scripting cost during first load.
- Less client work before the first meaningful content is interactive.
- Better separation between critical content and secondary controls.

## Raw reports

- `.tmp-lighthouse-mobile.json`
- `.tmp-lighthouse-desktop.json`
- `.tmp-lighthouse-feed-mobile.json`
- `.tmp-lighthouse-feed-desktop.json`
- `.tmp-lighthouse-mobile-after.json`
- `.tmp-lighthouse-desktop-after.json`
- `.tmp-lighthouse-local-mobile.json`
- `.tmp-lighthouse-local-desktop.json`
- `.tmp-lighthouse-local-mobile-pass2.json`
- `.tmp-lighthouse-local-mobile-pass3.json`
- `.tmp-lighthouse-local-desktop-pass2.json`
- `.tmp-lighthouse-local-desktop-pass3.json`
- `.tmp-lighthouse-date-mobile-3003.json`
- `.tmp-lighthouse-date-desktop-3003.json`
- `.tmp-lighthouse-live-mobile-3004.json`
- `.tmp-lighthouse-live-desktop-3004.json`
- `.tmp-live-local-3021-mobile.json`
- `.tmp-live-local-3021-desktop.json`

## 2026-03-14 full-site overview

These measurements were run locally against the current production build on `http://localhost:3024`.

Important note:
- The live page had previously shown a much better local run (`77` mobile) after the headline/skeleton stabilization fix.
- A later local run in this document already showed regression (`49` mobile).
- The latest full-site matrix confirms that the live page is still inconsistent and should currently be treated as not yet fixed.

### Current route matrix

| Page | Path | Mobile Score | Mobile FCP | Mobile LCP | Mobile TBT | Mobile CLS | Desktop Score | Desktop FCP | Desktop LCP | Desktop TBT | Desktop CLS |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Live US | `/en/us` | 51 | 2.4s | 8.4s | 451ms | 0.183 | 91 | 0.5s | 1.8s | 34ms | 0.080 |
| Live Israel | `/heb/israel` | 58 | 2.4s | 9.2s | 460ms | 0.021 | 86 | 0.5s | 2.2s | 26ms | 0.107 |
| Date US | `/en/us/02-03-2026` | 47 | 2.0s | 10.9s | 954ms | 0.030 | 91 | 0.4s | 1.9s | 2ms | 0.002 |
| Feed US | `/en/us/15-06-2025/feed` | 82 | 2.0s | 4.7s | 0ms | 0.000 | 98 | 0.4s | 1.1s | 8ms | 0.006 |
| Global History Day | `/en/global/history/2026/03/02` | 76 | 2.0s | 5.8s | 134ms | 0.016 | 98 | 0.5s | 1.2s | 0ms | 0.001 |
| US History Month | `/en/us/history/2026/03` | 80 | 1.7s | 5.1s | 82ms | 0.024 | 98 | 0.4s | 1.1s | 0ms | 0.002 |
| US History Hub | `/en/us/history` | 80 | 1.4s | 4.8s | 150ms | 0.015 | 99 | 0.3s | 1.0s | 0ms | 0.002 |
| Global | `/en/global` | 68 | 1.7s | 6.3s | 315ms | 0.096 | 72 | 0.4s | 1.3s | 0ms | 3.170 |
| About | `/about` | 81 | 1.5s | 4.7s | 163ms | 0.039 | 98 | 0.4s | 1.1s | 0ms | 0.032 |
| Methodology | `/methodology` | 78 | 1.5s | 5.0s | 176ms | 0.071 | 98 | 0.4s | 1.1s | 0ms | 0.017 |
| Contact | `/contact` | 73 | 1.4s | 6.9s | 198ms | 0.058 | 98 | 0.3s | 1.1s | 0ms | 0.007 |

### What this means now

- The feed page is currently the strongest primary route on both mobile and desktop.
- The live pages are still weak on mobile and need more work despite earlier improvements.
- The date page remains poor on mobile.
- The global page has a major desktop CLS issue.
- Archive/history routes are generally in much better shape than live/date/global.

### Prioritization from the latest matrix

1. Fix desktop CLS on `/en/global`.
2. Improve mobile LCP/TBT on `/en/us/02-03-2026`.
3. Revisit mobile live-page performance on `/en/us` and `/heb/israel`.
