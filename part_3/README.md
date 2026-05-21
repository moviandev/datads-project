# Part 3 — Query API Layer

## How it works

REST API that queries the SQLite database populated by Part 2 and returns aggregated ad performance metrics. CTR, CPC and ROAS are calculated on-the-fly in SQL, consistent with the system design.

## Running

First run Part 2 to populate the database, then:

```bash
npm run serve
# Server starts on http://localhost:3000
```

For hot reload during development:

```bash
npm run serve:dev
```

## Endpoints

### GET /api/performance

Returns aggregated metrics. All parameters are optional.

```bash
# All data
curl http://localhost:3000/api/performance

# Filter by platform
curl "http://localhost:3000/api/performance?platform=facebook"

# Filter by date range
curl "http://localhost:3000/api/performance?date_from=2026-04-21&date_to=2026-05-21"

# Filter by campaign
curl "http://localhost:3000/api/performance?campaign_id=fb_camp_123"
```

**Parameters:**
- `platform` — `facebook` | `google` | `tiktok`
- `date_from` — `YYYY-MM-DD`
- `date_to` — `YYYY-MM-DD`
- `campaign_id` — string

### GET /api/top-performing

Returns top ads sorted by a metric. `metric` is required.

```bash
# Top 10 by ROAS (default)
curl "http://localhost:3000/api/top-performing?metric=roas"

# Top 5 by CTR ascending
curl "http://localhost:3000/api/top-performing?metric=ctr&order=asc&limit=5"

# Top 10 by revenue, Facebook only
curl "http://localhost:3000/api/top-performing?metric=revenue&platform=facebook"
```

**Parameters:**
- `metric` (required) — `ctr` | `cpc` | `roas` | `clicks` | `revenue`
- `order` — `asc` | `desc` (default: `desc`)
- `limit` — 1–100 (default: `10`)
- `platform` — `facebook` | `google` | `tiktok`
- `date_from` — `YYYY-MM-DD`
- `date_to` — `YYYY-MM-DD`

## Validation

Both endpoints return `400` with descriptive messages for invalid inputs:

```bash
# Invalid metric
curl "http://localhost:3000/api/top-performing?metric=invalid"
# → {"error":{"metric":["Invalid option: expected one of \"ctr\"|\"cpc\"|\"roas\"|\"clicks\"|\"revenue\""]}}

# Invalid date format
curl "http://localhost:3000/api/performance?date_from=01-01-2026"
# → {"error":{"date_from":["date_from must be YYYY-MM-DD"]}}
```

## Key design decisions

**On-the-fly calculation:** Instead of storing pre-calculated CTR, CPC, and ROAS metrics, I opted to compute them directly in SQL (`CASE WHEN`). This ensures data consistency and means that if the business formula changes in the future, we don't need to reprocess historical data.

**Strict validation:** All request query parameters are validated and typed using Zod. By explicitly whitelisting the `metric` and `order` fields before interpolating them into the raw SQL query, the API is protected against SQL injection.

**Dependency injection:** The route handlers receive the data repository via factory functions (`createPerformanceRouter`, `createTopPerformingRouter`). This decouples the Express routing logic from the database implementation, making it trivial to mock the repository for unit testing.

## Testing strategy

Due to the time limit, I focused on delivering a robust architecture and clean implementation. In a real-world scenario, I would implement:

- **Unit Tests:** For the Zod validation schemas and to ensure the route factories correctly wire up dependencies.
- **Integration Tests:** Firing requests at the Express app using `supertest`, with a mocked `AdQueryRepository` to ensure the API returns the correct HTTP status codes and JSON structure without hitting a real database.
- **Database Tests:** Testing the actual SQL queries in `AdQueryImplementationRepository` against an in-memory SQLite database populated with seed data to verify that the `SUM` and `CASE WHEN` mathematical calculations match the expected aggregates.
