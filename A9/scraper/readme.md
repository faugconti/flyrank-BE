# The Polite Scraper

A web scraper for `books.toscrape.com`, built for the FlyRank Backend Track — Week 5, Assignment A9: The Polite Scraper. Crawls the first three catalogue pages (60 books), extracts each book's details, validates every record against a Zod schema, and reports honest per-run numbers.

## Target Classification

* **Site**: `https://books.toscrape.com/`
* **Why**: Books to Scrape is a web scraping sandbox intended for practicing web scraping. The site's parent page identifies it as a "Web Scraping Sandbox", making it an appropriate and permitted target for this assignment.
* **Scope**: First three catalogue pages (60 book detail pages)
* **Data structure of each book**:
    * Title
    * Price
    * Image url
    * Rating
    * Description
    * Availability
    * Category
    * UPC
    * URL
* **Why is it appropriate**: This site was designed with educational purposes and it does not hold any sensible data and at the same time simulates a real e-commerce allowing us to structure a real scraping flow:
    1. Navigate between categories
    2. Follow links to products
    3. Extract product information
    4. Handle pagination
    5. Save data in file/database
* **Output**: `output/books.json`, `output/errors.json`, `output/run-report.json`
* **Robots.txt**: `No robots file found` in the site

## Install & Run

Requires Node.js (ESM). The only dependencies are `cheerio` (HTML parsing) and `zod` (record validation).

```sh
npm install && node src/index.js
```

Every run ends with three files in `output/`:

* `books.json` — validated records (the only place good records land)
* `errors.json` — schema-rejected records with the reason for each; rejected records never reach `books.json`
* `run-report.json` — run numbers: start time, duration, pages fetched, cache hits, valid records, invalid records, failed pages

A real run report, straight from `output/run-report.json`:

```json
{
  "started_at": "2026-08-11T14:57:17.265Z",
  "duration_ms": 582,
  "pages_fetched": 0,
  "cache_hits": 63,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 0
}
```

This assignment needed no browser: the data is already in the HTML the server sends, so a browser would only add cost.

## Record Schema

Defined in `src/schema.js` and enforced with Zod before any record is stored. A record that fails validation goes to `errors.json` with its reasons.

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | |
| `product_url` | string (URL) | ✅ | Canonical record identity |
| `price_text` | string | ✅ | Raw text, e.g. `"£51.77"` |
| `price_gbp` | number | ✅ | Clean value, e.g. `51.77` |
| `availability_text` | string | ✅ | |
| `rating_text` | string | ✅ | e.g. `"Three"` |
| `description` | string \| null | ⬜ | Optional |
| `source_page` | string (URL) | ✅ | Catalogue page the book was found on |
| `fetched_at` | ISO 8601 datetime | ✅ | |

## Politeness Rules

* **User-Agent**: `FlyRankInternshipA9/1.0 (https://github.com/faugconti/flyrank-BE)` — identifies the bot and points back to a contactable repo
* **Delay**: 500 ms sleep after every network fetch
* **Timeout**: 5 s per request (`AbortSignal.timeout`)
* **Retry**: exactly one retry after 1 s, and only for timeouts and HTTP 5xx. 4xx is never retried — a 404 will not appear by asking again, and a 403 means the site said no
* **Cache**: disk cache under `cache/` with a `fetched_at` metadata file per page — a cached page is never re-fetched. Failure scenarios are tested locally (stubbed fetch, synthetic URLs), never by hammering the real site

## Known Limitation

The cache never expires. `fetched_at` is recorded but not enforced, so a page cached once is served forever — even if the site changes. 

---

## Ethics

* Use an official API when one exists — scraping is a fallback, not a first choice
* Never bypass logins, paywalls, or blocks — if a site does not want to be read, that is the answer
* Collect only what you need — every field stored is one someone had to serve and I chose to keep

---
*I will not reuse this code on another site without checking its rules and terms first*
