import { GoogleMetrics } from './google-metrics.dto';

export interface GoogleReport {
  campaignId: string;
  adGroupId: string;
  adId: string;
  date: string;
  metrics: GoogleMetrics;
}
