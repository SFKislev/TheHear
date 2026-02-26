# SEO Context Memory

Last updated: 2026-02-25
Owner: ongoing team notes

## Purpose
This is a living memory file for SEO work in The Hear codebase.
Use it to track:
- what we changed
- what problem each change was meant to solve
- current state
- next experiments

## Product Identity (Anchor for SEO Decisions)
- The Hear is a news literacy tool.
- It is a live media dashboard and a headline archive.
- Core value: show what editors across sources/countries prioritize as the main story, without editorial rewriting by The Hear.
- Product promise: help users monitor, compare, and contextualize headline agendas across time.
- The archive is not a side feature; historical replay is core to the product.

## Mission and Scope
- Mission: improve news literacy by making editorial priorities visible across outlets, countries, and time.
- Scope:
- live country pages (ongoing headline monitoring)
- feed/day pages (daily snapshots with summary context)
- country monthly archives (history by day)
- global daily archive pages (cross-country comparison for a single date)
- search across archived headlines
- Method principle: breadth over depth. The Hear tracks main headlines, not full article content.
- Translation and AI overviews are supporting layers to increase accessibility and comparability.

## Target Product-Market Fit
### A) Core Dashboard
- User need: see all major outlets from one country simultaneously, live.
- Value: side-by-side, unfiltered, uncurated view of a full national media landscape in real time.
- Target users: people following a specific country closely.
- Market shape: this bifurcates by country.
- Examples: US readers -> `/en/us`; German readers -> `/en/germany`; readers in Israel -> `/heb/israel`.

### B) Archival Richness
- User need: answer "what happened on this date?" with structured historical media evidence.
- Value: large archive footprint across country daily pages, monthly archives, and global date pages comparing 20 countries side by side.
- Target users: researchers, historians, journalists, and high-intent historical searchers.
- Strategic view: each page may have low standalone demand, but the archive as a whole is a high-value evergreen public dataset for search engines and AI retrieval.

### C) Foreign News in English
- User need: get an unfiltered English-language window into another country's media space.
- Value: real-time, uncurated access to local editorial priorities from abroad.
- Strong-use countries: especially relevant for high-attention geographies such as Iran, Lebanon, and Israel.
- Target users: diaspora communities, expats, researchers, journalists.

## Non-Goals (Important for SEO Framing)
- The Hear is not trying to be a traditional news publisher producing original reporting.
- The Hear is not trying to personalize a feed or optimize for clickbait novelty.
- The Hear should not present itself as a generic "latest news" site; it is a monitoring and archival observatory.

## Distribution Context (SEO + Ads)
- The Hear operates as a nonprofit and has secured the Google Ad Grant.
- SEO strategy should work in tandem with paid campaigns run under the grant.
- Principle: use ads to accelerate discovery of priority use-cases/pages, and use SEO to compound durable organic discovery over time.
- Planning implication: prioritize landing pages, messaging, and measurement frameworks that serve both channels coherently.

## SEO Guardrails (Derived from Mission)
- Prioritize indexation and discoverability of archival pages, not only fresh URLs.
- Keep titles/descriptions specific to date/country/headline context, not generic templates.
- Preserve stable locale/canonical signals and avoid duplicate URL namespaces.
- Maintain clear information scent that pages are part of a time-based archive and media literacy tool.
- Evaluate SEO changes against product truth first: if a tactic improves CTR but misrepresents what The Hear is, reject it.

## Current Situation (as of 2026-02-25)
- Indexing pressure is still the core issue (especially crawl/index coverage quality).
- Technical SEO hardening has been done across feed/archive infrastructure.
- We are now improving query relevance signals page-by-page (title quality, locale normalization, canonical consistency).

## Incident History (SEO Catastrophe Timeline)
Note: this section records operational history and working hypotheses for continuity.

### Domain 1: `www.the-hear.com` (historical)
- Reported trajectory: after initial growth, Google aggressively de-indexed the site.
- Reported end state: effectively full de-indexation, with pages ending in "Crawled - currently not indexed."
- Working hypothesis at the time: heavy CSR/interactive rendering caused weak crawler-visible content (Google seeing shell-like pages).
- Constraint: the product is highly dynamic and interactive (time-machine interface), making crawler-complete rendering harder.
- Interpretation: technical rendering/indexability issues were likely identified too late, after trust/index quality had already degraded.

