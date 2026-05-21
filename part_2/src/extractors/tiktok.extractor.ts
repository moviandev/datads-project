import { BaseExtractor } from './base.extractor';
import { AdRepository } from '../repositories';
import { fetchWithRetry } from '../utils';
import { AdRecord } from '../entities';
import { TiktokResponse } from '../dtos';

const PAGE_LIMIT = 25;

export class TiktokExtractor extends BaseExtractor {
  constructor(repository: AdRepository) {
    super('tiktok', repository);
  }

  async extractData(startDate: string, endDate: string): Promise<void> {
    console.log(`[${this.platformName}] Starting extraction ${startDate} → ${endDate}`);

    const records: AdRecord[] = [];
    let offset = 0;
    let page = 1;

    while (true) {
      console.log(`[${this.platformName}] page=${page} offset=${offset}`);

      const {
        data: { performance_data, has_more },
      } = await fetchWithRetry<TiktokResponse>('/v1/ad/performance', {
        headers: { Authorization: 'Bearer tiktok_test_token_789' },
        params: { date_from: startDate, date_to: endDate, offset, limit: PAGE_LIMIT },
      });

      for (const item of performance_data) {
        records.push({
          ad_id: item.campaign.ad_id,
          campaign_id: item.campaign.id,
          platform: 'tiktok',
          date: item.performance.date,
          impressions: item.performance.views,
          clicks: item.performance.engagements,
          spend: item.performance.budget_spent,
          revenue: item.performance.purchase_value,
          conversions: item.performance.purchases,
        });
      }

      if (!has_more || performance_data.length === 0) break;
      offset += PAGE_LIMIT;
      page++;
    }

    const { inserted, updated } = this.repository.upsert(records);
    console.log(`[${this.platformName}] inserted=${inserted} updated=${updated}`);
  }
}
