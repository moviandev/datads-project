import { BaseExtractor } from './base.extractor';
import { AdRepository } from '../repositories';
import { fetchWithRetry } from '../utils';
import { AdRecord } from '../entities';
import { FacebookResponse } from '../dtos';

const CAMPAIGN_IDS = ['fb_camp_123', 'fb_camp_456', 'fb_camp_789'];
const PAGE_LIMIT = 100;

export class FacebookExtractor extends BaseExtractor {
  constructor(repository: AdRepository) {
    super('facebook', repository);
  }

  async extractData(startDate: string, endDate: string): Promise<void> {
    console.log(`[${this.platformName}] Starting extraction ${startDate} → ${endDate}`);

    for (const campaignId of CAMPAIGN_IDS) {
      try {
        await this.extractCampaign(campaignId, startDate, endDate);
      } catch (error: any) {
        console.error(`[${this.platformName}] campaign=${campaignId} failed: ${error.message}`);
      }
    }
  }

  private async extractCampaign(
    campaignId: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    const records: AdRecord[] = [];
    let cursor: string | undefined;
    let page = 1;

    while (true) {
      const params: Record<string, string | number> = {
        since: startDate,
        until: endDate,
        limit: PAGE_LIMIT,
      };
      if (cursor) params.after = cursor;

      console.log(`[${this.platformName}] campaign=${campaignId} page=${page}`);

      const {
        data: { data, paging },
      } = await fetchWithRetry<FacebookResponse>(`/api/v1/campaigns/${campaignId}/insights`, {
        headers: { 'x-api-key': 'facebook_test_key_123' },
        params,
      });

      for (const item of data) {
        records.push({
          ad_id: item.ad_id,
          campaign_id: item.campaign_id,
          platform: 'facebook',
          date: item.date,
          impressions: item.impressions,
          clicks: item.clicks,
          spend: item.spend,
          revenue: item.revenue,
          conversions: item.conversions,
        });
      }

      if (!paging?.next || data.length === 0) break;
      cursor = paging.next;
      page++;
    }

    const { inserted, updated } = this.repository.upsert(records);
    console.log(
      `[${this.platformName}] campaign=${campaignId} inserted=${inserted} updated=${updated}`,
    );
  }
}
