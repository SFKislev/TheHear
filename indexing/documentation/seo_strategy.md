# SEO Strategy - The Hear

## Context Summary

- The site is a timestamped headline archive and dashboard. Indexing only the last X days is self-defeating for the core product.
- Current symptoms: growing "Crawled - currently not indexed" and de-indexing patterns on thehear.org.
- Past diagnosis suggests technical signals (dynamic rendering / cache headers / redirects) and authority signals can both contribute.

This plan prioritizes verifiable causes and removes unstable behaviors that can trigger de-indexing.

---

## Current Status (February 2026)

### Phase 0 - Verification: COMPLETE
- Response headers and route classification confirmed.
- Feed routes verified as static/ISR in production builds.

### Phase 1 - Make Feed Routes Deterministic: COMPLETE
- `headers()` / `cookies()` removed from feed routes.
- `export const dynamic = 'error'` enforced on feed/page.js (fails build if route becomes dynamic).
- `export const revalidate = 604800` (7-day ISR) set on feed routes.
- Metadata uses `new Date()` only for choosing data source (JSON vs Firestore), not for output content. Metadata output is deterministic for any given date — same title, description, and structured data regardless of when the page is built.

### Phase 2 - Sitemap Correctness: COMPLETE
- Full archive in `sitemap-feed.xml` (no last-X-days cap).
- Strategic 60-day window in `sitemap-feed-recent.xml` for authority-building prioritization.
- Hebrew URLs remain in sitemaps with proper `hreflang` alternates declared in page metadata. Google handles locale-variant redirects correctly via hreflang signals; excluding them is unnecessary.

### Phase 3 - Authority Signals: PARTIAL
- `/about` page exists with `force-static`, proper metadata, and JSON-LD (AboutPage schema).
- `/methodology` page exists with `force-static`, proper metadata, and JSON-LD (WebPage schema).
- `/contact` page not added — low value for a headline archive site.
- Backlink / external citation work is ongoing and outside the codebase.

### Phase 4 - Monitoring: NOT YET IMPLEMENTED
- No automated monitoring pipeline exists.
- See Monitoring section below for plan.

---

## Monitoring Plan

### What to track

- **"Crawled - currently not indexed" count** — the primary symptom. Weekly trend.
- **Indexed page count** — should grow steadily as archive expands.
- **Crawl stats** — pages crawled per day, response codes, crawl budget usage.
- **Search Analytics** — impressions and clicks on archive/feed URLs vs country landing pages.

### How to track

The service account key is available at `indexing/documentation/service-account-key.json`.
Use it to query GSC data programmatically:

- Verify the GSC API is enabled for the correct project in Google Cloud Console.
- Add the service account email (from the JSON) as a user on the GSC property (Owner or Full).
- Build a small script to pull:
  - Index coverage counts by reason (e.g., "Crawled - currently not indexed")
  - Search Analytics for impressions/clicks segmented by URL pattern
  - URL Inspection results for sample archive URLs
- Run weekly (or via cron/scheduled action) and log results for trend tracking.

### Manual spot checks

- Use GSC URL Inspection on a few "crawled - not indexed" URLs to verify: canonical, response headers, rendered HTML.
- Check that archive pages return `Cache-Control: public` headers in production.

---

## Resolved Items

The following items from the original plan have been addressed and no longer require action:

- `headers()` removal from feed routes — done.
- `cookies()` removal — confirmed not used in feed/archive routes.
- `dynamic = 'error'` on feed routes — done.
- Full-archive sitemap — done.
- Trust pages (`/about`, `/methodology`) — done.
- `new Date()` in metadata — investigated; only affects data source selection, not output. Not a real determinism issue.
