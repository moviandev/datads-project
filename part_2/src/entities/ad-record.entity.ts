import { Platform } from '../types';

export interface AdRecord {
  ad_id: string;
  campaign_id: string;
  platform: Platform;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  revenue: number;
  conversions: number;
}
