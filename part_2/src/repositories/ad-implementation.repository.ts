import { AdRecord } from '../entities';
import { AdRepository } from './ad.repository';
import { getDb } from '../db/database';

export class AdImplementationRepository implements AdRepository {
  upsert(records: AdRecord[]): { inserted: number; updated: number } {
    const db = getDb();

    const upsertStmt = db.prepare(`
      INSERT INTO ad_performance
        (ad_id, campaign_id, platform, date, impressions, clicks, spend, revenue, conversions)
      VALUES
        (@ad_id, @campaign_id, @platform, @date, @impressions, @clicks, @spend, @revenue, @conversions)
      ON CONFLICT(campaign_id, date, platform) DO UPDATE SET
        impressions = excluded.impressions,
        clicks      = excluded.clicks,
        spend       = excluded.spend,
        revenue     = excluded.revenue,
        conversions = excluded.conversions,
        ingested_at = datetime('now')
    `);

    let processed = 0;

    db.transaction((rows: AdRecord[]) => {
      for (const row of rows) {
        const info = upsertStmt.run(row);
        if (info.changes > 0) processed++;
      }
    })(records);

    return { inserted: processed, updated: 0 };
  }
}
