import { Platform } from '../../../part_2/src/types';

export interface PerformanceFilters {
  platform?: Platform;
  dateFrom?: string;
  dateTo?: string;
  campaignId?: string;
}