### Migration Decision
- Strategic decision: abandon `www.the-hear.com` and relaunch on fresh domain `thehear.org`.
- Rationale: reset domain-level indexing trajectory and ship a technically stronger crawler-facing architecture.

### Domain 2: `thehear.org` (current)
- Major technical overhaul implemented, especially around feed pages.
- Feed pages are intentionally SEO-oriented: static/ISR, crawlable versions of core daily content.
- UX split by intent:
- date pages: better human UX (time-machine interaction)
- feed pages: bot-friendly static archival pages for indexing
- Current policy: date pages are now `noindex` to prioritize feed-page crawling/indexing focus.

### Expected Outcome vs Reality
- Expected: feed pages would establish The Hear as a reliable archive, then long-tail archive demand would compound organic coverage.
- Observed: this expected indexing expansion has not materialized yet.
- Risk signal: indications suggest "Crawled - currently not indexed" pressure may also be rising on `thehear.org`.
- Evidence provided (GSC screenshot): "Crawled - currently not indexed", affected pages ~12.2k, validation started 2026-02-22.

### Business/Distribution Impact
- Without stable indexing, archive pages cannot reliably support dynamic search ad strategies tied to archival demand.
- This weakens the SEO + Google Ad Grant flywheel (paid discovery signals and organic compounding reinforce each other only if indexing is healthy).

### Query Quality Concern (Recent Symptom)
- Reported concern: Google Search appears to surface The Hear for seemingly low-fit or random long-tail queries.
- Example queries observed in the last week:
- `kulturalny, oczytany, dyskretny. tacy ludzie jak epstein są bezcenni`
- `tacy ludzie jak epstein są bezcenni`
- Interpretation: possible weak topical understanding / weak site-level query mapping signal despite broad archive coverage.

### Current Diagnosis Status
- Root cause remains unresolved.
- Latest title improvements are considered directionally positive, but not yet treated as a complete solution.
- Priority: identify primary driver(s) of persistent "Crawled - currently not indexed" at scale on `thehear.org`.

## Cross-Engine Signals (2026-02 Snapshot)
### Crawl Activity (Infrastructure Signal)
- Observed on Vercel: approximately 15k-20k edge requests per 6-hour window.
- A substantial share is crawler traffic from multiple providers.
- Interpretation: crawl demand exists; the bottleneck appears to be indexing quality/selection, not crawler absence.

### Bing Search Relevance Signal
- Reported pattern: Bing appears to map The Hear to more sensible queries than Google in the current period.
- Observed fit: date-specific and archive-intent queries are being matched to The Hear.
- Example query patterns:
- `times of israel 23 february 2026`
- `what was the top news story december 15 2025?`
- `what happened on december 22 2025`
- `israel news 21 february 2026`
- Interpretation: Bing seems to better understand The Hear as a date-aware archive, even before full crawl/index saturation.

### Bing Performance (Last Week, User-Reported)
- Impressions: 224
- CTR: 2.2%
- Assessment: absolute performance is still low, but query-fit quality appears directionally better than current Google behavior.

### Bing AI Citation Signal (Last Month, User-Reported)
- Bing Webmaster "AI performance" reports `microsoft copilot and partners` cited The Hear 520 times.
- Reported relevant intent examples include:
- `Israel latest news Feb 2026`
- `Global news Jan 23 2026`
- `24 october 2025`
- Interpretation: positive early evidence that The Hear content structure is useful for AI-assisted retrieval and citation.

### Semrush Snapshot (User-Reported, ~10 Months In)
- Organic keywords: 20
- Estimated organic traffic: 1
- Reported backlinks: 14.3k
- Context hypothesis: backlink count may be inflated by redirects/signals related to the legacy `the-hear.com` domain (including 307 behavior), rather than broad independent editorial citation.
- Operational interpretation: current visibility remains far below expected product value and page scale, indicating weak external discovery beyond paid grant-driven traffic.
- Strategic impact: this supports the concern that The Hear is still in a "sandbox/echo chamber" state despite strong archival depth and live dashboard utility.

### Wikipedia Backlink Operation (User-Reported)
- Current progress: approximately 30 backlinks from Wikipedia pages across multiple language editions/countries (for example `de.wikipedia.org`, `es.wikipedia.org`, and others).
- Strategic intent: directly support domain authority/trust during the current indexing crisis.
- Caveat already tracked: Wikipedia links are generally nofollow, so expected impact is primarily indirect (validation/discovery/credibility context) rather than direct PageRank transfer.

