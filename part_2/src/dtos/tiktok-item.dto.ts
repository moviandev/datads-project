import { TiktokCampaign } from './tiktok-campaign.dto';
import { TiktokPerformance } from './tiktok-performance.dto';

export interface TiktokItem {
  campaign: TiktokCampaign;
  performance: TiktokPerformance;
}
