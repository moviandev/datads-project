import { BaseExtractor } from './base.extractor';
import { AdRepository } from '../repositories';
import { fetchWithRetry, computeMetrics } from '../utils';
import { AdRecord } from '../entities';
import { GoogleResponse } from '../dtos';

const PAGE_SIZE = 50;

export class GoogleExtractor extends BaseExtractor {
  constructor(repository: AdRepository) {
    super('google', repository);
  }

  async extractData(startDate: string, endDate: string): Promise<void> {
    console.log(`[${this.platformName}] Starting extraction ${startDate} → ${endDate}`);

    const records: AdRecord[] = [];
    let pageToken: string | undefined;
    let page = 1;

    while (true) {
      const params: Record<string, string | number> = {
        start_date: startDate,
        end_date: endDate,
        page_size: PAGE_SIZE,
      };
      if (pageToken) params.page_token = pageToken;

      console.log(`[${this.platformName}] page=${page}`);

      const {
        data: { reports, nextPageToken },
      } = await fetchWithRetry<GoogleResponse>('/api/reports/campaigns', {
        headers: { Authorization: 'Bearer google_test_token_456' },
        params,
      });

      for (const item of reports) {
        records.push({
          ad_id: item.adId,
          campaign_id: item.campaignId,
          platform: 'google',
          date: item.date,
          impressions: item.metrics.impressions,
          clicks: item.metrics.clicks,
          spend: item.metrics.cost,
          revenue: item.metrics.conversionValue,
          conversions: item.metrics.conversions,
        });
      }

      if (!nextPageToken || reports.length === 0) break;

      pageToken = nextPageToken;
      page++;
    }

    const { inserted, updated } = this.repository.upsert(records);
    console.log(`[${this.platformName}] inserted=${inserted} updated=${updated}`);
  }
}