## What We Have Tried

### 1) Feed/archive determinism and crawlability
- Feed routes were hardened to static/ISR behavior (`revalidate = 604800`, `dynamic = 'error'`).
- Goal: prevent unstable rendering patterns and improve crawl confidence.

### 2) Sitemap strategy updates
- Full archive coverage maintained.
- Priority windows added for recent pages.
- Goal: preserve long-tail archival indexation while prioritizing fresh crawl demand.

### 3) Invalid locale namespace normalization
- Implemented in `middleware.js` (commit `4498f0e`, 2026-02-23).
- Invalid locale prefixes like `/{invalid}/{country}/...` now redirect to `/en/{country}/...`.
- Goal: reduce duplicate URL namespaces and canonical fragmentation.

### 4) Feed page title quality improvements
- Implemented in `app/[locale]/[country]/[date]/feed/page.js` (commit `4498f0e`, 2026-02-23).
- English titles now include country + readable date + daily headline when available, with length-aware fallback logic.
- Hebrew titles also use structured title building with length-aware fallback.
- Goal: replace generic archive titles with day-specific, query-relevant titles.

### 5) Hebrew feed policy update
- In the same commit, Hebrew feed pages stopped auto-redirecting to English when Hebrew content is missing.
- Comment in code indicates Hebrew URLs should remain first-class localized pages, with canonical/hreflang handling localization.
- Goal: reduce locale signal confusion and keep stable localized URL identity.

## Legacy Docs Synthesis (What To Keep In Mind)
Sources reviewed:
- `seo_strategy.md`
- `DOMAIN_AUTHORITY_CRISIS_ANALYSIS.md`
- `indexing/documentation/GOOGLE_INDEXING_ISSUE_DIAGNOSTIC.md`

### Still Valuable Context
- Technical root-cause work in late 2025 was substantial and real: dynamic rendering/cache contradictions were identified and addressed for archive/feed routes.
- Monitoring remains a major gap: no automated weekly GSC pipeline is in place yet, so diagnosis still depends on manual checks and lagging signals.
- Indexing-lag expectations should remain explicit: meaningful movement typically appears over multi-week windows (not day-by-day).
- "Discovered - currently not indexed" growth is an additional symptom to track alongside "Crawled - currently not indexed."

### Historical Dead Ends (Do Not Re-Try as Primary Fix)
- Overriding cache headers via `next.config` alone while routes are dynamic.
- Overriding cache headers via `vercel.json` alone while routes are dynamic.
- Overriding cache headers via middleware for routes that still render dynamically.
- Client-component lazy-loading as a standalone indexing fix.
- These were previously tested and failed when core route behavior remained dynamic.

### Strategic Tension To Manage Explicitly
- One school (authority-first) recommends shrinking sitemap scope temporarily (recent/high-value subset) until trust signals improve.
- Another school (product-truth) keeps full archive discoverable because archival depth is the core product, not a side feature.
- Current approach favors product-truth/full archive; this should stay an explicit decision, not an accidental default.

### Assumption Quality
- Some older authority analysis assumed near-zero backlinks; current context is more nuanced:
- a large reported backlink count exists, but much may come from legacy-domain redirect structures and nofollow environments.
- Therefore, backlink quantity alone should not be treated as proof of true authority transfer.
- Working conclusion: authority/trust may still be central, but confidence is moderate rather than absolute.

## Verified in Last Commit
Commit: `4498f0e580d455c5e3155a0379dfb7197f7c2fc3`

Files touched:
- `.claude/settings.local.json`
- `app/[locale]/[country]/[date]/feed/page.js`
- `middleware.js`

SEO-relevant outcomes from this commit:
- title generation moved from generic archive format to headline-aware format
- invalid locale prefixes normalized
- Hebrew feed redirect fallback removed

## Open Questions and Working Answers
- Title-format impact on impressions/CTR: too early to evaluate. Priority order is indexation first, then serving, then CTR optimization.
- Invalid-namespace crawling trend after locale normalization: currently not measurable with confidence; treated as hygiene improvement rather than a primary risk driver.
- Weekly SEO check-in cadence: possibly useful, but impact windows are slow and reporting overhead is high. Any cadence should be lightweight and tied to lag-aware metrics.
- Dominant non-indexation factor on `thehear.org`: unknown; current suspicion leans toward site-level trust/authority, but confidence is low.
- Segment-level indexing differences (country vs global archive URLs): difficult to assess reliably under current scale of mixed outcomes (~12k crawled-not-indexed vs ~15k indexed).
- Backlink/authority mismatch reframed:
- Reported high backlink count is likely structurally inflated by legacy-domain redirects (`the-hear.com` via 307/308 behavior), not broad independent citations.
- Additional visibility links (for example Wikipedia references and automated Bluesky posts) are largely nofollow, so direct ranking transfer is limited and mostly indirect (discovery/credibility context).

