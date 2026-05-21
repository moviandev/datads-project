# Part 1 - System Design & Architecture

## Architectural Overview
The system is designed with a decoupled, event-driven architecture to ensure high reliability, scalability, and compliance to external API rate limits. Instead of a monolithic approach where cron jobs directly execute data fetching, the ingestion pipeline is entirely separated from the serving API layer.

## Key Architectural Decisions & The "Why"

### 1. Handling Different Polling Frequencies
To support platform-specific polling frequencies (e.g., Facebook every 1h, TikTok every 2h), the system utilizes a **Central Scheduler** (like AWS EventBridge or NodeCron). Instead of managing multiple separate cron servers, we define specific rules that trigger events and place them into the Message Broker. 

### 2. Rate Limiting, Resiliency, and DLQs
The core challenge of API polling is network instability and rate limits. 
* By using a **Message Broker (SQS/RabbitMQ)**, we control the concurrency of our Node.js Ingestion Workers, ensuring we don't overwhelm the external APIs. 
* The workers implement an **Exponential Backoff** strategy for transient errors (429 Rate Limits or 5xx Server Errors).
* If an extraction repeatedly fails, the message is routed to a **Dead Letter Queue (DLQ)** for logging, alerting, and manual review, ensuring zero silent data loss.

### 3. Data Integrity & Deduplication (Idempotency)
Data pipelines must be idempotent. The Workers only normalize the data and perform `UPSERT` operations into the **Relational Database** (e.g., PostgreSQL or TimescaleDB). By enforcing a `UNIQUE` constraint on `(platform, ad_id, date)`, we guarantee that even if a job runs twice for the same period, the data will simply be updated, never duplicated.

**Implementation note:** In the prototype (Part 2), the unique constraint uses `(campaign_id, date, platform)` instead of `(ad_id, date, platform)`. This is because the mock API returns random `ad_id` values on each request, making them unsuitable as a deduplication key. In production, with real ad platform APIs where `ad_id` is stable and globally unique, the constraint would use `(ad_id, date, platform)` as originally designed.

### 4. The "Non-Additive Metrics" Trap
A crucial design decision is **separating raw data from calculated metrics**. 
The Ingestion Workers only persist absolute, additive metrics (`impressions`, `clicks`, `spend`, `revenue`). Metrics like CTR, CPC, and ROAS are *rates* and cannot be simply summed or averaged across multiple days or campaigns. Therefore, these calculations are performed **on-the-fly** by the Query API Layer during read time.

### 5. Scalable Query API Layer
The serving layer is entirely stateless. It sits behind a **Load Balancer** and can scale horizontally to handle thousands of requests per second. To further optimize read performance and reduce the load on the primary database, a **Redis Cache** (with a short TTL, e.g., 5 minutes) is implemented to serve highly requested aggregated reports instantly.

### 6. Observability & Monitoring
The most critical signal in this pipeline is queue depth. If it grows consistently, it means workers are being throttled by external APIs, not that the system is broken. This distinction matters for incident response: the fix is backoff tuning, not scaling workers.

Beyond that, the system tracks:

- **Ingestion latency per platform**: TikTok and Facebook have different SLA behaviors; alerting per-platform catches API degradation early
- **DLQ message rate**: a spike here means a platform changed its API contract or auth failed, not a transient error
- **Cache hit ratio**: a drop signals either a TTL misconfiguration or a traffic pattern change worth investigating
- **Worker throughput vs. API error rate**: tracked together, not in isolation, since a drop in throughput without errors usually means rate limiting with silent 200s (which some ad APIs do)

Logs and metrics are centralized via CloudWatch, Datadog, or Grafana. Alerts are tied to DLQ growth and ingestion lag, not just uptime.