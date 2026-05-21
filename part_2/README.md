# Part 2 — Data Extraction and Processing

## How it works

Polls Facebook, Google Ads and TikTok APIs for the last 30 days, normalizes the data into a unified schema, and persists it in a SQLite database.

## Running

```bash
npm run extract
```

## Key design decisions

**Extractor Pattern:** Each platform implements a `BaseExtractor` but handles its own pagination features (cursor, page token, or offset). This makes it straightforward to integrate new platforms in the future without touching the core extraction flow.

**Resilient HTTP Client:** To handle the unstable mock API, the `fetchWithRetry` wrapper implements exponential backoff with random jitter. This avoids the "thundering herd" problem and gracefully handles 429 (Rate Limit) and 5xx errors.

**Deduplication Strategy:** Instead of complex application-level checks, I delegated deduplication to the database using SQLite's `ON CONFLICT DO UPDATE`. This guarantees idempotency: we can safely re-run the extractor for the same date range without duplicating metrics. *(Note: in production, this relies on stable ad IDs, which the mock API sometimes randomizes, but the logic holds for real-world APIs).*

**On-the-fly metrics:** CTR, CPC, and ROAS are intentionally omitted from the database schema. They are calculated dynamically to ensure data integrity and avoid anomalies if the business formulas change later.

## Known limitations

- `Platform` type is shared via relative import between part_2 and part_3. In a production setup this would live in a `@datads/shared` package using npm workspaces or a monorepo tool like Turborepo.
- Response validation from external APIs (Facebook, Google, TikTok) is not implemented. In production, Zod schemas would validate the API response shape before processing to catch unexpected format changes early.
