import { AdMetrics } from '../../../part_2/src/entities';
import { getDb } from '../../../part_2/src/db/database';
import { AggregatedMetrics, PerformanceFilters, TopPerformingFilters } from '../types';
import { AdQueryRepository } from './ad-query.repository';

export class AdQueryImplementationRepository implements AdQueryRepository {
  getPerformance(filters: PerformanceFilters): AggregatedMetrics {
    const db = getDb();

    const conditions: string[] = [];
    const params: Record<string, string> = {};

    if (filters.platform) {
      conditions.push('platform = @platform');
      params.platform = filters.platform;
    }
    if (filters.dateFrom) {
      conditions.push('date >= @dateFrom');
      params.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      conditions.push('date <= @dateTo');
      params.dateTo = filters.dateTo;
    }
    if (filters.campaignId) {
      conditions.push('campaign_id = @campaignId');
      params.campaignId = filters.campaignId;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const row = db
      .prepare(
        `
      SELECT
        SUM(impressions)                                                    AS totalImpressions,
        SUM(clicks)                                                         AS totalClicks,
        SUM(spend)                                                          AS totalSpend,
        SUM(revenue)                                                        AS totalRevenue,
        CASE WHEN SUM(impressions) > 0 THEN CAST(SUM(clicks) AS REAL) / SUM(impressions) ELSE 0 END AS averageCtr,
        CASE WHEN SUM(clicks) > 0      THEN SUM(spend) / SUM(clicks)       ELSE 0 END AS averageCpc,
        CASE WHEN SUM(spend) > 0       THEN SUM(revenue) / SUM(spend)      ELSE 0 END AS averageRoas
      FROM ad_performance ${where}
    `,
      )
      .get(params) as AggregatedMetrics;

    return {
      totalImpressions: row.totalImpressions ?? 0,
      totalClicks: row.totalClicks ?? 0,
      totalSpend: row.totalSpend ?? 0,
      totalRevenue: row.totalRevenue ?? 0,
      averageCtr: row.averageCtr ?? 0,
      averageCpc: row.averageCpc ?? 0,
      averageRoas: row.averageRoas ?? 0,
    };
  }

  getTopPerforming(filters: TopPerformingFilters): { rows: AdMetrics[]; total: number } {
    const db = getDb();

    const conditions: string[] = [];
    const params: Record<string, string | number> = {};

    if (filters.platform) {
      conditions.push('platform = @platform');
      params.platform = filters.platform;
    }
    if (filters.dateFrom) {
      conditions.push('date >= @dateFrom');
      params.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      conditions.push('date <= @dateTo');
      params.dateTo = filters.dateTo;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { total } = db
      .prepare(
        `
    SELECT COUNT(*) AS total FROM ad_performance ${where}
  `,
      )
      .get(params) as { total: number };

    params.limit = filters.limit;

    const rows = db
      .prepare(
        `
    SELECT
      ad_id, campaign_id, platform, date, impressions, clicks, spend, revenue, conversions,
      CASE WHEN impressions > 0 THEN CAST(clicks AS REAL) / impressions ELSE 0 END AS ctr,
      CASE WHEN clicks > 0      THEN spend / clicks                     ELSE 0 END AS cpc,
      CASE WHEN spend > 0       THEN revenue / spend                    ELSE 0 END AS roas
    FROM ad_performance ${where}
    ORDER BY ${filters.metric} ${filters.order.toUpperCase()}
    LIMIT @limit
  `,
      )
      .all(params) as AdMetrics[];

    return { rows, total };
  }
}
