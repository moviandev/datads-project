import { AdRecord } from './ad-record.entity';

export interface AdMetrics extends AdRecord {
  ctr: number;
  cpc: number;
  roas: number;
}