## Strategic Risks Added
- Keyword strategy at archive scale:
- The site has thousands of pages with unique daily content, but target keyword clusters are not clearly mapped. This creates execution risk for both SEO prioritization and measurement.
- Engagement-signal interpretation risk:
- Live dashboards are intentionally "ambient news" experiences (short glance sessions, often ~8 seconds). This may appear as poor engagement if interpreted without product context.
- Open problem: how to communicate that short sessions are by design, not necessarily low utility.

## Weekly Update Log
Use this block for ongoing conversation and memory updates.

### 2026-02-25
- Added this living SEO memory file.
- Confirmed the latest commit includes title improvements for feed pages and locale normalization.
- Added explicit product identity, mission, scope, and SEO guardrails from `/about` and `/methodology`.
- Added three target product-market-fit strategies: Core Dashboard, Archival Richness, and Foreign News in English.
- Added distribution context that SEO planning should coordinate with Google Ad Grant campaigns.
- Added catastrophic SEO timeline: `the-hear.com` de-indexation history, migration to `thehear.org`, feed-vs-date indexing strategy, and current 12.2k "Crawled - currently not indexed" risk signal.
- Added cross-engine signal snapshot: high crawler request volume on Vercel, Bing query-fit examples, Bing weekly performance (224 impressions, 2.2% CTR), and Bing AI citation count (520 in the last month).
- Added Semrush snapshot gap: 20 organic keywords, estimated traffic of 1, reported 14.3k backlinks, and unresolved mismatch between authority signals and organic outcomes.
- Added Wikipedia backlink operation update: ~30 cross-language Wikipedia backlinks as a deliberate authority-building effort.
- Applied for Google Ads API Basic access (pending review) to enable Keyword Plan usage beyond Explorer restrictions.
- Set up isolated tooling for scaled keyword planning probes at `indexing/ads-api/google-ads-keyword-access-probe.mjs`.
- Ran IndexNow catch-up submissions for SEO-related page updates (excluding UAE):
- submitted feed + country history URLs for the last 120 days.
- submitted an additional older backfill window (365 to 120 days ago) for feed + country history pages.
- observed batch run total of 9,652 URLs with HTTP 200 acceptance responses across batches.
- Replaced open questions with working answers from current operational evidence, clarified backlink interpretation (legacy redirects + mostly nofollow citations), and added two strategic risks: keyword strategy at archive scale and ambient-news bounce/engagement interpretation.
- Added synthesis from legacy SEO documents: preserved key lessons, documented non-solutions to avoid repeating, and clarified the strategic tension between full-archive indexing and reduced-sitemap trust-building.
- Next: record post-change GSC trends after enough time has passed for recrawl/reindex.

### 2026-02-25 (Implementation Pass)
- Feed JSON-LD alignment:
- Updated feed `CollectionPage.name` generation to match current metadata title style (country/date/headline-aware).
- Verified locally on `/en/us/28-09-2025/feed` that JSON-LD name matches `<title>`.
- Monthly history metadata quality:
- Shortened English monthly history description template and aligned metadata + JSON-LD wording.
- Added US/UK article handling (`the US`, `the UK`) in monthly metadata descriptions.
- Monthly history on-page copy consistency:
- Updated expanded/collapsed explanatory copy in `TitleCard.js` and `MonthlyArchiveGrid.js` to remove "`{country} media`" phrasing and use country-aware wording.
- Monthly history country-switch link safety:
- Footer "change country" on monthly archive pages now filters by centralized launch-date availability for the selected month.
- Fixed remaining unfiltered render path in `UniversalFooter` so filtered country list is used consistently.
- Monthly top-nav month bounds:
- Previous/next month arrows in `ArchiveTopBar` now respect country launch month floor and current-month ceiling.
- Fixed duplicate year in monthly archive top title (`October 2024 2024` -> `October 2024`).
- Central launch-date correction:
- Updated Finland launch date in centralized launch-date map to prevent surfacing empty monthly routes before actual data availability.
- Verification:
- Local checks confirmed broken monthly country links removed for pre-launch months.
- Production build passed successfully (`next build`), with one non-blocking ESLint serialization warning from the toolchain.

