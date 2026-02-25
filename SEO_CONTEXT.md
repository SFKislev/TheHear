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