### 2026-02-25 (Sitemap + Structured Data Follow-Up)
- Sitemap coverage correction:
- Confirmed live sitemap status for Ahrefs-reported URLs: `/en/global` and `/en/iran/history/2025/07` were present, while `/en/us` was missing from sitemap coverage.
- Updated `app/sitemap-static.xml/route.js` to include all country roots under `/en/{country}` (20 pages from central `countries` list, excluding UAE).
- Verified on localhost (`/sitemap-static.xml`) that `/en/us` and all expected `/en/{country}` roots are present.
- Global history metadata copy update:
- Updated English description template in `app/(localized)/[locale]/global/history/[year]/[month]/[day]/metadata.js` to shorter wording focused on "actual headlines."
- Feed JSON-LD validation hardening (targeted):
- In `app/(localized)/[locale]/[country]/[date]/feed/FeedJsonLd.js`, changed `mainEntity.about` from string to `Thing` object and changed `isPartOf` from `ItemList` to `CreativeWorkSeries`.
- Verified on localhost feed page (`/en/us/16-02-2025/feed`) that JSON-LD now emits `about.@type = Thing` and `isPartOf.@type = CreativeWorkSeries`.

### 2026-02-25 (Localization Layout + Route-Group Validation)
- What changed:
- Moved locale routes under `app/(localized)/[locale]/...` and static pages under `app/(static)/...`.
- Added locale-aware root layout at `app/(localized)/[locale]/layout.js` to server-render `<html lang>` and `<html dir>` by locale (`en/ltr`, `heb -> he/rtl`).
- Kept public URL structure unchanged (route groups are pathless in Next.js).
- Why we changed it:
- Ahrefs reported hreflang present but missing HTML language signal; this change ensures crawler-visible `lang/dir` is emitted in SSR HTML.
- What we observed (data/source):
- Localhost checks on `2026-02-25` confirmed on key routes:
- `200` responses on localized live/global/history/feed pages and static pages.
- Correct SSR HTML language signals:
- `/en/...` -> `<html lang="en" dir="ltr">`
- `/heb/...` -> `<html lang="he" dir="rtl">`
- Canonical + `hreflang` alternates (`en`, `he`, `x-default`) present on tested localized pages.
- Redirect/namespace normalization still valid:
- `/us` -> `/en/us`, `/global` -> `/en/global`, `/{invalid-locale}/...` -> `/en/...` (`307`).
- Crawl entry points healthy:
- `robots.txt` and sitemap endpoints return `200` with expected content types.
- Decision:
- Keep the route-group nesting and locale layout approach; no breaking SEO regression observed in local crawlability checks.
- Next step:
- After deployment, verify the same signals on production URLs and monitor GSC for recrawl/index movement rather than immediate ranking changes.

### 2026-02-26 (Idea Log: Ads API + Procedural Archive Relevance Layer)
- What changed:
- Logged a candidate strategy to use Google Ads API keyword planning signals to identify demand patterns by archive intent, then procedurally apply constrained, page-relevant copy adjustments across archive templates (AI-assisted).
- Explicitly framed this as optimization of relevance signals, not manual one-off keyword editing per page.
- Why we changed it:
- Current indexing constraints and archive scale make ad hoc/manual page tuning impractical; demand-informed procedural updates may improve query-fit while preserving product-truth archive structure.
- What we observed (data/source):
- Team discussion flagged that live pages are designed for short "glance" behavior by intent, and that archive SEO work must avoid generic engagement assumptions.
- Team constraint confirmed: true controlled indexing tests are not feasible at this scale because crawler/index selection cannot be experimentally controlled.
- Decision:
- Keep this as a strategic idea to revisit once Ads API access and guardrails are ready; treat rollout as iterative optimization under real crawler conditions, not as A/B-style controlled indexing experimentation.
- Next step:
- If pursued, define strict quality constraints for procedural copy generation (factual, date/country-specific, low template duplication risk) before any broad deployment.

### 2026-02-26 (Feed Page Ground-Truth Check to Prevent Repeated Advice)
- What changed:
- Verified current feed implementation already includes explicit archive-intent anchors and SSR context text; recorded this as established baseline.
- Why we changed it:
- Repeated recommendations about adding basic archive-intent copy/internal context were no longer accurate and created noise in strategy discussions.
- What we observed (data/source):
- In `app/(localized)/[locale]/[country]/[date]/feed/FeedView.js`, feed pages already render an intro block stating page purpose (main-headline archive), country, date, and headline count.
- In `app/(localized)/[locale]/[country]/[date]/feed/page.js`, metadata already includes country/date/headline-aware title logic, canonical + hreflang alternates, and index/follow directives.
- In `app/(localized)/[locale]/[country]/[date]/feed/FeedTopbar.js`, the current daily headline is rendered as `h1`.
- In `app/(localized)/[locale]/[country]/[date]/feed/FeedJsonLd.js`, structured data already models feed pages as `CollectionPage` with archive-oriented context, `mainEntity`, `hasPart`, breadcrumb, and series linkage.
- Decision:
- Treat "add archive-intent copy/internal context on feed pages" as already implemented; do not re-propose as a primary next step unless a specific regression is found.
- Next step:
- Focus future feed SEO discussions on unresolved issues (query mapping quality at low volume, indexing selection behavior, and demand-to-template alignment), not baseline copy presence.

### 2026-02-26 (Non-Feed Crawl Reduction: JSON-LD + Sitemap Adjustment)
- What changed:
- Removed feed JSON-LD breadcrumb reference to non-feed date URL (`/{locale}/{country}/{date}`) and kept breadcrumb target on the feed URL only.
- Deprecated `sitemap-date-pages.xml` output so it now returns an empty `urlset` (no non-feed date URLs advertised).
- Why we changed it:
- Vercel observability showed substantial crawler activity on non-feed date routes even though feed pages are the intended indexing target.
- What we observed (data/source):
- Feed JSON-LD previously linked to non-feed date URL in breadcrumb item position 3.
- A dedicated `sitemap-date-pages.xml` route was still generating non-feed date URLs at scale.
- Local verification on `localhost:3000` confirmed:
- `/sitemap.xml` lists only static/feed/archive/global-archive sitemaps.
- `/sitemap-date-pages.xml` is valid but empty.
- Feed page URL checks no longer expose non-feed date URL from feed JSON-LD breadcrumb path.
- User-facing behavior remains unchanged by this step:
- Feed pages still expose intentional links to the interactive non-feed time-machine route (for example via `FeedFooter` "Time Machine View" and feed popup link).
- Decision:
- Keep user-facing links to non-feed time-machine pages (product UX), while reducing machine-discovery signals for non-feed URLs.
- Next step:
- Monitor Vercel observability and GSC crawl trends to confirm non-feed crawler share declines over the next recrawl window.

### 2026-02-26 (Trust/EEAT Surface Expansion: Legal + Contact + Footer Standardization)
- What changed:
- Added a new static legal page at `/legal` with Terms of Use, scraping-method explanation, copyright/source-rights boundaries, privacy section, and contact references.
- Added a new static contact page at `/contact` with a simple submission form (name/email/topic/message) and `ContactPage` metadata/JSON-LD.
- Added backend endpoint `/api/contact` to accept contact submissions and store them in Firestore (`- metadata -/contact/submissions`) with basic validation and anti-spam honeypot field.
- Standardized static trust pages to use `UniversalFooter` (about/methodology/legal/contact), including explicit footer links to Legal and Contact.
- Updated footer wording/UX details: "select country" label on about/legal contexts, right-side action-group dividers, and contact mail icon usage.
- Why we changed it:
- Increase visible trust/completeness signals (entity transparency, policies, contactability) while keeping site UX consistent and lightweight during ongoing indexing pressure.
- What we observed (data/source):
- Local build validation succeeded with lint disabled (`next build --no-lint`) and generated routes include `/legal`, `/contact`, and `/api/contact`.
- Default `next build` still fails in this environment on known ESLint parser serialization issue (`Cannot serialize key "parse" in parser`), consistent with prior non-blocking tooling noise.
- Decision:
- Keep legal/contact pages live as trust hygiene and crawlable static endpoints; treat contact form storage as interim ingestion layer until final delivery channel (email/dashboard/webhook) is selected.
- Next step:
- Decide message handling path for contact submissions (email forwarding vs admin inbox vs webhook) and then wire operational alerting/triage.

## Update Template
Copy this template for each new entry:

```
### YYYY-MM-DD
- What changed:
- Why we changed it:
- What we observed (data/source):
- Decision:
- Next step:
```
